import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import AppLayout from '../components/layout/AppLayout';
import { mealPlanService } from '../services/meal-plan.service';

export default function MealPlanGenerator() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    startDate: format(new Date(), 'yyyy-MM-dd'),
    duration: 7,
    mealsPerDay: 3,
    dietaryPreferences: [] as string[],
    excludedFoods: '',
    useUserGoals: true,
  });

  const handleGenerate = async () => {
    try {
      setLoading(true);

      const endDate = format(
        addDays(new Date(formData.startDate), formData.duration - 1),
        'yyyy-MM-dd'
      );

      const response = await mealPlanService.generateMealPlan({
        startDate: formData.startDate,
        endDate,
        mealsPerDay: formData.mealsPerDay,
        dietaryPreferences: formData.dietaryPreferences,
        excludedFoods: formData.excludedFoods
          .split(',')
          .map((f) => f.trim())
          .filter((f) => f),
        useUserGoals: formData.useUserGoals,
      });

      navigate(`/meal-plans/${response.mealPlan.id}`);
    } catch (error: any) {
      console.error('Failed to generate meal plan:', error);
      alert(error.response?.data?.error || 'Failed to generate meal plan');
    } finally {
      setLoading(false);
    }
  };

  const togglePreference = (pref: string) => {
    setFormData({
      ...formData,
      dietaryPreferences: formData.dietaryPreferences.includes(pref)
        ? formData.dietaryPreferences.filter((p) => p !== pref)
        : [...formData.dietaryPreferences, pref],
    });
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Generate Meal Plan</h1>
          <p className="text-gray-600 mt-1">
            Create a personalized meal plan based on your goals and preferences
          </p>
        </div>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2].map((s) => (
              <div key={s} className="flex-1">
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {s}
                  </div>
                  {s < 2 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        step > s ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    ></div>
                  )}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {s === 1 ? 'Plan Details' : 'Preferences'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Plan Details */}
        {step === 1 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Step 1: Plan Details</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="3">3 days</option>
                  <option value="7">7 days (1 week)</option>
                  <option value="14">14 days (2 weeks)</option>
                  <option value="21">21 days (3 weeks)</option>
                  <option value="30">30 days (1 month)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Plan will end on {format(addDays(new Date(formData.startDate), formData.duration - 1), 'MMM d, yyyy')}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meals per day
                </label>
                <select
                  value={formData.mealsPerDay}
                  onChange={(e) =>
                    setFormData({ ...formData, mealsPerDay: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="2">2 meals (IF / fasting)</option>
                  <option value="3">3 meals (standard)</option>
                  <option value="4">4 meals (includes 1 snack)</option>
                  <option value="5">5 meals (includes 2 snacks)</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="useUserGoals"
                  checked={formData.useUserGoals}
                  onChange={(e) =>
                    setFormData({ ...formData, useUserGoals: e.target.checked })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="useUserGoals" className="ml-2 text-sm text-gray-700">
                  Use my nutrition goals from settings
                </label>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                Next: Dietary Preferences →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Dietary Preferences */}
        {step === 2 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Step 2: Dietary Preferences
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select your dietary preferences
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'vegetarian', label: 'Vegetarian', icon: '🥗' },
                    { id: 'vegan', label: 'Vegan', icon: '🌱' },
                    { id: 'gluten-free', label: 'Gluten-Free', icon: '🌾' },
                    { id: 'dairy-free', label: 'Dairy-Free', icon: '🥛' },
                    { id: 'keto', label: 'Keto', icon: '🥑' },
                    { id: 'paleo', label: 'Paleo', icon: '🍖' },
                  ].map((pref) => (
                    <button
                      key={pref.id}
                      onClick={() => togglePreference(pref.id)}
                      className={`flex items-center gap-3 p-4 border-2 rounded-lg transition-colors ${
                        formData.dietaryPreferences.includes(pref.id)
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-2xl">{pref.icon}</span>
                      <span className="font-medium text-gray-800">{pref.label}</span>
                      {formData.dietaryPreferences.includes(pref.id) && (
                        <svg
                          className="ml-auto w-5 h-5 text-blue-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Foods to exclude (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., nuts, seafood, mushrooms (comma-separated)"
                  value={formData.excludedFoods}
                  onChange={(e) => setFormData({ ...formData, excludedFoods: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recipes containing these ingredients will be excluded
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-medium"
                >
                  ← Back
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Generating...' : 'Generate Meal Plan ✨'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
