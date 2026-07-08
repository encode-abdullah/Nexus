import React, { useState, useEffect, useRef } from 'react';
import { User, Lock, Bell, Globe, Palette, CreditCard, Shield, CheckCircle, Camera } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import toast from 'react-hot-toast';

type SettingsTab = 'profile' | 'security' | 'notifications' | 'language' | 'appearance' | 'billing';

export const SettingsPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    location: (user as any)?.location || ''
  });

  // 2FA state
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [mockOtp, setMockOtp] = useState('');
  const [twoFALoading, setTwoFALoading] = useState(false);

  // Photo upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    check2FAStatus();
  }, []);

  const check2FAStatus = async () => {
    try {
      const res = await api.get('/2fa/status');
      setTwoFAEnabled(res.data.enabled);
    } catch {
      // 2FA status check failed silently
    }
  };

  const handleEnable2FA = async () => {
    setTwoFALoading(true);
    try {
      const res = await api.post('/2fa/setup');
      setOtpSent(true);
      setMockOtp(res.data.mockOtp);
      toast.success('OTP sent! Check the console or the demo box below.');
    } catch {
      toast.error('Failed to send OTP');
    } finally {
      setTwoFALoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Enter a valid 6-digit OTP');
      return;
    }
    setTwoFALoading(true);
    try {
      await api.post('/2fa/verify', { otp });
      setTwoFAEnabled(true);
      setOtpSent(false);
      setOtp('');
      setMockOtp('');
      toast.success('2FA enabled successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Verification failed');
    } finally {
      setTwoFALoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!window.confirm('Are you sure you want to disable 2FA?')) return;
    setTwoFALoading(true);
    try {
      await api.post('/2fa/disable');
      setTwoFAEnabled(false);
      toast.success('2FA disabled successfully');
    } catch {
      toast.error('Failed to disable 2FA');
    } finally {
      setTwoFALoading(false);
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 800 * 1024) {
      toast.error('File size must be less than 800KB');
      return;
    }

    setUploadingPhoto(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const avatarUrl = event.target?.result as string;
        await updateProfile(user!.id, { avatarUrl });
        toast.success('Photo updated!');
        setUploadingPhoto(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error('Failed to upload photo');
      setUploadingPhoto(false);
    }
  };

  if (!user) return null;

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile(user.id, formData);
      toast.success('Profile updated!');
    } catch {
      // Error handled by AuthContext
    } finally {
      setIsSaving(false);
    }
  };

  const tabs: { key: SettingsTab; icon: React.ReactNode; label: string }[] = [
    { key: 'profile', icon: <User size={18} />, label: 'Profile' },
    { key: 'security', icon: <Lock size={18} />, label: 'Security' },
    { key: 'notifications', icon: <Bell size={18} />, label: 'Notifications' },
    { key: 'language', icon: <Globe size={18} />, label: 'Language' },
    { key: 'appearance', icon: <Palette size={18} />, label: 'Appearance' },
    { key: 'billing', icon: <CreditCard size={18} />, label: 'Billing' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account preferences and settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardBody className="p-2">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.key
                      ? 'text-primary-700 bg-primary-50'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-3">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </CardBody>
        </Card>

        <div className="lg:col-span-3 space-y-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <Card>
              <CardHeader><h2 className="text-lg font-medium text-gray-900">Profile Settings</h2></CardHeader>
              <CardBody className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar src={user.avatarUrl} alt={user.name} size="xl" />
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/gif"
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                    <Button variant="outline" size="sm" onClick={handlePhotoClick} isLoading={uploadingPhoto}>
                      <Camera size={14} className="mr-1" /> Change Photo
                    </Button>
                    <p className="mt-2 text-sm text-gray-500">JPG, GIF or PNG. Max size of 800K</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Full Name" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} />
                  <Input label="Email" type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} />
                  <Input label="Role" value={user.role} disabled />
                  <Input label="Location" value={formData.location} onChange={(e) => handleChange('location', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" rows={4} value={formData.bio} onChange={(e) => handleChange('bio', e.target.value)} />
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setFormData({ name: user.name, email: user.email, bio: user.bio, location: (user as any).location || '' })}>Cancel</Button>
                  <Button onClick={handleSave} isLoading={isSaving}>Save Changes</Button>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <Card>
              <CardHeader><h2 className="text-lg font-medium text-gray-900">Security Settings</h2></CardHeader>
              <CardBody className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Shield size={18} /> Two-Factor Authentication
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                      {twoFAEnabled ? (
                        <Badge variant="success" className="mt-1"><CheckCircle size={12} className="mr-1" /> Enabled</Badge>
                      ) : (
                        <Badge variant="error" className="mt-1">Not Enabled</Badge>
                      )}
                    </div>
                    {twoFAEnabled ? (
                      <Button variant="outline" onClick={handleDisable2FA} isLoading={twoFALoading}>
                        Disable 2FA
                      </Button>
                    ) : !otpSent ? (
                      <Button variant="outline" onClick={handleEnable2FA} isLoading={twoFALoading}>
                        Enable 2FA
                      </Button>
                    ) : null}
                  </div>

                  {otpSent && !twoFAEnabled && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg space-y-3">
                      <p className="text-sm text-yellow-800 font-medium">Enter the 6-digit OTP sent to your email</p>
                      <div className="p-3 bg-white border border-yellow-300 rounded-md">
                        <p className="text-xs text-gray-500 mb-1">Demo Mode — Your OTP:</p>
                        <p className="text-2xl font-mono font-bold text-primary-600 tracking-widest">{mockOtp}</p>
                      </div>
                      <Input label="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="000000" maxLength={6} />
                      <div className="flex gap-2">
                        <Button onClick={handleVerify2FA} isLoading={twoFALoading}>Verify OTP</Button>
                        <Button variant="outline" onClick={() => { setOtpSent(false); setOtp(''); setMockOtp(''); }}>Cancel</Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Change Password</h3>
                  <div className="space-y-4">
                    <Input label="Current Password" type="password" />
                    <Input label="New Password" type="password" />
                    <Input label="Confirm New Password" type="password" />
                    <div className="flex justify-end">
                      <Button>Update Password</Button>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <Card>
              <CardHeader><h2 className="text-lg font-medium text-gray-900">Notification Preferences</h2></CardHeader>
              <CardBody className="space-y-4">
                {['Email notifications', 'Push notifications', 'Meeting reminders', 'New investor messages', 'Document updates'].map((item) => (
                  <label key={item} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">{item}</span>
                    <input type="checkbox" defaultChecked className="h-4 w-4 text-primary-600 rounded" />
                  </label>
                ))}
                <div className="flex justify-end pt-4">
                  <Button onClick={() => toast.success('Notification preferences saved!')}>Save Preferences</Button>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Language Tab */}
          {activeTab === 'language' && (
            <Card>
              <CardHeader><h2 className="text-lg font-medium text-gray-900">Language & Region</h2></CardHeader>
              <CardBody className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                  <select className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2">
                    <option>English</option>
                    <option>Urdu</option>
                    <option>Arabic</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                  <select className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2">
                    <option>Asia/Karachi (PKT)</option>
                    <option>UTC</option>
                    <option>America/New_York (EST)</option>
                  </select>
                </div>
                <div className="flex justify-end pt-4">
                  <Button onClick={() => toast.success('Language preferences saved!')}>Save</Button>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <Card>
              <CardHeader><h2 className="text-lg font-medium text-gray-900">Appearance</h2></CardHeader>
              <CardBody className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                  <div className="flex gap-3">
                    {['Light', 'Dark', 'System'].map((theme) => (
                      <button key={theme} className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sidebar Position</label>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 border rounded-lg text-sm font-medium bg-primary-50 text-primary-700">Left</button>
                    <button className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50">Right</button>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <Card>
              <CardHeader><h2 className="text-lg font-medium text-gray-900">Billing & Subscription</h2></CardHeader>
              <CardBody className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">Current Plan</p>
                  <p className="text-lg font-bold text-gray-900">Free Tier</p>
                  <p className="text-sm text-gray-500 mt-1">No payment method on file</p>
                </div>
                <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
                  <p className="text-sm font-medium text-primary-700">Pro Plan — Coming Soon</p>
                  <p className="text-sm text-primary-600 mt-1">Advanced features for serious investors and entrepreneurs</p>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
