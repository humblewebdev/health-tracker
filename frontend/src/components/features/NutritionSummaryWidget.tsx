import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { nutritionService, DailySummary } from '../../services/nutrition.service';
import { preferencesService } from '../../services/preferences.service';
import { UserPreferences } from '../../types';

export default function NutritionSummaryWidget() {
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const today = format(new Date(), 'yyyy-MM-dd');
      const [summaryResponse, prefsResponse] = await Promise.all([
        nutritionService.getDailySummary(today),
        preferencesService.getPreferences(),
      ]);
      setSummary(summaryResponse.summary);
      setPreferences(prefsResponse.preferences);
    } catch (error) {
      console.error('Failed to load nutrition data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const calorieGoal = preferences?.dailyCalorieGoal || 2000;
  const proteinGoal = preferences?.dailyProteinGoal || 150;
  const carbsGoal = preferences?.dailyCarbsGoal || 200;
  const fatsGoal = preferences?.dailyFatsGoal || 65;

  const totalCalories = summary?.totalCalories || 0;
  const totalProtein = summary?.totalProtein || 0;
  const totalCarbs = summary?.totalCarbs || 0;
  const totalFats = summary?.totalFats || 0;

  const caloriePercent = Math.min((totalCalories / calorieGoal) * 100, 100);
  const proteinPercent = Math.min((totalProtein / proteinGoal) * 100, 100);
  const carbsPercent = Math.min((totalCarbs / carbsGoal) * 100, 100);
  const fatsPercent = Math.min((totalFats / fatsGoal) * 100, 100);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Today's Nutrition</h2>

      {/* Calories */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">Calories</span>
          <span className="text-sm font-semibold text-gray-800">
            {totalCalories} / {calorieGoal}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${caloriePercent}%` }}
          ></div>
        </div>
      </div>

      {/* Protein */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">Protein</span>
          <span className="text-sm font-semibold text-gray-800">
            {totalProtein.toFixed(1)}g / {proteinGoal}g
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${proteinPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Carbs */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">Carbs</span>
          <span className="text-sm font-semibold text-gray-800">
            {totalCarbs.toFixed(1)}g / {carbsGoal}g
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-yellow-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${carbsPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Fats */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">Fats</span>
          <span className="text-sm font-semibold text-gray-800">
            {totalFats.toFixed(1)}g / {fatsGoal}g
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-purple-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${fatsPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Remaining Calories */}
      <div className="mt-6 p-3 bg-blue-50 rounded-lg">
        <div className="text-center">
          <div className="text-sm text-blue-800 font-medium">Remaining</div>
          <div className="text-2xl font-bold text-blue-600">
            {Math.max(0, calorieGoal - totalCalories)} cal
          </div>
        </div>
      </div>
    </div>
  );
}
