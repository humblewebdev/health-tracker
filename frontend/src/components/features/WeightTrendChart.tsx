import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { measurementsService, WeightTrendsResponse } from '../../services/measurements.service';

interface WeightTrendChartProps {
  days?: number;
}

export default function WeightTrendChart({ days = 30 }: WeightTrendChartProps) {
  const [data, setData] = useState<WeightTrendsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState(days);

  useEffect(() => {
    loadData();
  }, [selectedDays]);

  const loadData = async () => {
    try {
      setLoading(true);
      const trends = await measurementsService.getWeightTrends(selectedDays);
      setData(trends);
    } catch (error) {
      console.error('Failed to load weight trends:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data || data.measurements.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Weight Trends</h2>
        <p className="text-gray-500 text-center py-12">
          No weight data available. Start logging your weight to see trends.
        </p>
      </div>
    );
  }

  const chartData = data.measurements.map((m) => ({
    date: format(new Date(m.date), 'MMM d'),
    weight: m.weight,
  }));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Weight Trends</h2>
        <select
          value={selectedDays}
          onChange={(e) => setSelectedDays(Number(e.target.value))}
          className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {data.stats.current !== null && (
          <div className="text-center">
            <div className="text-sm text-gray-600">Current</div>
            <div className="text-lg font-bold text-blue-600">{data.stats.current} kg</div>
          </div>
        )}
        {data.stats.average !== null && (
          <div className="text-center">
            <div className="text-sm text-gray-600">Average</div>
            <div className="text-lg font-bold text-gray-800">{data.stats.average} kg</div>
          </div>
        )}
        {data.stats.min !== null && (
          <div className="text-center">
            <div className="text-sm text-gray-600">Min</div>
            <div className="text-lg font-bold text-green-600">{data.stats.min} kg</div>
          </div>
        )}
        {data.stats.max !== null && (
          <div className="text-center">
            <div className="text-sm text-gray-600">Max</div>
            <div className="text-lg font-bold text-red-600">{data.stats.max} kg</div>
          </div>
        )}
        {data.stats.change !== null && (
          <div className="text-center">
            <div className="text-sm text-gray-600">Change</div>
            <div
              className={`text-lg font-bold ${
                data.stats.change > 0
                  ? 'text-red-600'
                  : data.stats.change < 0
                  ? 'text-green-600'
                  : 'text-gray-800'
              }`}
            >
              {data.stats.change > 0 ? '+' : ''}
              {data.stats.change} kg
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            domain={['dataMin - 2', 'dataMax + 2']}
            label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
