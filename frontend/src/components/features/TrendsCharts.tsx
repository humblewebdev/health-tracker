import { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { dashboardService, TrendsData } from '../../services/dashboard.service';

type TimeRange = '7' | '30' | '90';

export default function TrendsCharts() {
  const [timeRange, setTimeRange] = useState<TimeRange>('7');
  const [trendsData, setTrendsData] = useState<TrendsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'nutrition' | 'exercise' | 'water' | 'weight'>('nutrition');

  useEffect(() => {
    loadTrends();
  }, [timeRange]);

  const loadTrends = async () => {
    try {
      setLoading(true);
      const endDate = format(new Date(), 'yyyy-MM-dd');
      const startDate = format(subDays(new Date(), parseInt(timeRange) - 1), 'yyyy-MM-dd');
      const response = await dashboardService.getTrendsData(startDate, endDate);
      setTrendsData(response.trends);
    } catch (error) {
      console.error('Failed to load trends:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!trendsData) return null;

  const tabs = [
    { id: 'nutrition' as const, label: 'Nutrition' },
    { id: 'exercise' as const, label: 'Exercise' },
    { id: 'water' as const, label: 'Water' },
    { id: 'weight' as const, label: 'Weight' },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Trends & Analytics</h2>

        <div className="flex gap-2">
          {(['7', '30', '90'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-sm font-medium rounded-md ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range} days
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Charts */}
      {activeTab === 'nutrition' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-4">Daily Calories</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendsData.nutrition.daily}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => format(new Date(date), 'MMM d')}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(date) => format(new Date(date as string), 'MMM d, yyyy')}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="calories"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  name="Calories"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-4">Macronutrients</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendsData.nutrition.daily}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => format(new Date(date), 'MMM d')}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(date) => format(new Date(date as string), 'MMM d, yyyy')}
                />
                <Legend />
                <Line type="monotone" dataKey="protein" stroke="#10B981" name="Protein (g)" />
                <Line type="monotone" dataKey="carbs" stroke="#F59E0B" name="Carbs (g)" />
                <Line type="monotone" dataKey="fats" stroke="#EF4444" name="Fats (g)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-4 gap-4 mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="text-center">
              <div className="text-sm text-blue-800 font-medium">Avg Calories</div>
              <div className="text-2xl font-bold text-blue-600">
                {trendsData.nutrition.averages.calories}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-green-800 font-medium">Avg Protein</div>
              <div className="text-2xl font-bold text-green-600">
                {trendsData.nutrition.averages.protein}g
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-orange-800 font-medium">Avg Carbs</div>
              <div className="text-2xl font-bold text-orange-600">
                {trendsData.nutrition.averages.carbs}g
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-red-800 font-medium">Avg Fats</div>
              <div className="text-2xl font-bold text-red-600">
                {trendsData.nutrition.averages.fats}g
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'exercise' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-4">Daily Exercise Duration</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={trendsData.exercise.daily}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => format(new Date(date), 'MMM d')}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(date) => format(new Date(date as string), 'MMM d, yyyy')}
                />
                <Legend />
                <Bar dataKey="duration" fill="#8B5CF6" name="Minutes" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-4">Calories Burned</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendsData.exercise.daily}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => format(new Date(date), 'MMM d')}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(date) => format(new Date(date as string), 'MMM d, yyyy')}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="calories"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  name="Calories"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-4 gap-4 mt-6 p-4 bg-purple-50 rounded-lg">
            <div className="text-center">
              <div className="text-sm text-purple-800 font-medium">Total Duration</div>
              <div className="text-2xl font-bold text-purple-600">
                {trendsData.exercise.totals.duration} min
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-orange-800 font-medium">Total Calories</div>
              <div className="text-2xl font-bold text-orange-600">
                {trendsData.exercise.totals.calories}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-blue-800 font-medium">Total Distance</div>
              <div className="text-2xl font-bold text-blue-600">
                {trendsData.exercise.totals.distance} km
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-green-800 font-medium">Workouts</div>
              <div className="text-2xl font-bold text-green-600">
                {trendsData.exercise.totals.count}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'water' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-4">Daily Water Intake</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trendsData.water.daily}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => format(new Date(date), 'MMM d')}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(date) => format(new Date(date as string), 'MMM d, yyyy')}
                  formatter={(value: number) => [`${value} ml`, 'Water']}
                />
                <Legend />
                <Bar dataKey="amount" fill="#06B6D4" name="Water (ml)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-center p-4 bg-cyan-50 rounded-lg">
            <div className="text-sm text-cyan-800 font-medium">Average Daily Intake</div>
            <div className="text-3xl font-bold text-cyan-600">
              {trendsData.water.average} ml
            </div>
            <div className="text-sm text-cyan-700 mt-1">
              {(trendsData.water.average / 1000).toFixed(1)} liters per day
            </div>
          </div>
        </div>
      )}

      {activeTab === 'weight' && (
        <div className="space-y-6">
          {trendsData.weight.data.length > 0 ? (
            <>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-4">Weight Progress</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendsData.weight.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => format(new Date(date), 'MMM d')}
                    />
                    <YAxis domain={['dataMin - 2', 'dataMax + 2']} />
                    <Tooltip
                      labelFormatter={(date) => format(new Date(date as string), 'MMM d, yyyy')}
                      formatter={(value: number) => [`${value} kg`, 'Weight']}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="#F97316"
                      strokeWidth={2}
                      name="Weight (kg)"
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-orange-50 rounded-lg">
                <div className="text-center">
                  <div className="text-sm text-orange-800 font-medium">Weight Change</div>
                  <div className={`text-3xl font-bold ${
                    trendsData.weight.change > 0 ? 'text-red-600' :
                    trendsData.weight.change < 0 ? 'text-green-600' :
                    'text-gray-600'
                  }`}>
                    {trendsData.weight.change > 0 ? '+' : ''}
                    {trendsData.weight.change} kg
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-orange-800 font-medium">Trend</div>
                  <div className="text-3xl font-bold text-orange-600">
                    {trendsData.weight.trend === 'up' ? '↑' :
                     trendsData.weight.trend === 'down' ? '↓' : '→'}
                  </div>
                  <div className="text-sm text-orange-700 mt-1 capitalize">
                    {trendsData.weight.trend}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No weight data available for this period</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
