import { useState, useEffect } from 'react';
import api from '../../utils/api';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Users, UserCheck, AlertTriangle, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Employees',
      value: stats?.totalEmployees || 0,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Compliance Rate',
      value: `${stats?.complianceRate || 0}%`,
      icon: UserCheck,
      color: 'bg-green-500',
    },
    {
      title: 'Total Incidents',
      value: stats?.totalIncidents || 0,
      icon: AlertTriangle,
      color: 'bg-red-500',
    },
    {
      title: 'Recent Incidents',
      value: stats?.recentIncidents || 0,
      icon: TrendingUp,
      color: 'bg-yellow-500',
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Department Breakdown */}
      {stats?.departmentBreakdown && stats.departmentBreakdown.length > 0 && (
        <Card title="Department Breakdown">
          <div className="space-y-4">
            {stats.departmentBreakdown.map((dept) => (
              <div key={dept._id} className="flex justify-between items-center">
                <span className="font-medium text-gray-700">
                  {dept._id || 'Unassigned'}
                </span>
                <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
                  {dept.count} employee{dept.count !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;