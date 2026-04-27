import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { nutritionService } from '../../services/nutrition.service';
import { exerciseService } from '../../services/exercise.service';
import { waterService } from '../../services/water.service';
import { measurementsService } from '../../services/measurements.service';
import { FoodEntry, Exercise, WaterIntake, Measurement } from '../../types';

interface Activity {
  id: string;
  type: 'food' | 'exercise' | 'water' | 'measurement';
  timestamp: Date;
  description: string;
  icon: string;
  color: string;
  details?: string;
}

export default function RecentActivityTimeline() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentActivities();
  }, []);

  const loadRecentActivities = async () => {
    try {
      setLoading(true);
      const today = format(new Date(), 'yyyy-MM-dd');

      // Fetch recent data
      const [foodResponse, exerciseResponse, waterResponse, measurementResponse] = await Promise.all([
        nutritionService.getFoodEntries({ date: today }),
        exerciseService.getExercises({ date: today }),
        waterService.getWaterIntakes({ date: today }),
        measurementsService.getMeasurements(),
      ]);

      const allActivities: Activity[] = [];

      // Process food entries
      foodResponse.entries.slice(0, 5).forEach((entry: FoodEntry) => {
        allActivities.push({
          id: entry.id,
          type: 'food',
          timestamp: new Date(entry.date),
          description: `Logged ${entry.foodName}`,
          icon: '🍽️',
          color: 'bg-blue-100 text-blue-600',
          details: `${entry.calories} cal • ${entry.mealType}`,
        });
      });

      // Process exercises
      exerciseResponse.exercises.slice(0, 5).forEach((exercise: Exercise) => {
        allActivities.push({
          id: exercise.id,
          type: 'exercise',
          timestamp: new Date(exercise.date),
          description: `Completed ${exercise.name}`,
          icon: '💪',
          color: 'bg-purple-100 text-purple-600',
          details: exercise.duration ? `${exercise.duration} min` : undefined,
        });
      });

      // Process water intakes
      waterResponse.intakes.slice(0, 5).forEach((intake: WaterIntake) => {
        allActivities.push({
          id: intake.id,
          type: 'water',
          timestamp: intake.time ? new Date(intake.time) : new Date(intake.date),
          description: `Drank water`,
          icon: '💧',
          color: 'bg-cyan-100 text-cyan-600',
          details: `${intake.amount} ml`,
        });
      });

      // Process measurements
      measurementResponse.measurements.slice(0, 3).forEach((measurement: Measurement) => {
        let description = '';
        let details = '';

        if (measurement.measurementType === 'WEIGHT') {
          description = 'Logged weight';
          details = `${measurement.weight} kg${measurement.bmi ? ` • BMI: ${measurement.bmi}` : ''}`;
        } else if (measurement.measurementType === 'BODY_COMPOSITION') {
          description = 'Updated body composition';
          details = measurement.bodyFatPercent ? `${measurement.bodyFatPercent}% body fat` : '';
        } else {
          description = 'Logged measurements';
          details = 'Body measurements';
        }

        allActivities.push({
          id: measurement.id,
          type: 'measurement',
          timestamp: new Date(measurement.date),
          description,
          icon: '📊',
          color: 'bg-orange-100 text-orange-600',
          details,
        });
      });

      // Sort by timestamp descending
      allActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      setActivities(allActivities.slice(0, 10));
    } catch (error) {
      console.error('Failed to load recent activities:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>

      {activities.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={`${activity.type}-${activity.id}`}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className={`flex-shrink-0 w-10 h-10 rounded-full ${activity.color} flex items-center justify-center text-xl`}>
                {activity.icon}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800">{activity.description}</p>
                {activity.details && (
                  <p className="text-xs text-gray-600">{activity.details}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {format(activity.timestamp, 'MMM d, yyyy h:mm a')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
