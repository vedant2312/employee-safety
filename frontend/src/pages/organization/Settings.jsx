import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Shield, AlertTriangle, X, Check } from 'lucide-react';

// ─── small reusable toast that lives inside this page ───────────
const InlineToast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium
        ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
    >
      {type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// ─── confirmation modal for dangerous actions ──────────────────
const DangerModal = ({ isOpen, onClose, onConfirm }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setError('');
    setLoading(true);
    const result = await onConfirm(password);
    if (result.error) {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* red top strip */}
        <div className="h-2 bg-red-600" />

        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Delete Organization</h3>
              <p className="text-sm text-gray-500">This action cannot be undone</p>
            </div>
          </div>

          <p className="text-sm text-gray-700 mb-5">
            Deleting your organization will permanently remove all employees, QR codes,
            and incident records. Type your password below to confirm.
          </p>

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            error={error}
          />

          <div className="flex gap-3 mt-6">
            <Button
              onClick={handleConfirm}
              variant="danger"
              disabled={loading || !password}
              className="flex-1"
            >
              {loading ? 'Deleting…' : 'Delete Organization'}
            </Button>
            <Button onClick={onClose} variant="secondary">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── main Settings page ─────────────────────────────────────────
const Settings = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // toast
  const [toast, setToast] = useState(null); // { message, type }
  const showToast = (message, type = 'success') => setToast({ message, type });

  // org data
  const [org, setOrg] = useState(null);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  // general form
  const [orgName, setOrgName] = useState('');
  const [generalLoading, setGeneralLoading] = useState(false);

  // password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // SOS settings
  const [sosSettings, setSosSettings] = useState({
    sosCascade: true,
    requirePhotoUpdate: false,
  });
  const [sosLoading, setSosLoading] = useState(false);

  // danger zone modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // ── fetch on mount ──
  useEffect(() => {
    fetchOrganization();
  }, []);

  const fetchOrganization = async () => {
    try {
      const res = await api.get('/organization/profile');
      setOrg(res.data.organization);
      setStats(res.data.stats);
      setOrgName(res.data.organization.name);
      setSosSettings({
        sosCascade: res.data.organization.settings?.sosCascade ?? true,
        requirePhotoUpdate: res.data.organization.settings?.requirePhotoUpdate ?? false,
      });
    } catch (err) {
      console.error(err);
      showToast('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ── general update ──
  const handleGeneralSave = async () => {
    setGeneralLoading(true);
    try {
      await api.put('/organization/settings', { name: orgName });
      showToast('Organization name updated');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update', 'error');
    } finally {
      setGeneralLoading(false);
    }
  };

  // ── password update ──
  const handlePasswordSave = async () => {
    setPasswordError('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    setPasswordLoading(true);
    try {
      await api.put('/organization/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('Password updated successfully');
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  // ── SOS settings update ──
  const handleSosSave = async () => {
    setSosLoading(true);
    try {
      await api.put('/organization/settings', { settings: sosSettings });
      showToast('SOS preferences updated');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update', 'error');
    } finally {
      setSosLoading(false);
    }
  };

  // ── delete account ──
  const handleDeleteAccount = async (password) => {
    try {
      await api.delete('/organization/account', { data: { password } });
      showToast('Organization deleted');
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 1500);
      return {};
    } catch (err) {
      return { error: err.response?.data?.message || 'Failed to delete account' };
    }
  };

  // ── loading screen ──
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // ── render ──
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* toast */}
      {toast && (
        <InlineToast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* delete modal */}
      <DangerModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
      />

      {/* page header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
          <p className="text-sm text-gray-500">Manage your organization account</p>
        </div>
      </div>

      {/* ── 1. General ── */}
      <Card title="General">
        <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-800">{org?.name}</p>
            <p className="text-sm text-gray-500">{org?.email}</p>
          </div>
          <div className="ml-auto flex gap-6 text-center">
            <div>
              <p className="text-xl font-bold text-primary-600">{stats.totalEmployees || 0}</p>
              <p className="text-xs text-gray-500">Employees</p>
            </div>
            <div>
              <p className="text-xl font-bold text-red-500">{stats.totalIncidents || 0}</p>
              <p className="text-xs text-gray-500">Incidents</p>
            </div>
          </div>
        </div>

        <Input
          label="Organization Name"
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          placeholder="Your organization name"
        />

        <div className="flex items-center gap-3 mt-2">
          <Button onClick={handleGeneralSave} variant="primary" disabled={generalLoading}>
            {generalLoading ? 'Saving…' : 'Save Name'}
          </Button>
          <span className="text-xs text-gray-400">Email cannot be changed</span>
        </div>
      </Card>

      {/* ── 2. Password ── */}
      <Card title="Change Password">
        <Input
          label="Current Password"
          type="password"
          value={passwordForm.currentPassword}
          onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
          placeholder="Enter current password"
        />
        <Input
          label="New Password"
          type="password"
          value={passwordForm.newPassword}
          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
          placeholder="At least 6 characters"
        />
        <Input
          label="Confirm New Password"
          type="password"
          value={passwordForm.confirmPassword}
          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
          placeholder="Re-enter new password"
          error={passwordError}
        />
        <Button
          onClick={handlePasswordSave}
          variant="primary"
          disabled={passwordLoading || !passwordForm.currentPassword || !passwordForm.newPassword}
          className="mt-2"
        >
          {passwordLoading ? 'Updating…' : 'Update Password'}
        </Button>
      </Card>

      {/* ── 3. SOS Preferences ── */}
      <Card title="SOS Preferences">
        <p className="text-sm text-gray-600 mb-5">
          Configure how emergency alerts behave for your organization.
        </p>

        {/* toggle row helper */}
        {[
          {
            key: 'sosCascade',
            title: 'Cascade Alerts',
            desc: 'Send SOS to all emergency contacts in priority order, not just the first one.',
          },
          {
            key: 'requirePhotoUpdate',
            title: 'Require Employee Photos',
            desc: 'Remind employees to upload a profile photo so responders can identify them.',
          },
        ].map(({ key, title, desc }) => (
          <div key={key} className="flex items-start justify-between mb-5 last:mb-0">
            <div className="pr-4">
              <p className="font-medium text-gray-800">{title}</p>
              <p className="text-sm text-gray-500">{desc}</p>
            </div>
            {/* custom toggle */}
            <button
              type="button"
              onClick={() => setSosSettings((prev) => ({ ...prev, [key]: !prev[key] }))}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0
                ${sosSettings[key] ? 'bg-primary-600' : 'bg-gray-300'}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200
                  ${sosSettings[key] ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </button>
          </div>
        ))}

        <Button onClick={handleSosSave} variant="primary" disabled={sosLoading} className="mt-4">
          {sosLoading ? 'Saving…' : 'Save Preferences'}
        </Button>
      </Card>

      {/* ── 4. Danger Zone ── */}
      <Card className="border-2 border-red-200">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <h3 className="text-base font-bold text-red-700">Danger Zone</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Once you delete your organization, all employees, QR codes, and incident
          records will be permanently removed. This action cannot be undone.
        </p>
        <Button
          onClick={() => setShowDeleteModal(true)}
          variant="danger"
        >
          Delete Organization Account
        </Button>
      </Card>
    </div>
  );
};

export default Settings;