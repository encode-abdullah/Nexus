import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FileText, Upload, Trash2, Pen, Eye, X, Download } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface DocumentItem {
  _id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  ownerId: { _id: string; name: string; email: string };
  uploadedBy: { _id: string; name: string; email: string };
  version: number;
  status: 'draft' | 'pending_signature' | 'signed' | 'archived';
  shared: boolean;
  signatures: Array<{
    userId: { _id: string; name: string; email: string };
    signedAt: string;
    signatureImage: string;
  }>;
  createdAt: string;
}

// Canvas-based Signature Pad Component
const SignaturePad: React.FC<{ onSign: (dataUrl: string) => void; onClear: () => void }> = ({ onSign, onClear }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDraw = () => setIsDrawing(false);

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    onClear();
  };

  const save = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSign(dataUrl);
  };

  return (
    <div className="space-y-3">
      <canvas
        ref={canvasRef}
        width={400}
        height={150}
        className="border border-gray-300 rounded-md cursor-crosshair w-full"
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={stopDraw}
        onMouseLeave={stopDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={stopDraw}
      />
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={clear}>Clear</Button>
        <Button size="sm" onClick={save}>Save Signature</Button>
      </div>
    </div>
  );
};

export const DocumentsPage: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [showSignModal, setShowSignModal] = useState<DocumentItem | null>(null);

  useEffect(() => { fetchDocuments(); }, []);

  const fetchDocuments = async () => {
    try {
      const response = await api.get('/documents');
      setDocuments(response.data.documents);
    } catch {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setUploading(true);
    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append('file', file);
    try {
      await api.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Document uploaded successfully');
      setShowUploadModal(false);
      fetchDocuments();
    } catch {
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    noClick: false,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    }
  });

  const handleSign = async (docId: string, signatureImage: string) => {
    try {
      await api.post(`/documents/${docId}/sign`, { signatureImage });
      toast.success('Document signed successfully');
      setShowSignModal(null);
      fetchDocuments();
    } catch {
      toast.error('Failed to sign document');
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await api.delete(`/documents/${docId}`);
      toast.success('Document deleted');
      fetchDocuments();
    } catch {
      toast.error('Failed to delete document');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'signed': return 'success';
      case 'pending_signature': return 'warning';
      case 'draft': return 'primary';
      case 'archived': return 'gray';
      default: return 'gray';
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText size={24} className="text-red-500" />;
    if (type.includes('image')) return <Eye size={24} className="text-blue-500" />;
    return <FileText size={24} className="text-primary-600" />;
  };

  const isPreviewable = (type: string) => type.includes('pdf') || type.includes('image');

  if (loading) {
    return <div className="text-center py-12"><p className="text-gray-500">Loading documents...</p></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600">Manage your important files and e-signatures</p>
        </div>
        <Button leftIcon={<Upload size={18} />} onClick={() => setShowUploadModal(true)}>Upload Document</Button>
      </div>

      {/* Stats */}
      <Card>
        <CardBody className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-50 rounded-full"><FileText size={24} className="text-primary-600" /></div>
              <div>
                <p className="text-sm text-gray-500">Total Documents</p>
                <p className="text-lg font-semibold text-gray-900">{documents.length}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">Signed</p>
                <p className="text-lg font-semibold text-green-600">{documents.filter(d => d.status === 'signed').length}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-lg font-semibold text-yellow-600">{documents.filter(d => d.status === 'pending_signature').length}</p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Document List */}
      <Card>
        <CardHeader><h2 className="text-lg font-medium text-gray-900">All Documents</h2></CardHeader>
        <CardBody>
          {documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No documents yet</p>
              <p className="text-sm text-gray-400 mt-1">Upload your first document to get started</p>
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map(doc => (
                <div key={doc._id} className="flex items-center p-4 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                  <div className="p-2 bg-gray-50 rounded-lg mr-4">{getFileIcon(doc.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{doc.name}</h3>
                      <Badge variant={getStatusColor(doc.status) as any} size="sm">{doc.status.replace('_', ' ')}</Badge>
                      {doc.shared && <Badge variant="secondary" size="sm">Shared</Badge>}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span>{formatFileSize(doc.size)}</span>
                      <span>v{doc.version}</span>
                      <span>{format(new Date(doc.createdAt), 'MMM d, yyyy')}</span>
                      {doc.signatures.length > 0 && <span className="text-green-600">{doc.signatures.length} signature(s)</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {isPreviewable(doc.type) && (
                      <Button variant="ghost" size="sm" className="p-2" onClick={() => setSelectedDoc(doc)}>
                        <Eye size={18} />
                      </Button>
                    )}
                    {doc.status !== 'signed' && doc.ownerId._id === user?.id && (
                      <Button variant="ghost" size="sm" className="p-2" onClick={() => setShowSignModal(doc)}>
                        <Pen size={18} />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="p-2 text-error-600 hover:text-error-700" onClick={() => handleDelete(doc._id)}>
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Document</h2>
            <div
              {...getRootProps()}
              onClick={(e) => {
                getRootProps().onClick?.(e as any);
                if (!e.defaultPrevented) {
                  fileInputRef.current?.click();
                }
              }}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'}`}
            >
              <input {...getInputProps()} ref={fileInputRef} />
              <Upload size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">{isDragActive ? 'Drop your file here' : 'Drag & drop a file, or click to select'}</p>
              <p className="text-sm text-gray-400 mt-2">PDF, DOC, DOCX, JPG, PNG up to 10MB</p>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                className="mt-3 px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 underline"
              >
                Browse files
              </button>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowUploadModal(false)}>Cancel</Button>
              <Button isLoading={uploading}>Upload</Button>
            </div>
          </div>
        </div>
      )}

      {/* PDF/Image Preview Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold text-gray-900">{selectedDoc.name}</h2>
              <div className="flex items-center gap-2">
                <Badge variant={getStatusColor(selectedDoc.status) as any}>{selectedDoc.status.replace('_', ' ')}</Badge>
                <Button variant="ghost" size="sm" onClick={() => setSelectedDoc(null)}><X size={20} /></Button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {selectedDoc.type.includes('pdf') ? (
                <iframe
                  src={selectedDoc.url}
                  className="w-full h-[600px] border border-gray-200 rounded-md"
                  title={selectedDoc.name}
                />
              ) : selectedDoc.type.includes('image') ? (
                <img
                  src={selectedDoc.url}
                  alt={selectedDoc.name}
                  className="max-w-full h-auto mx-auto border border-gray-200 rounded-md"
                />
              ) : (
                <div className="text-center py-12">
                  <FileText size={64} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">Preview not available for this file type</p>
                </div>
              )}
              {/* Signatures Section */}
              {selectedDoc.signatures.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h3 className="font-medium text-gray-900 mb-3">Signatures</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedDoc.signatures.map((sig, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded-md border">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium">{sig.userId.name}</p>
                          <p className="text-xs text-gray-500">{format(new Date(sig.signedAt), 'MMM d, yyyy h:mm a')}</p>
                        </div>
                        {sig.signatureImage.startsWith('data:') ? (
                          <img src={sig.signatureImage} alt="Signature" className="h-16 border bg-white rounded p-1" />
                        ) : (
                          <p className="text-lg font-serif italic text-gray-700 border bg-white rounded p-2">"{sig.signatureImage}"</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* E-Signature Modal */}
      {showSignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Sign Document</h2>
            <p className="text-gray-600 mb-4">Sign "{showSignModal.name}"</p>
            <SignaturePad
              onSign={(dataUrl) => handleSign(showSignModal._id, dataUrl)}
              onClear={() => {}}
            />
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => setShowSignModal(null)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
