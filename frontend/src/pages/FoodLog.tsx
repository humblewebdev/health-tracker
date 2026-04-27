import { useState, useEffect } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { nutritionService, DailySummary } from '../services/nutrition.service';
import { FoodEntry, MealType } from '../types';
import AppLayout from '../components/layout/AppLayout';
import AddFoodModal from '../components/features/AddFoodModal';

const MEAL_TYPES: MealType[] = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];

const MEAL_LABELS: Record<MealType, string> = {
  BREAKFAST: 'Breakfast',
  LUNCH: 'Lunch',
  DINNER: 'Dinner',
  SNACK: 'Snacks',
};

export default function FoodLog() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('BREAKFAST');

  useEffect(() => {
    loadDailySummary();
  }, [selectedDate]);

  const loadDailySummary = async () => {
    try {
      setLoading(true);
      const response = await nutritionService.getDailySummary(selectedDate);
      setSummary(response.summary);
    } catch (error) {
      console.error('Failed to load daily summary:', error);
    } finally {
      setLoading(false);
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

  const handleAddFood = (mealType: MealType) => {
    setSelectedMealType(mealType);
    setShowAddModal(true);
  };

  const handleDeleteEntry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
      await nutritionService.deleteFoodEntry(id);
      loadDailySummary();
    } catch (error) {
      console.error('Failed to delete entry:', error);
      alert('Failed to delete entry');
    }
  };

  const getEntriesForMeal = (mealType: MealType): FoodEntry[] => {
    if (!summary) return [];
    return summary.entries.filter((entry) => entry.mealType === mealType);
  };

  const isToday = selectedDate === format(new Date(), 'yyyy-MM-dd');
  const displayDate = format(new Date(selectedDate), 'EEEE, MMMM d, yyyy');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Food Log</h1>
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

        {/* Daily Summary */}
        {summary && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Daily Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{summary.totalCalories}</div>
                <div className="text-sm text-gray-600">Calories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{summary.totalProtein.toFixed(1)}g</div>
                <div className="text-sm text-gray-600">Protein</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{summary.totalCarbs.toFixed(1)}g</div>
                <div className="text-sm text-gray-600">Carbs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{summary.totalFats.toFixed(1)}g</div>
                <div className="text-sm text-gray-600">Fats</div>
              </div>
            </div>
          </div>
        )}

        {/* Meal Sections */}
        <div className="space-y-6">
          {MEAL_TYPES.map((mealType) => {
            const entries = getEntriesForMeal(mealType);
            const mealCalories = summary?.mealBreakdown[mealType].calories || 0;

            return (
              <div key={mealType} className="bg-white rounded-lg shadow">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {MEAL_LABELS[mealType]}
                      </h3>
                      <p className="text-sm text-gray-600">{mealCalories} calories</p>
                    </div>
                    <button
                      onClick={() => handleAddFood(mealType)}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                    >
                      Add Food
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  {entries.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No foods logged</p>
                  ) : (
                    <div className="space-y-3">
                      {entries.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-gray-800">{entry.foodName}</div>
                            {entry.brand && (
                              <div className="text-sm text-gray-600">{entry.brand}</div>
                            )}
                            <div className="text-sm text-gray-600">
                              {entry.servingSize} {entry.servingUnit}
                            </div>
                          </div>
                          <div className="text-right mr-4">
                            <div className="font-semibold text-gray-800">
                              {entry.calories} cal
                            </div>
                            <div className="text-xs text-gray-600">
                              P: {entry.protein}g | C: {entry.carbs}g | F: {entry.fats}g
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteEntry(entry.id)}
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
            );
          })}
        </div>

        {/* Add Food Modal */}
        <AddFoodModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={loadDailySummary}
          date={selectedDate}
          mealType={selectedMealType}
        />
      </div>
    </AppLayout>
  );
}
