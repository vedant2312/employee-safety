import { useState, useEffect } from 'react';
import api from '../../utils/api';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { AlertCircle, MapPin, Clock, User } from 'lucide-react';

const IncidentsList = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const response = await api.get('/emergency/incidents/all');
      setIncidents(response.data.incidents);
    } catch (error) {
      console.error('Error fetching incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Incident History</h1>

      {incidents.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No incidents recorded</h3>
            <p className="text-gray-500">Emergency incidents will appear here</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {incidents.map((incident) => (
            <Card key={incident._id}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <User className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-semibold text-gray-800">
                        {incident.employeeId?.name || 'Unknown Employee'}
                      </p>
                      <p className="text-sm text-gray-600">
                        ID: {incident.employeeId?.employeeId} • {incident.employeeId?.department}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{formatDate(incident.scannedAt)}</span>
                    </div>

                    {incident.location?.latitude && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {incident.location.latitude.toFixed(4)}, {incident.location.longitude.toFixed(4)}
                        </span>
                      </div>
                    )}

                    {incident.scannedBy?.name && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="w-4 h-4" />
                        <span>Scanned by: {incident.scannedBy.name}</span>
                      </div>
                    )}

                    <div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          incident.sosStatus === 'sent'
                            ? 'bg-green-100 text-green-700'
                            : incident.sosStatus === 'failed'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        SOS: {incident.sosStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default IncidentsList;