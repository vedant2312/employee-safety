import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { User, Shield, Phone, Heart, Plus, Trash2 } from 'lucide-react';

const EmployeeProfile = () => {
  const { user } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    bloodGroup: '',
    allergies: [''],
    chronicConditions: [''],
    currentMedications: [''],
    emergencyContacts: [
      { name: '', relation: '', phone: '', priority: 1 }
    ],
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/employees/profile/me');
      setEmployee(response.data);

      // Populate form data
      setFormData({
        bloodGroup: response.data.medicalInfo?.critical?.bloodGroup || '',
        allergies: response.data.medicalInfo?.critical?.allergies?.length > 0 
          ? response.data.medicalInfo.critical.allergies 
          : [''],
        chronicConditions: response.data.medicalInfo?.critical?.chronicConditions?.length > 0
          ? response.data.medicalInfo.critical.chronicConditions
          : [''],
        currentMedications: response.data.medicalInfo?.important?.currentMedications?.length > 0
          ? response.data.medicalInfo.important.currentMedications
          : [''],
        emergencyContacts: response.data.emergencyContacts?.length > 0
          ? response.data.emergencyContacts
          : [{ name: '', relation: '', phone: '', priority: 1 }],
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArrayChange = (index, field, value) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayItem = (field) => {
    setFormData({
      ...formData,
      [field]: [...formData[field], ''],
    });
  };

  const removeArrayItem = (field, index) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: newArray });
  };

  const handleContactChange = (index, field, value) => {
    const newContacts = [...formData.emergencyContacts];
    newContacts[index][field] = value;
    setFormData({ ...formData, emergencyContacts: newContacts });
  };

  const addContact = () => {
    setFormData({
      ...formData,
      emergencyContacts: [
        ...formData.emergencyContacts,
        { name: '', relation: '', phone: '', priority: formData.emergencyContacts.length + 1 }
      ],
    });
  };

  const removeContact = (index) => {
    const newContacts = formData.emergencyContacts.filter((_, i) => i !== index);
    setFormData({ ...formData, emergencyContacts: newContacts });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const allergies = formData.allergies.filter(a => a.trim() !== '');
      const chronicConditions = formData.chronicConditions.filter(c => c.trim() !== '');
      const currentMedications = formData.currentMedications.filter(m => m.trim() !== '');
      const emergencyContacts = formData.emergencyContacts.filter(
        c => c.name && c.phone
      );

      const payload = {
        emergencyContacts,
        medicalInfo: {
          critical: {
            bloodGroup: formData.bloodGroup,
            allergies,
            chronicConditions,
          },
          important: {
            currentMedications,
          },
        },
      };

      await api.put('/employees/profile/me', payload);
      await fetchProfile();
      setEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
                <User className="w-10 h-10 text-primary-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{employee.name}</h1>
                <p className="text-gray-600">{employee.employeeId} • {employee.department}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary-600" />
              <span className="text-sm font-medium text-gray-700">
                {employee.organizationId?.name}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!editing ? (
          // View Mode
          <div className="space-y-6">
            {/* Basic Info */}
            <Card title="Basic Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-800">{employee.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Role</p>
                  <p className="font-medium text-gray-800">{employee.role || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    employee.status === 'active' 
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {employee.status}
                  </span>
                </div>
              </div>
            </Card>

            {/* Medical Info */}
            <Card 
              title="Medical Information"
              action={
                <Button onClick={() => setEditing(true)} variant="primary">
                  Update Medical Info
                </Button>
              }
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="text-sm text-gray-600">Blood Group</p>
                    <p className="font-semibold text-red-600 text-lg">
                      {employee.medicalInfo?.critical?.bloodGroup || 'Not Provided'}
                    </p>
                  </div>
                </div>

                {employee.medicalInfo?.critical?.allergies?.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Allergies</p>
                    <div className="flex flex-wrap gap-2">
                      {employee.medicalInfo.critical.allergies.map((allergy, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium"
                        >
                          {allergy}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {employee.medicalInfo?.critical?.chronicConditions?.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Chronic Conditions</p>
                    <div className="flex flex-wrap gap-2">
                      {employee.medicalInfo.critical.chronicConditions.map((condition, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium"
                        >
                          {condition}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {employee.medicalInfo?.important?.currentMedications?.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Current Medications</p>
                    <ul className="list-disc list-inside text-gray-700">
                      {employee.medicalInfo.important.currentMedications.map((med, index) => (
                        <li key={index}>{med}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>

            {/* Emergency Contacts */}
            <Card title="Emergency Contacts">
              {employee.emergencyContacts?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {employee.emergencyContacts.map((contact, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-start gap-3">
                        <Phone className="w-5 h-5 text-primary-600 mt-1" />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{contact.name}</p>
                          <p className="text-sm text-gray-600">{contact.relation}</p>
                          <p className="text-primary-600 font-medium">{contact.phone}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No emergency contacts added</p>
              )}
            </Card>
          </div>
        ) : (
          // Edit Mode
          <form onSubmit={handleSubmit}>
            <Card title="Update Medical Information" className="mb-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blood Group
                </label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              {/* Allergies */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allergies
                </label>
                {formData.allergies.map((allergy, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={allergy}
                      onChange={(e) => handleArrayChange(index, 'allergies', e.target.value)}
                      placeholder="e.g., Penicillin"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    {formData.allergies.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeArrayItem('allergies', index)}
                        variant="danger"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={() => addArrayItem('allergies')}
                  variant="outline"
                  className="flex items-center gap-2 mt-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Allergy
                </Button>
              </div>

              {/* Chronic Conditions */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chronic Conditions
                </label>
                {formData.chronicConditions.map((condition, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={condition}
                      onChange={(e) => handleArrayChange(index, 'chronicConditions', e.target.value)}
                      placeholder="e.g., Diabetes"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    {formData.chronicConditions.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeArrayItem('chronicConditions', index)}
                        variant="danger"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={() => addArrayItem('chronicConditions')}
                  variant="outline"
                  className="flex items-center gap-2 mt-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Condition
                </Button>
              </div>

              {/* Current Medications */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Medications
                </label>
                {formData.currentMedications.map((medication, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={medication}
                      onChange={(e) => handleArrayChange(index, 'currentMedications', e.target.value)}
                      placeholder="e.g., Aspirin 100mg"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    {formData.currentMedications.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeArrayItem('currentMedications', index)}
                        variant="danger"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={() => addArrayItem('currentMedications')}
                  variant="outline"
                  className="flex items-center gap-2 mt-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Medication
                </Button>
              </div>
            </Card>

            {/* Emergency Contacts */}
            <Card title="Emergency Contacts" className="mb-6">
              {formData.emergencyContacts.map((contact, index) => (
                <div key={index} className="mb-6 p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium text-gray-700">Contact {index + 1}</h4>
                    {formData.emergencyContacts.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeContact(index)}
                        variant="danger"
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="Name"
                      value={contact.name}
                      onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                      placeholder="Jane Doe"
                      required
                    />
                    <Input
                      label="Relation"
                      value={contact.relation}
                      onChange={(e) => handleContactChange(index, 'relation', e.target.value)}
                      placeholder="Spouse"
                      required
                    />
                    <Input
                      label="Phone"
                      value={contact.phone}
                      onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                      placeholder="+1234567890"
                      required
                    />
                  </div>
                </div>
              ))}
              <Button
                type="button"
                onClick={addContact}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Emergency Contact
              </Button>
            </Card>

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <Button
                type="submit"
                variant="primary"
                disabled={saving}
                className="flex-1"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setEditing(false);
                  fetchProfile(); // Reset form
                }}
                variant="secondary"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EmployeeProfile;