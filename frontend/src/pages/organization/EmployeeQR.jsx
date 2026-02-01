import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ArrowLeft, Download, RefreshCw } from 'lucide-react';

const EmployeeQR = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployeeAndQR();
  }, [id]);

  const fetchEmployeeAndQR = async () => {
    try {
      const [employeeRes, qrRes] = await Promise.all([
        api.get(`/employees/${id}`),
        api.get(`/employees/${id}/qr`)
      ]);
      setEmployee(employeeRes.data);
      setQrData(qrRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load employee data');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateQR = async () => {
    if (!window.confirm('Are you sure you want to regenerate the QR code? The old QR code will stop working.')) {
      return;
    }

    try {
      await api.post(`/employees/${id}/regenerate-qr`);
      // Refresh QR data
      const qrRes = await api.get(`/employees/${id}/qr`);
      setQrData(qrRes.data);
      alert('QR code regenerated successfully');
    } catch (error) {
      console.error('Error regenerating QR:', error);
      alert('Failed to regenerate QR code');
    }
  };

  const handleDownloadQR = () => {
    // Create a download link
    const link = document.createElement('a');
    link.href = qrData.qrCodeImage;
    link.download = `${employee.name.replace(/\s+/g, '_')}_QR.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
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
      <div className="flex items-center gap-4 mb-6 no-print">
        <Button
          onClick={() => navigate('/employees')}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-gray-800">QR Code</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employee Info */}
        <Card title="Employee Information">
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium text-gray-800">{employee.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Employee ID</p>
              <p className="font-medium text-gray-800">{employee.employeeId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Department</p>
              <p className="font-medium text-gray-800">{employee.department || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Role</p>
              <p className="font-medium text-gray-800">{employee.role || 'N/A'}</p>
            </div>
          </div>
        </Card>

        {/* QR Code */}
        <Card title="QR Code">
          <div className="flex flex-col items-center">
            <div className="bg-white p-6 rounded-lg border-2 border-gray-200 mb-4">
              <img
                src={qrData.qrCodeImage}
                alt="QR Code"
                className="w-64 h-64"
              />
            </div>
            <p className="text-sm text-gray-600 text-center mb-4">
              Scan this QR code in case of emergency
            </p>
            <div className="flex gap-2 w-full no-print">
              <Button
                onClick={handleDownloadQR}
                variant="primary"
                className="flex-1 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
              <Button
                onClick={handlePrint}
                variant="secondary"
                className="flex-1"
              >
                Print
              </Button>
              <Button
                onClick={handleRegenerateQR}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Printable Badge */}
      <div className="print-only mt-8 p-8 border-4 border-dashed border-gray-300 rounded-lg text-center">
        <h2 className="text-2xl font-bold mb-4">EMERGENCY QR CODE</h2>
        <div className="flex justify-center mb-4">
          <img src={qrData.qrCodeImage} alt="QR Code" className="w-64 h-64" />
        </div>
        <div className="text-left max-w-md mx-auto">
          <p className="text-lg font-semibold">{employee.name}</p>
          <p className="text-gray-700">ID: {employee.employeeId}</p>
          <p className="text-gray-700">{employee.department}</p>
          <p className="text-red-600 font-bold mt-4">⚠️ SCAN IN CASE OF EMERGENCY</p>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
        }
        .print-only {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default EmployeeQR;