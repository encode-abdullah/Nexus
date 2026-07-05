import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Upload, Download, Trash2, Share2, Pen, Eye } from 'lucide-react';
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

export const DocumentsPage: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

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
      await api.post('/documents/upload', formData, {
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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    }
  });

  const handleSign = async (docId: string) => {
    const signatureImage = prompt('Enter your signature (as text for demo):');
    if (!signatureImage) return;

    try {
      await api.post(`/documents/${docId}/sign`, { signatureImage });
      toast.success('Document signed successfully');
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
        <Button leftIcon={<Upload size={18} />} onClick={() => setShowUploadModal(true)}>
          Upload Document
        </Button>
      </div>

      {/* Storage Info */}
      <Card>
        <CardBody className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-50 rounded-full">
                <FileText size={24} className="text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Documents</p>
                <p className="text-lg font-semibold text-gray-900">{documents.length}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">Signed</p>
                <p className="text-lg font-semibold text-green-600">
                  {documents.filter(d => d.status === 'signed').length}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-lg font-semibold text-yellow-600">
                  {documents.filter(d => d.status === 'pending_signature').length}
                </p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Document List */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900">All Documents</h2>
        </CardHeader>
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
                <div
                  key={doc._id}
                  className="flex items-center p-4 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                >
                  <div className="p-2 bg-primary-50 rounded-lg mr-4">
                    <FileText size={24} className="text-primary-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{doc.name}</h3>
                      <Badge variant={getStatusColor(doc.status) as any} size="sm">
                        {doc.status.replace('_', ' ')}
                      </Badge>
                      {doc.shared && (
                        <Badge variant="secondary" size="sm">Shared</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span>{formatFileSize(doc.size)}</span>
                      <span>v{doc.version}</span>
                      <span>{format(new Date(doc.createdAt), 'MMM d, yyyy')}</span>
                      {doc.signatures.length > 0 && (
                        <span className="text-green-600">{doc.signatures.length} signature(s)</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="ghost" size="sm" className="p-2" aria-label="View"
                      onClick={() => setSelectedDoc(doc)}>
                      <Eye size={18} />
                    </Button>
                    {doc.status !== 'signed' && doc.ownerId._id === user?.id && (
                      <Button variant="ghost" size="sm" className="p-2" aria-label="Sign"
                        onClick={() => handleSign(doc._id)}>
                        <Pen size={18} />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="p-2 text-error-600 hover:text-error-700"
                      aria-label="Delete" onClick={() => handleDelete(doc._id)}>
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
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">
                {isDragActive ? 'Drop your file here' : 'Drag & drop a file, or click to select'}
              </p>
              <p className="text-sm text-gray-400 mt-2">PDF, DOC, DOCX, JPG, PNG up to 10MB</p>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowUploadModal(false)}>Cancel</Button>
              <Button isLoading={uploading}>Upload</Button>
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900">{selectedDoc.name}</h2>
              <Button variant="ghost" size="sm" onClick={() => setSelectedDoc(null)}>✕</Button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Type:</span>
                  <span className="ml-2 text-gray-900">{selectedDoc.type}</span>
                </div>
                <div>
                  <span className="text-gray-500">Size:</span>
                  <span className="ml-2 text-gray-900">{formatFileSize(selectedDoc.size)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <Badge variant={getStatusColor(selectedDoc.status) as any} className="ml-2">
                    {selectedDoc.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-500">Version:</span>
                  <span className="ml-2 text-gray-900">{selectedDoc.version}</span>
                </div>
              </div>

              {selectedDoc.signatures.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Signatures</h3>
                  {selectedDoc.signatures.map((sig, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-md mb-2">
                      <p className="text-sm font-medium">{sig.userId.name}</p>
                      <p className="text-xs text-gray-500">
                        Signed {format(new Date(sig.signedAt), 'MMM d, yyyy h:mm a')}
                      </p>
                      <p className="text-sm text-gray-700 mt-1 italic">"{sig.signatureImage}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
