import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import FoodLog from './pages/FoodLog';
import Measurements from './pages/Measurements';
import Water from './pages/Water';
import Exercise from './pages/Exercise';
import MealPlansList from './pages/MealPlansList';
import MealPlanGenerator from './pages/MealPlanGenerator';
import MealPlanView from './pages/MealPlanView';
import Settings from './pages/Settings';
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  const { loadUser, isAuthenticated } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/nutrition"
          element={
            <ProtectedRoute>
              <FoodLog />
            </ProtectedRoute>
          }
        />
        <Route
          path="/measurements"
          element={
            <ProtectedRoute>
              <Measurements />
            </ProtectedRoute>
          }
        />
        <Route
          path="/water"
          element={
            <ProtectedRoute>
              <Water />
            </ProtectedRoute>
          }
        />
        <Route
          path="/exercise"
          element={
            <ProtectedRoute>
              <Exercise />
            </ProtectedRoute>
          }
        />
        <Route
          path="/meal-plans"
          element={
            <ProtectedRoute>
              <MealPlansList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/meal-plans/generator"
          element={
            <ProtectedRoute>
              <MealPlanGenerator />
            </ProtectedRoute>
          }
        />
        <Route
          path="/meal-plans/:id"
          element={
            <ProtectedRoute>
              <MealPlanView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
