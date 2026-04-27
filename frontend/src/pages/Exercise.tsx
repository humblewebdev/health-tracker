import { useState, useEffect } from 'react';
import { format, addDays, subDays } from 'date-fns';
import AppLayout from '../components/layout/AppLayout';
import { exerciseService, CreateExerciseData, ExerciseSummary } from '../services/exercise.service';
import { ExerciseType, Intensity } from '../types';

const EXERCISE_TYPES: ExerciseType[] = ['CARDIO', 'STRENGTH', 'SPORTS', 'FLEXIBILITY', 'OTHER'];
const INTENSITIES: Intensity[] = ['LOW', 'MODERATE', 'HIGH', 'VERY_HIGH'];

export default function Exercise() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [summary, setSummary] = useState<ExerciseSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState<CreateExerciseData>({
    date: format(new Date(), 'yyyy-MM-dd'),
    exerciseType: 'CARDIO',
    name: '',
    duration: undefined,
    caloriesBurned: undefined,
    intensity: undefined,
    distance: undefined,
    averageHeartRate: undefined,
    sets: undefined,
    reps: undefined,
    weight: undefined,
    notes: '',
  });

  useEffect(() => {
    loadSummary();
  }, [selectedDate]);

  const loadSummary = async () => {
    try {
      setLoading(true);
      const response = await exerciseService.getDailySummary(selectedDate);
      setSummary(response.summary);
    } catch (error) {
      console.error('Failed to load exercise summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      alert('Please enter exercise name');
      return;
    }

    try {
      await exerciseService.createExercise({
        ...formData,
        date: selectedDate,
      });
      setShowAddForm(false);
      resetForm();
      await loadSummary();
    } catch (error) {
      console.error('Failed to add exercise:', error);
      alert('Failed to add exercise');
    }
  };

  const resetForm = () => {
    setFormData({
      date: selectedDate,
      exerciseType: 'CARDIO',
      name: '',
      duration: undefined,
      caloriesBurned: undefined,
      intensity: undefined,
      distance: undefined,
      averageHeartRate: undefined,
      sets: undefined,
      reps: undefined,
      weight: undefined,
      notes: '',
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this exercise?')) return;

    try {
      await exerciseService.deleteExercise(id);
      await loadSummary();
    } catch (error) {
      console.error('Failed to delete exercise:', error);
      alert('Failed to delete exercise');
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

  const isCardio = formData.exerciseType === 'CARDIO' || formData.exerciseType === 'SPORTS';
  const isStrength = formData.exerciseType === 'STRENGTH';

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Exercise Log</h1>
          <p className="text-gray-600 mt-1">Track your workouts and activity</p>
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Today's Summary</h2>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                {showAddForm ? 'Cancel' : 'Add Exercise'}
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{summary.totalDuration}</div>
                <div className="text-sm text-gray-600">Minutes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{summary.totalCalories}</div>
                <div className="text-sm text-gray-600">Calories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {summary.totalDistance.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">km</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{summary.count}</div>
                <div className="text-sm text-gray-600">Exercises</div>
              </div>
            </div>
          </div>
        )}

        {/* Add Exercise Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Log Exercise</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Exercise Type *
                  </label>
                  <select
                    value={formData.exerciseType}
                    onChange={(e) =>
                      setFormData({ ...formData, exerciseType: e.target.value as ExerciseType })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    {EXERCISE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0) + type.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Exercise Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="e.g., Running, Bench Press"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (min)
                  </label>
                  <input
                    type="number"
                    value={formData.duration || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: parseInt(e.target.value) || undefined })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Calories Burned
                  </label>
                  <input
                    type="number"
                    value={formData.caloriesBurned || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        caloriesBurned: parseInt(e.target.value) || undefined,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Intensity
                  </label>
                  <select
                    value={formData.intensity || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        intensity: e.target.value ? (e.target.value as Intensity) : undefined,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select intensity</option>
                    {INTENSITIES.map((intensity) => (
                      <option key={intensity} value={intensity}>
                        {intensity.charAt(0) + intensity.slice(1).toLowerCase().replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cardio-specific fields */}
              {isCardio && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-md">
                  <div>
                    <label className="block text-sm font-medium text-blue-800 mb-1">
                      Distance (km)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.distance || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          distance: parseFloat(e.target.value) || undefined,
                        })
                      }
                      className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-800 mb-1">
                      Avg Heart Rate (bpm)
                    </label>
                    <input
                      type="number"
                      value={formData.averageHeartRate || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          averageHeartRate: parseInt(e.target.value) || undefined,
                        })
                      }
                      className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Strength-specific fields */}
              {isStrength && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-green-50 rounded-md">
                  <div>
                    <label className="block text-sm font-medium text-green-800 mb-1">Sets</label>
                    <input
                      type="number"
                      value={formData.sets || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, sets: parseInt(e.target.value) || undefined })
                      }
                      className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-green-800 mb-1">Reps</label>
                    <input
                      type="number"
                      value={formData.reps || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, reps: parseInt(e.target.value) || undefined })
                      }
                      className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-green-800 mb-1">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.weight || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          weight: parseFloat(e.target.value) || undefined,
                        })
                      }
                      className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                Log Exercise
              </button>
            </form>
          </div>
        )}

        {/* Exercise History */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Exercise History</h2>

          {!summary || summary.exercises.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No exercises logged yet today</p>
          ) : (
            <div className="space-y-3">
              {summary.exercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-800">{exercise.name}</span>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                          {exercise.exerciseType}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                        {exercise.duration && <div>Duration: {exercise.duration} min</div>}
                        {exercise.caloriesBurned && (
                          <div>Calories: {exercise.caloriesBurned}</div>
                        )}
                        {exercise.distance && <div>Distance: {exercise.distance} km</div>}
                        {exercise.sets && exercise.reps && (
                          <div>
                            {exercise.sets} × {exercise.reps}
                            {exercise.weight && ` @ ${exercise.weight}kg`}
                          </div>
                        )}
                      </div>

                      {exercise.notes && (
                        <div className="text-sm text-gray-600 mt-2 italic">{exercise.notes}</div>
                      )}
                    </div>

                    <button
                      onClick={() => handleDelete(exercise.id)}
                      className="ml-4 text-red-600 hover:text-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
