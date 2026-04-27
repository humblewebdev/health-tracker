import { Link } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import NutritionSummaryWidget from '../components/features/NutritionSummaryWidget';
import WaterTrackingWidget from '../components/features/WaterTrackingWidget';
import ExerciseSummaryWidget from '../components/features/ExerciseSummaryWidget';
import TrendsCharts from '../components/features/TrendsCharts';
import RecentActivityTimeline from '../components/features/RecentActivityTimeline';

export default function Dashboard() {
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome to your Health Tracker</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  to="/nutrition"
                  className="flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <div>
                    <h3 className="font-medium text-blue-900">Log Food</h3>
                    <p className="text-sm text-blue-700">Track your meals</p>
                  </div>
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>

                <Link
                  to="/exercise"
                  className="flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                >
                  <div>
                    <h3 className="font-medium text-purple-900">Log Exercise</h3>
                    <p className="text-sm text-purple-700">Track your workouts</p>
                  </div>
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>

                <Link
                  to="/measurements"
                  className="flex items-center justify-between p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                >
                  <div>
                    <h3 className="font-medium text-orange-900">Measurements</h3>
                    <p className="text-sm text-orange-700">Track your progress</p>
                  </div>
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>

                <Link
                  to="/settings"
                  className="flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <div>
                    <h3 className="font-medium text-green-900">Settings</h3>
                    <p className="text-sm text-green-700">Set your goals</p>
                  </div>
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Trends & Analytics */}
            <TrendsCharts />

            {/* Recent Activity */}
            <RecentActivityTimeline />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <NutritionSummaryWidget />
            <ExerciseSummaryWidget />
            <WaterTrackingWidget />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
