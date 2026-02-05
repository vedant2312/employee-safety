import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../utils/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  Shield, 
  User, 
  Phone, 
  AlertCircle, 
  Heart,
  MapPin,
  CheckCircle 
} from 'lucide-react';

const EmergencyScanner = () => {
  const { qrToken } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sosTriggered, setSosTriggered] = useState(false);
  const [sendingSOS, setSendingSOS] = useState(false);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    fetchEmployeeData();
    getLocation();
  }, [qrToken]);

  const fetchEmployeeData = async () => {
    try {
      const response = await api.get(`/emergency/${qrToken}`);
      setEmployee(response.data.employee);
    } catch (error) {
      setError(error.response?.data?.message || 'Invalid QR code or employee not found');
    } finally {
      setLoading(false);
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const handleTriggerSOS = async () => {
    if (!window.confirm('Are you sure you want to send an emergency alert? This will notify all emergency contacts.')) {
      return;
    }

    // Optional: Ask for scanner's details
    const scannerName = prompt('Your name (optional):');
    const scannerPhone = prompt('Your phone number (optional, format: +91XXXXXXXXXX):');

    setSendingSOS(true);

    try {
      const payload = {
        location: location || {},
        scannedBy: {
          name: scannerName || undefined,
          phone: scannerPhone || undefined
        }
      };

      await api.post(`/emergency/${qrToken}/sos`, payload);
      setSosTriggered(true);
    } catch (error) {
      alert('Failed to send SOS alert. Please try again.');
    } finally {
      setSendingSOS(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Invalid QR Code</h2>
          <p className="text-gray-600">{error}</p>
        </Card>
      </div>
    );
  }

  if (sosTriggered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">SOS Alert Sent!</h2>
          <p className="text-gray-700 mb-4">
            Emergency contacts have been notified. Help is on the way.
          </p>
          <p className="text-sm text-gray-600">
            {employee.emergencyContacts?.length || 0} contact(s) notified
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-600 rounded-full mb-4">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Emergency Information</h1>
          <p className="text-gray-600 mt-2">{employee.organization}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Employee Info */}
          <Card title="Employee Details">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-semibold text-gray-800">{employee.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Employee ID</p>
                  <p className="font-semibold text-gray-800">{employee.employeeId}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Department</p>
                  <p className="font-semibold text-gray-800">{employee.department || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Role</p>
                  <p className="font-semibold text-gray-800">{employee.role || 'N/A'}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Medical Info */}
          <Card title="Critical Medical Information">
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
        </div>

        {/* Emergency Contacts */}
        {employee.emergencyContacts?.length > 0 && (
          <Card title="Emergency Contacts" className="mb-6">
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
                      <a
                        href={`tel:${contact.phone}`}
                        className="text-primary-600 font-medium hover:underline"
                      >
                        {contact.phone}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Location Info */}
        {location && (
          <Card className="mb-6">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Current Location Captured</p>
                <p className="text-xs text-gray-500">
                  Lat: {location.latitude.toFixed(6)}, Long: {location.longitude.toFixed(6)}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* SOS Button */}
        <Card>
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Emergency Alert</h3>
            <p className="text-gray-600 mb-6">
              Click the button below to send an immediate alert to all emergency contacts
            </p>
            <Button
              onClick={handleTriggerSOS}
              variant="danger"
              disabled={sendingSOS}
              className="text-lg px-8 py-4"
            >
              {sendingSOS ? 'Sending Alert...' : '🚨 SEND SOS ALERT'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EmergencyScanner;