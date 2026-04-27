import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { exerciseService, ExerciseSummary } from '../../services/exercise.service';

export default function ExerciseSummaryWidget() {
  const [summary, setSummary] = useState<ExerciseSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      setLoading(true);
      const today = format(new Date(), 'yyyy-MM-dd');
      const response = await exerciseService.getDailySummary(today);
      setSummary(response.summary);
    } catch (error) {
      console.error('Failed to load exercise summary:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const totalMinutes = summary?.totalDuration || 0;
  const totalCalories = summary?.totalCalories || 0;
  const exerciseCount = summary?.count || 0;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Exercise Today</h2>
        <Link
          to="/exercise"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View All
        </Link>
      </div>

      {exerciseCount === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <p className="text-gray-500 mb-4">No exercise logged yet today</p>
          <Link
            to="/exercise"
            className="inline-block px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
          >
            Log Exercise
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalMinutes}</div>
              <div className="text-xs text-gray-600">Minutes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{totalCalories}</div>
              <div className="text-xs text-gray-600">Calories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{exerciseCount}</div>
              <div className="text-xs text-gray-600">Workouts</div>
            </div>
          </div>

          {summary && summary.exercises.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Recent Activities</h3>
              <div className="space-y-2">
                {summary.exercises.slice(0, 3).map((exercise) => (
                  <div
                    key={exercise.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      <span className="text-gray-800">{exercise.name}</span>
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                        {exercise.exerciseType}
                      </span>
                    </div>
                    <span className="text-gray-600">
                      {exercise.duration ? `${exercise.duration} min` : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
