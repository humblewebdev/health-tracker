import { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { adminService, AdminStats } from '../../services/admin.service';

const statCards = (stats: AdminStats) => [
  { label: 'Total Users', value: stats.totalUsers, sub: `+${stats.newUsersThisWeek} this week` },
  { label: 'Food Entries', value: stats.totalFoodEntries },
  { label: 'Exercises Logged', value: stats.totalExercises },
  { label: 'Water Intakes', value: stats.totalWaterIntakes },
  { label: 'Measurements', value: stats.totalMeasurements },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminService.getStats()
      .then(setStats)
      .catch(() => setError('Failed to load stats'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Overview</h1>

      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards(stats).map(({ label, value, sub }) => (
            <div key={label} className="bg-white rounded-lg shadow p-5">
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{value.toLocaleString()}</p>
              {sub && <p className="text-xs text-green-600 mt-1">{sub}</p>}
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
