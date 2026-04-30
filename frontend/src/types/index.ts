// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  height?: number;
  activityLevel?: 'SEDENTARY' | 'LIGHTLY_ACTIVE' | 'MODERATELY_ACTIVE' | 'VERY_ACTIVE' | 'EXTREMELY_ACTIVE';
  isAdmin?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Auth types
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// Nutrition types
export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

export interface FoodEntry {
  id: string;
  userId: string;
  date: string;
  mealType: MealType;
  time: string;
  foodName: string;
  brand?: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  sugar: number;
  sodium: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomFood {
  id: string;
  userId: string;
  name: string;
  brand?: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  sugar: number;
  sodium: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

// Exercise types
export type ExerciseType = 'CARDIO' | 'STRENGTH' | 'SPORTS' | 'FLEXIBILITY' | 'OTHER';
export type Intensity = 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';

export interface Exercise {
  id: string;
  userId: string;
  date: string;
  time: string;
  exerciseType: ExerciseType;
  name: string;
  duration?: number;
  caloriesBurned?: number;
  intensity?: Intensity;
  distance?: number;
  averageHeartRate?: number;
  sets?: number;
  reps?: number;
  weight?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Measurement types
export type MeasurementType = 'WEIGHT' | 'BODY_COMPOSITION' | 'BODY_MEASUREMENTS';

export interface Measurement {
  id: string;
  userId: string;
  date: string;
  measurementType: MeasurementType;
  weight?: number;
  bmi?: number;
  bodyFatPercent?: number;
  muscleMass?: number;
  boneMass?: number;
  waterPercent?: number;
  neck?: number;
  shoulders?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  leftThigh?: number;
  rightThigh?: number;
  leftArm?: number;
  rightArm?: number;
  leftCalf?: number;
  rightCalf?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Water intake types
export interface WaterIntake {
  id: string;
  userId: string;
  date: string;
  time: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

// User preferences types
export type UnitSystem = 'METRIC' | 'IMPERIAL';
export type WeightGoalType = 'LOSE' | 'MAINTAIN' | 'GAIN';

export interface UserPreferences {
  id: string;
  userId: string;
  dailyCalorieGoal: number;
  dailyProteinGoal: number;
  dailyCarbsGoal: number;
  dailyFatsGoal: number;
  dailyFiberGoal: number;
  dailyWaterGoal: number;
  targetWeight?: number;
  weightGoalType: WeightGoalType;
  unitSystem: UnitSystem;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}
