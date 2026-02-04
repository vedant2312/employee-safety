import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Shield } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('organization'); // organization or employee
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, loginEmployee } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = userType === 'organization' 
      ? await login(email, password)
      : await loginEmployee(email, password);

    if (result.success) {
      navigate(userType === 'organization' ? '/dashboard' : '/employee/profile');
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Employee Safety System</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        {/* User Type Toggle */}
        <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setUserType('organization')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              userType === 'organization'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600'
            }`}
          >
            Organization
          </button>
          <button
            type="button"
            onClick={() => setUserType('employee')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              userType === 'employee'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600'
            }`}
          >
            Employee
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={loading}
            className="mt-2"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        {/* Register Link (only for organizations) */}
        {userType === 'organization' && (
          <p className="text-center mt-6 text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
              Register your organization
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;