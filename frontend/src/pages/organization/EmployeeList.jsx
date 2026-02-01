import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Plus, Edit, QrCode, Trash2, User } from 'lucide-react';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data.employees);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this employee?')) {
      return;
    }

    try {
      await api.delete(`/employees/${id}`);
      // Refresh list
      fetchEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Failed to deactivate employee');
    }
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Employees</h1>
        <Button
          onClick={() => navigate('/employees/add')}
          variant="primary"
          className="flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Employee
        </Button>
      </div>

      {employees.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No employees yet</h3>
            <p className="text-gray-500 mb-4">Get started by adding your first employee</p>
            <Button onClick={() => navigate('/employees/add')} variant="primary">
              Add Employee
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {employees.map((employee) => (
            <Card key={employee._id}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Profile Photo */}
                  <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                    {employee.profilePhoto ? (
                      <img
                        src={employee.profilePhoto}
                        alt={employee.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-primary-600" />
                    )}
                  </div>

                  {/* Employee Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{employee.name}</h3>
                    <p className="text-sm text-gray-600">ID: {employee.employeeId}</p>
                    <div className="flex gap-4 mt-1">
                      <span className="text-sm text-gray-500">
                        {employee.department || 'No Department'}
                      </span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">
                        {employee.role || 'No Role'}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          employee.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {employee.status}
                      </span>
                      {employee.medicalInfo?.critical?.bloodGroup && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                          Blood: {employee.medicalInfo.critical.bloodGroup}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => navigate(`/employees/${employee._id}/qr`)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <QrCode className="w-4 h-4" />
                    QR Code
                  </Button>
                  <Button
                    onClick={() => navigate(`/employees/${employee._id}/edit`)}
                    variant="secondary"
                    className="flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(employee._id)}
                    variant="danger"
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeList;