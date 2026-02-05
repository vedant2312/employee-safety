import { useState, useEffect } from 'react';
import api from '../../utils/api';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import { AlertCircle, MapPin, Clock, User, Download } from 'lucide-react';

const IncidentsList = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const response = await api.get('/emergency/incidents/all');
      console.log('Incidents response:', response.data); // Debug log
      setIncidents(response.data.incidents || []);
      setError('');
    } catch (error) {
      console.error('Error fetching incidents:', error);
      setError(error.response?.data?.message || 'Failed to load incidents');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/export/incidents', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `incidents-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export data');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Incident History</h1>
        <Card>
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">Error Loading Incidents</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <Button onClick={fetchIncidents} variant="primary">
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Incident History</h1>
        {incidents.length > 0 && (
          <Button
            onClick={handleExportCSV}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </Button>
        )}
      </div>

      {incidents.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No incidents recorded</h3>
            <p className="text-gray-500">Emergency incidents will appear here when SOS alerts are triggered</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {incidents.map((incident) => (
            <Card key={incident._id}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Employee Info */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {incident.employeeId?.name || 'Unknown Employee'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {incident.employeeId?.employeeId ? `ID: ${incident.employeeId.employeeId}` : 'No ID'}
                        {incident.employeeId?.department && ` • ${incident.employeeId.department}`}
                      </p>
                    </div>
                  </div>

                  {/* Incident Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm mt-4">
                    {/* Date & Time */}
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Date & Time</p>
                        <p className="font-medium">{formatDate(incident.scannedAt)}</p>
                      </div>
                    </div>

                    {/* Location */}
                    {(incident.location?.latitude || incident.location?.address) && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500">Location</p>
                          <p className="font-medium">
                            {incident.location.address || 
                             `${incident.location.latitude?.toFixed(4)}, ${incident.location.longitude?.toFixed(4)}`}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Scanned By */}
                    {incident.scannedBy?.name && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="w-4 h-4 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500">Scanned By</p>
                          <p className="font-medium">{incident.scannedBy.name}</p>
                          {incident.scannedBy.phone && (
                            <p className="text-xs">{incident.scannedBy.phone}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  {incident.notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{incident.notes}</p>
                    </div>
                  )}
                </div>

                {/* SOS Status Badge */}
                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      incident.sosStatus === 'sent'
                        ? 'bg-green-100 text-green-700'
                        : incident.sosStatus === 'failed'
                        ? 'bg-red-100 text-red-700'
                        : incident.sosStatus === 'acknowledged'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {incident.sosStatus === 'sent' && '✓ '}
                    {incident.sosStatus === 'failed' && '✗ '}
                    {incident.sosStatus === 'acknowledged' && '👍 '}
                    {incident.sosStatus?.toUpperCase()}
                  </span>
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