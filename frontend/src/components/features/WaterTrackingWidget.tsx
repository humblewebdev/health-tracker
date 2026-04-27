import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { waterService, WaterSummary } from '../../services/water.service';

interface WaterTrackingWidgetProps {
  onUpdate?: () => void;
}

export default function WaterTrackingWidget({ onUpdate }: WaterTrackingWidgetProps) {
  const [summary, setSummary] = useState<WaterSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [customAmount, setCustomAmount] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      setLoading(true);
      const today = format(new Date(), 'yyyy-MM-dd');
      const response = await waterService.getDailySummary(today);
      setSummary(response.summary);
    } catch (error) {
      console.error('Failed to load water summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdd = async (amount: number) => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      await waterService.quickAdd(amount, today);
      await loadSummary();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to add water:', error);
      alert('Failed to add water intake');
    }
  };

  const handleCustomAdd = async () => {
    const amount = parseInt(customAmount);
    if (!amount || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    await handleQuickAdd(amount);
    setCustomAmount('');
    setShowCustom(false);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Water Intake</h2>
        <p className="text-gray-500">Failed to load water data</p>
      </div>
    );
  }

  const percentage = summary.percentage;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Water Intake</h2>

      {/* Circular Progress */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="#3b82f6"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 56}`}
              strokeDashoffset={`${2 * Math.PI * 56 * (1 - percentage / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-2xl font-bold text-blue-600">{summary.totalAmount}</div>
            <div className="text-xs text-gray-600">ml</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="text-center mb-4">
        <div className="text-sm text-gray-600">
          Goal: {summary.goal} ml ({percentage.toFixed(0)}%)
        </div>
        <div className="text-sm text-gray-600">
          Remaining: {summary.remaining} ml
        </div>
      </div>

      {/* Quick Add Buttons */}
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleQuickAdd(250)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md transition-colors"
          >
            + 250ml
          </button>
          <button
            onClick={() => handleQuickAdd(500)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md transition-colors"
          >
            + 500ml
          </button>
        </div>

        {!showCustom ? (
          <button
            onClick={() => setShowCustom(true)}
            className="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
          >
            Custom Amount
          </button>
        ) : (
          <div className="flex gap-2">
            <input
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Amount (ml)"
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handleCustomAdd}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowCustom(false);
                setCustomAmount('');
              }}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Recent Intakes */}
      {summary.intakes.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Today's Log ({summary.count} entries)
          </h3>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {summary.intakes.slice(0, 5).map((intake) => (
              <div
                key={intake.id}
                className="flex items-center justify-between text-sm text-gray-600"
              >
                <span>{format(new Date(intake.time), 'h:mm a')}</span>
                <span className="font-medium">{intake.amount} ml</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
