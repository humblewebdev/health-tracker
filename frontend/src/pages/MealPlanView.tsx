import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import AppLayout from '../components/layout/AppLayout';
import { mealPlanService, MealPlan } from '../services/meal-plan.service';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function MealPlanView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [shoppingList, setShoppingList] = useState<any>(null);

  useEffect(() => {
    if (id) {
      loadMealPlan();
    }
  }, [id]);

  const loadMealPlan = async () => {
    try {
      setLoading(true);
      const response = await mealPlanService.getMealPlan(id!);
      setMealPlan(response.mealPlan);
    } catch (error) {
      console.error('Failed to load meal plan:', error);
      alert('Failed to load meal plan');
      navigate('/meal-plans');
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async () => {
    try {
      await mealPlanService.activateMealPlan(id!);
      alert('Meal plan activated successfully!');
      await loadMealPlan();
    } catch (error) {
      console.error('Failed to activate meal plan:', error);
      alert('Failed to activate meal plan');
    }
  };

  const handleApplyToDay = async (dayOfWeek: number) => {
    if (!mealPlan) return;

    const date = format(
      addDays(new Date(mealPlan.startDate), dayOfWeek),
      'yyyy-MM-dd'
    );

    if (confirm(`Apply meals from ${DAYS[dayOfWeek]} to your food log for ${format(new Date(date), 'MMM d, yyyy')}?`)) {
      try {
        await mealPlanService.applyMealPlanToDay(id!, date, dayOfWeek);
        alert('Meals added to your food log!');
      } catch (error) {
        console.error('Failed to apply meal plan:', error);
        alert('Failed to apply meal plan');
      }
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this meal plan?')) {
      try {
        await mealPlanService.deleteMealPlan(id!);
        navigate('/meal-plans');
      } catch (error) {
        console.error('Failed to delete meal plan:', error);
        alert('Failed to delete meal plan');
      }
    }
  };

  const loadShoppingList = async () => {
    try {
      const list = await mealPlanService.getShoppingList(id!);
      setShoppingList(list);
      setShowShoppingList(true);
    } catch (error) {
      console.error('Failed to load shopping list:', error);
      alert('Failed to load shopping list');
    }
  };

  const getMealsForDay = (dayOfWeek: number) => {
    if (!mealPlan) return [];
    return mealPlan.meals.filter((m) => m.dayOfWeek === dayOfWeek);
  };

  const calculateDayNutrition = (dayOfWeek: number) => {
    const meals = getMealsForDay(dayOfWeek);
    return meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.recipe.calories * meal.servings,
        protein: acc.protein + meal.recipe.protein * meal.servings,
        carbs: acc.carbs + meal.recipe.carbs * meal.servings,
        fats: acc.fats + meal.recipe.fats * meal.servings,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AppLayout>
    );
  }

  if (!mealPlan) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <p>Meal plan not found</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{mealPlan.name}</h1>
              <p className="text-gray-600 mt-1">
                {format(new Date(mealPlan.startDate), 'MMM d, yyyy')} -{' '}
                {format(new Date(mealPlan.endDate), 'MMM d, yyyy')}
              </p>
            </div>

            <div className="flex gap-2">
              <Link
                to="/meal-plans"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                ← Back to List
              </Link>
              {!mealPlan.isActive && (
                <button
                  onClick={handleActivate}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
                >
                  Set as Active
                </button>
              )}
              {mealPlan.isActive && (
                <span className="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-md">
                  ✓ Active Plan
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={loadShoppingList}
              className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md"
            >
              📋 Shopping List
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-md"
            >
              🗑️ Delete Plan
            </button>
          </div>
        </div>

        {/* Nutrition Summary */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Daily Targets</h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{mealPlan.targetCalories}</div>
              <div className="text-sm text-gray-600">Calories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{Math.round(mealPlan.targetProtein)}g</div>
              <div className="text-sm text-gray-600">Protein</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{Math.round(mealPlan.targetCarbs)}g</div>
              <div className="text-sm text-gray-600">Carbs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{Math.round(mealPlan.targetFats)}g</div>
              <div className="text-sm text-gray-600">Fats</div>
            </div>
          </div>

          {mealPlan.dietaryTags.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex flex-wrap gap-2">
                {mealPlan.dietaryTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Week View */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Weekly Meal Plan</h2>

          <div className="grid grid-cols-7 gap-4">
            {[0, 1, 2, 3, 4, 5, 6].map((day) => {
              const dayMeals = getMealsForDay(day);
              const nutrition = calculateDayNutrition(day);

              return (
                <div key={day} className="border rounded-lg p-3 bg-gray-50">
                  <div className="text-center mb-3">
                    <div className="font-semibold text-gray-800">{DAY_ABBR[day]}</div>
                    <div className="text-xs text-gray-600">
                      {Math.round(nutrition.calories)} cal
                    </div>
                  </div>

                  <div className="space-y-2">
                    {dayMeals.map((meal) => (
                      <div
                        key={meal.id}
                        className="p-2 bg-white rounded border border-gray-200 hover:border-blue-300 transition-colors"
                      >
                        <div className="text-xs text-gray-600 mb-1">{meal.mealType}</div>
                        <div className="font-medium text-sm text-gray-800 leading-tight">
                          {meal.recipe.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {Math.round(meal.recipe.calories * meal.servings)} cal
                        </div>
                        {meal.servings !== 1 && (
                          <div className="text-xs text-blue-600 mt-1">
                            {meal.servings}x servings
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleApplyToDay(day)}
                    className="w-full mt-3 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Apply to Log
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Shopping List Modal */}
        {showShoppingList && shoppingList && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-800">Shopping List</h2>
                  <button
                    onClick={() => setShowShoppingList(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {shoppingList.totalItems} ingredients for {mealPlan.name}
                </p>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="space-y-3">
                  {shoppingList.ingredients.map((item: any, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <input type="checkbox" className="mt-1" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">
                          {item.name} - {item.amount} {item.unit}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          Used in: {item.usedIn.join(', ')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 border-t">
                <button
                  onClick={() => window.print()}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Print Shopping List
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
