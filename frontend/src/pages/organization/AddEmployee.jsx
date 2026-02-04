import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

const AddEmployee = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    email: '',
    password: '',
    department: '',
    role: '',
    bloodGroup: '',
    allergies: [''],
    chronicConditions: [''],
    currentMedications: [''],
    emergencyContacts: [
      { name: '', relation: '', phone: '', priority: 1 }
    ],
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
    setError('');
    setLoading(true);

    try {
      // Filter out empty strings from arrays
      const allergies = formData.allergies.filter(a => a.trim() !== '');
      const chronicConditions = formData.chronicConditions.filter(c => c.trim() !== '');
      const currentMedications = formData.currentMedications.filter(m => m.trim() !== '');
      const emergencyContacts = formData.emergencyContacts.filter(
        c => c.name && c.phone
      );

      const payload = {
        employeeId: formData.employeeId,
        name: formData.name,
        email: formData.email,
        password: formData.password,
        department: formData.department,
        role: formData.role,
        emergencyContacts,
      };

      // Add medical info if blood group is provided
      if (formData.bloodGroup) {
        payload.medicalInfo = {
          critical: {
            bloodGroup: formData.bloodGroup,
            allergies,
            chronicConditions,
          },
          important: {
            currentMedications,
          },
          context: {} // Include empty context object
        };
      }

      await api.post('/employees', payload);
      navigate('/employees');
    } catch (error) {
      console.error('Error creating employee:', error);
      setError(error.response?.data?.message || 'Failed to create employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button
          onClick={() => navigate('/employees')}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-gray-800">Add Employee</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <Card title="Basic Information" className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Employee ID"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleChange}
              placeholder="e.g., EMP001"
              required
            />
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@company.com"
              required
            />
            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              required
            />
            <Input
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="Engineering"
            />
            <Input
              label="Role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              placeholder="Software Developer"
            />
          </div>
        </Card>

        {/* Medical Information */}
        <Card title="Medical Information" className="mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Blood Group
            </label>
            <select
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleChange}
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

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Creating...' : 'Create Employee'}
          </Button>
          <Button
            type="button"
            onClick={() => navigate('/employees')}
            variant="secondary"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddEmployee;