# Meal Plan Feature Setup Guide

## Backend Setup Complete ✅

The following have been implemented:
- ✅ Database schema for recipes and meal plans
- ✅ Recipe service with CRUD operations
- ✅ Meal plan generator algorithm
- ✅ Meal plan management service
- ✅ API endpoints for recipes and meal plans
- ✅ 12 sample recipes seed data

## Database Migration & Seed

### Step 1: Run Prisma Migration

```bash
cd backend
npx prisma migrate dev --name add-meal-plans
```

This will:
- Create the new tables (Recipe, RecipeIngredient, MealPlan, MealPlanRecipe)
- Update the database schema

### Step 2: Seed Recipe Database

```bash
cd backend
npx ts-node src/database/seeds/recipes.seed.ts
```

This will create 12 sample recipes:
- 3 Breakfast recipes
- 2 Lunch recipes
- 3 Dinner recipes
- 2 Snack recipes
- 2 Smoothie recipes

### Step 3: Restart Backend

```bash
cd backend
npm run dev
```

## API Endpoints Now Available

### Recipes
- `GET /api/recipes` - List all recipes (with filters)
- `POST /api/recipes` - Create custom recipe
- `GET /api/recipes/search?q=chicken` - Search recipes
- `GET /api/recipes/:id` - Get recipe details
- `PUT /api/recipes/:id` - Update recipe
- `DELETE /api/recipes/:id` - Delete recipe

### Meal Plans
- `POST /api/meal-plans/generate` - Generate new meal plan
- `GET /api/meal-plans` - List all user's meal plans
- `GET /api/meal-plans/active` - Get active meal plan
- `GET /api/meal-plans/:id` - Get meal plan details
- `PUT /api/meal-plans/:id` - Update meal plan name/description
- `DELETE /api/meal-plans/:id` - Delete meal plan
- `POST /api/meal-plans/:id/activate` - Set as active plan
- `POST /api/meal-plans/:id/apply` - Apply plan to food log
- `POST /api/meal-plans/:id/meals/:mealId/swap` - Swap a meal with different recipe
- `GET /api/meal-plans/:id/shopping-list` - Generate shopping list

## Testing the API

### Generate a Meal Plan (Example Request)

```bash
POST /api/meal-plans/generate
Authorization: Bearer <token>

{
  "startDate": "2024-01-15",
  "endDate": "2024-01-21",
  "mealsPerDay": 3,
  "dietaryPreferences": ["vegetarian"],
  "excludedFoods": ["nuts"],
  "useUserGoals": true
}
```

### Apply Meal Plan to Today

```bash
POST /api/meal-plans/:id/apply
Authorization: Bearer <token>

{
  "date": "2024-01-15",
  "dayOfWeek": 1
}
```

## Frontend Implementation (Next Steps)

Now implementing:
1. Meal plan generator wizard UI
2. Meal plan viewing page
3. Recipe browsing interface
4. Integration with nutrition module

## Features Included

✅ Smart meal selection based on nutritional targets
✅ Dietary preference filtering (vegetarian, vegan, gluten-free, etc.)
✅ Ingredient exclusion
✅ Customizable servings
✅ Meal swapping capability
✅ Shopping list generation
✅ Apply meals directly to food log
✅ Active meal plan tracking
