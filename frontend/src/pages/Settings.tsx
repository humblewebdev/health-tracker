import { useState, useEffect } from 'react';
import { preferencesService, UpdatePreferencesData } from '../services/preferences.service';
import { UserPreferences } from '../types';
import AppLayout from '../components/layout/AppLayout';

export default function Settings() {
  const [_preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [formData, setFormData] = useState<UpdatePreferencesData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const response = await preferencesService.getPreferences();
      setPreferences(response.preferences);
      setFormData({
        dailyCalorieGoal: response.preferences.dailyCalorieGoal,
        dailyProteinGoal: response.preferences.dailyProteinGoal,
        dailyCarbsGoal: response.preferences.dailyCarbsGoal,
        dailyFatsGoal: response.preferences.dailyFatsGoal,
        dailyFiberGoal: response.preferences.dailyFiberGoal,
        dailyWaterGoal: response.preferences.dailyWaterGoal,
        targetWeight: response.preferences.targetWeight || undefined,
        weightGoalType: response.preferences.weightGoalType,
        unitSystem: response.preferences.unitSystem,
      });
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ['dailyCalorieGoal', 'dailyProteinGoal', 'dailyCarbsGoal', 'dailyFatsGoal', 'dailyFiberGoal', 'dailyWaterGoal', 'targetWeight'].includes(name)
        ? parseFloat(value) || undefined
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    try {
      setSaving(true);
      const response = await preferencesService.updatePreferences(formData);
      setPreferences(response.preferences);
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your nutrition goals and preferences</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-md ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nutrition Goals */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Daily Nutrition Goals</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Calorie Goal
                </label>
                <input
                  type="number"
                  name="dailyCalorieGoal"
                  value={formData.dailyCalorieGoal || ''}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Protein Goal (g)
                </label>
                <input
                  type="number"
                  name="dailyProteinGoal"
                  value={formData.dailyProteinGoal || ''}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Carbs Goal (g)
                </label>
                <input
                  type="number"
                  name="dailyCarbsGoal"
                  value={formData.dailyCarbsGoal || ''}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fats Goal (g)
                </label>
                <input
                  type="number"
                  name="dailyFatsGoal"
                  value={formData.dailyFatsGoal || ''}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fiber Goal (g)
                </label>
                <input
                  type="number"
                  name="dailyFiberGoal"
                  value={formData.dailyFiberGoal || ''}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Water Goal */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Water Goal</h2>

            <div className="max-w-xs">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Daily Water Goal (ml)
              </label>
              <input
                type="number"
                name="dailyWaterGoal"
                value={formData.dailyWaterGoal || ''}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Weight Goals */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Weight Goals</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Weight (kg)
                </label>
                <input
                  type="number"
                  name="targetWeight"
                  value={formData.targetWeight || ''}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Goal Type
                </label>
                <select
                  name="weightGoalType"
                  value={formData.weightGoalType || 'MAINTAIN'}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="LOSE">Lose Weight</option>
                  <option value="MAINTAIN">Maintain Weight</option>
                  <option value="GAIN">Gain Weight</option>
                </select>
              </div>
            </div>
          </div>

          {/* System Preferences */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">System Preferences</h2>

            <div className="max-w-xs">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit System
              </label>
              <select
                name="unitSystem"
                value={formData.unitSystem || 'METRIC'}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="METRIC">Metric (kg, cm, ml)</option>
                <option value="IMPERIAL">Imperial (lb, in, oz)</option>
              </select>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
