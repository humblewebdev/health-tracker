import { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { adminService, AdminUser } from '../../services/admin.service';
import { useAuthStore } from '../../store/authStore';

export default function AdminUsers() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    adminService.getUsers()
      .then(setUsers)
      .catch(() => setError('Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}? This permanently removes all their data.`)) return;
    setDeletingId(id);
    try {
      await adminService.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {
      setError('Failed to delete user');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleAdmin = async (id: string) => {
    setTogglingId(id);
    try {
      const updated = await adminService.toggleAdmin(id);
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, isAdmin: updated.isAdmin } : u));
    } catch {
      setError('Failed to update admin status');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Users</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {loading && <p className="text-gray-500">Loading...</p>}

      {!loading && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Name', 'Email', 'Joined', 'Entries', 'Admin', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((u) => {
                const isSelf = u.id === currentUser?.id;
                const totalEntries = u._count.foodEntries + u._count.exercises + u._count.waterIntakes + u._count.measurements;
                return (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{u.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{totalEntries}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 text-xs rounded-full font-medium ${
                        u.isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {u.isAdmin ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm space-x-2">
                      {!isSelf && (
                        <>
                          <button
                            onClick={() => handleToggleAdmin(u.id)}
                            disabled={togglingId === u.id}
                            className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50"
                          >
                            {togglingId === u.id ? '...' : u.isAdmin ? 'Remove admin' : 'Make admin'}
                          </button>
                          <button
                            onClick={() => handleDelete(u.id, `${u.firstName} ${u.lastName}`)}
                            disabled={deletingId === u.id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            {deletingId === u.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </>
                      )}
                      {isSelf && <span className="text-gray-400 text-xs">You</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {users.length === 0 && (
            <p className="text-center text-gray-500 py-8">No users found</p>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
