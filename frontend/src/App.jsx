import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import OrganizationLayout from './components/layout/OrganizationLayout';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/organization/Dashboard';
import EmployeeList from './pages/organization/EmployeeList';
import AddEmployee from './pages/organization/AddEmployee';
import EditEmployee from './pages/organization/EditEmployee';
import EmployeeQR from './pages/organization/EmployeeQR';
import IncidentsList from './pages/organization/IncidentsList';
import EmergencyScanner from './pages/emergency/EmergencyScanner';
import EmployeeProfile from './pages/employee/EmployeeProfile';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Emergency Scanner - Public */}
          <Route path="/emergency/:qrToken" element={<EmergencyScanner />} />

          {/* Protected Organization Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requireOrganization>
                <OrganizationLayout>
                  <Dashboard />
                </OrganizationLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/employees"
            element={
              <ProtectedRoute requireOrganization>
                <OrganizationLayout>
                  <EmployeeList />
                </OrganizationLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/employees/add"
            element={
              <ProtectedRoute requireOrganization>
                <OrganizationLayout>
                  <AddEmployee />
                </OrganizationLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/employees/:id/edit"
            element={
              <ProtectedRoute requireOrganization>
                <OrganizationLayout>
                  <EditEmployee />
                </OrganizationLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/employees/:id/qr"
            element={
              <ProtectedRoute requireOrganization>
                <OrganizationLayout>
                  <EmployeeQR />
                </OrganizationLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/incidents"
            element={
              <ProtectedRoute requireOrganization>
                <OrganizationLayout>
                  <IncidentsList />
                </OrganizationLayout>
              </ProtectedRoute>
            }
          />

          {/* Protected Employee Routes */}
          <Route
            path="/employee/profile"
            element={
              <ProtectedRoute>
                <EmployeeProfile />
              </ProtectedRoute>
            }
          />

          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;