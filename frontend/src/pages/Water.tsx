import { useState, useEffect } from 'react';
import { format, addDays, subDays } from 'date-fns';
import AppLayout from '../components/layout/AppLayout';
import { waterService, WaterSummary } from '../services/water.service';
import { WaterIntake } from '../types';

export default function Water() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [summary, setSummary] = useState<WaterSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [customAmount, setCustomAmount] = useState('');

  useEffect(() => {
    loadSummary();
  }, [selectedDate]);

  const loadSummary = async () => {
    try {
      setLoading(true);
      const response = await waterService.getDailySummary(selectedDate);
      setSummary(response.summary);
    } catch (error) {
      console.error('Failed to load water summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdd = async (amount: number) => {
    try {
      await waterService.quickAdd(amount, selectedDate);
      await loadSummary();
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
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
      await waterService.deleteWaterIntake(id);
      await loadSummary();
    } catch (error) {
      console.error('Failed to delete entry:', error);
      alert('Failed to delete entry');
    }
  };

  const handlePreviousDay = () => {
    setSelectedDate(format(subDays(new Date(selectedDate), 1), 'yyyy-MM-dd'));
  };

  const handleNextDay = () => {
    setSelectedDate(format(addDays(new Date(selectedDate), 1), 'yyyy-MM-dd'));
  };

  const handleToday = () => {
    setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
  };

  const isToday = selectedDate === format(new Date(), 'yyyy-MM-dd');
  const displayDate = format(new Date(selectedDate), 'EEEE, MMMM d, yyyy');

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AppLayout>
    );
  }

  const percentage = summary?.percentage || 0;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Water Intake</h1>
          <p className="text-gray-600 mt-1">Track your daily water consumption</p>
        </div>

        {/* Date Navigation */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePreviousDay}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Previous
            </button>

            <div className="text-center">
              <div className="text-lg font-semibold text-gray-800">{displayDate}</div>
              {!isToday && (
                <button
                  onClick={handleToday}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Jump to Today
                </button>
              )}
            </div>

            <button
              onClick={handleNextDay}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Next
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Progress Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Today's Progress</h2>

            {/* Circular Progress */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <svg className="w-48 h-48 transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="#e5e7eb"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="#3b82f6"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 88}`}
                    strokeDashoffset={`${2 * Math.PI * 88 * (1 - percentage / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-4xl font-bold text-blue-600">
                    {summary?.totalAmount || 0}
                  </div>
                  <div className="text-sm text-gray-600">ml</div>
                  <div className="text-xs text-gray-500 mt-2">
                    {percentage.toFixed(0)}% of goal
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-gray-600">Goal</div>
                <div className="text-lg font-bold text-gray-800">
                  {summary?.goal || 0} ml
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Remaining</div>
                <div className="text-lg font-bold text-orange-600">
                  {summary?.remaining || 0} ml
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Entries</div>
                <div className="text-lg font-bold text-blue-600">{summary?.count || 0}</div>
              </div>
            </div>
          </div>

          {/* Quick Add Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Add</h2>

            <div className="space-y-3">
              <button
                onClick={() => handleQuickAdd(100)}
                className="w-full px-4 py-3 text-left font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                <span className="text-blue-600 mr-2">+</span> 100 ml (Small glass)
              </button>

              <button
                onClick={() => handleQuickAdd(250)}
                className="w-full px-4 py-3 text-left font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                <span className="text-blue-600 mr-2">+</span> 250 ml (Cup)
              </button>

              <button
                onClick={() => handleQuickAdd(500)}
                className="w-full px-4 py-3 text-left font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                <span className="text-blue-600 mr-2">+</span> 500 ml (Bottle)
              </button>

              <button
                onClick={() => handleQuickAdd(750)}
                className="w-full px-4 py-3 text-left font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                <span className="text-blue-600 mr-2">+</span> 750 ml (Large bottle)
              </button>

              <div className="pt-3 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Amount
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Amount in ml"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={handleCustomAdd}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* History */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Today's Log</h2>

          {!summary || summary.intakes.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No water logged yet today</p>
          ) : (
            <div className="space-y-2">
              {summary.intakes.map((intake) => (
                <div
                  key={intake.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100"
                >
                  <div>
                    <div className="font-medium text-gray-800">{intake.amount} ml</div>
                    <div className="text-sm text-gray-600">
                      {format(new Date(intake.time), 'h:mm a')}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(intake.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
