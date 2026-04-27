# Meal Plan Generation Feature - Implementation Plan

## Overview
Add intelligent meal plan generation capability to the Health Tracker application, allowing users to automatically create personalized meal plans based on their nutrition goals, dietary preferences, and restrictions.

## Feature Goals

### User Stories
1. As a user, I want to generate a weekly meal plan that meets my calorie and macro goals
2. As a user, I want to specify dietary preferences (vegetarian, vegan, keto, etc.)
3. As a user, I want to exclude foods I don't like or am allergic to
4. As a user, I want to save and reuse meal plans
5. As a user, I want to apply a meal plan to my food log with one click
6. As a user, I want to customize generated meal plans (swap meals, adjust portions)

## Implementation Approach

### Option 1: Rule-Based Meal Planning (Recommended MVP)
Generate meals from a curated database of recipes using constraint satisfaction.

**Pros:**
- ✅ No API costs
- ✅ Full control over data
- ✅ Offline capability
- ✅ Fast generation

**Cons:**
- ❌ Limited recipe variety initially
- ❌ Manual recipe curation required
- ❌ Less sophisticated than AI

### Option 2: AI-Powered Generation
Use OpenAI API to generate meal plans and recipes.

**Pros:**
- ✅ Unlimited recipe variety
- ✅ Highly personalized
- ✅ Natural language interaction

**Cons:**
- ❌ API costs (~$0.01-0.05 per plan)
- ❌ Requires internet
- ❌ May generate unrealistic meals

### Option 3: Hybrid Approach (Best Long-term)
Combine database recipes with AI enhancement.

## Database Schema

### New Models

```prisma
// backend/prisma/schema.prisma

model Recipe {
  id            String   @id @default(uuid())
  name          String
  description   String?
  category      RecipeCategory
  prepTime      Int      // minutes
  cookTime      Int      // minutes
  servings      Int      @default(1)
  difficulty    Difficulty @default(MEDIUM)

  // Nutrition per serving
  calories      Int
  protein       Float
  carbs         Float
  fats          Float
  fiber         Float?
  sugar         Float?

  // Recipe details
  ingredients   RecipeIngredient[]
  instructions  String[]
  tags          RecipeTag[]

  // Dietary flags
  isVegetarian  Boolean  @default(false)
  isVegan       Boolean  @default(false)
  isGlutenFree  Boolean  @default(false)
  isDairyFree   Boolean  @default(false)
  isKeto        Boolean  @default(false)
  isPaleo       Boolean  @default(false)

  // User customization
  userId        String?  // null = system recipe
  user          User?    @relation(fields: [userId], references: [id])
  isPublic      Boolean  @default(false)

  // Usage
  mealPlans     MealPlanRecipe[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([category, userId])
  @@index([isVegetarian, isVegan, isGlutenFree])
}

model RecipeIngredient {
  id         String  @id @default(uuid())
  recipeId   String
  recipe     Recipe  @relation(fields: [recipeId], references: [id], onDelete: Cascade)

  name       String
  amount     Float
  unit       String
  notes      String?

  @@index([recipeId])
}

model RecipeTag {
  id       String @id @default(uuid())
  name     String @unique
  recipes  Recipe[]
}

model MealPlan {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])

  name        String
  description String?
  startDate   DateTime
  endDate     DateTime

  // Target nutrition
  targetCalories Int
  targetProtein  Float
  targetCarbs    Float
  targetFats     Float

  // Dietary preferences
  dietaryTags    String[]  // ["vegetarian", "gluten-free"]
  excludedFoods  String[]  // ["nuts", "seafood"]

  // Meals
  meals          MealPlanRecipe[]

  isActive       Boolean  @default(false)
  isTemplate     Boolean  @default(false)

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@index([userId, isActive])
  @@index([userId, startDate, endDate])
}

model MealPlanRecipe {
  id          String   @id @default(uuid())
  mealPlanId  String
  mealPlan    MealPlan @relation(fields: [mealPlanId], references: [id], onDelete: Cascade)

  recipeId    String
  recipe      Recipe   @relation(fields: [recipeId], references: [id])

  dayOfWeek   Int      // 0-6 (Sunday-Saturday)
  mealType    MealType
  servings    Float    @default(1)

  @@index([mealPlanId])
  @@index([recipeId])
}

enum RecipeCategory {
  BREAKFAST
  LUNCH
  DINNER
  SNACK
  DESSERT
  SMOOTHIE
  SALAD
}

enum Difficulty {
  EASY
  MEDIUM
  HARD
}
```

## Backend Implementation

### 1. Recipe Service

**`backend/src/modules/recipes/recipe.service.ts`**
```typescript
class RecipeService {
  async createRecipe(userId: string, data: CreateRecipeData): Promise<Recipe> {
    return prisma.recipe.create({
      data: {
        ...data,
        userId,
        ingredients: {
          create: data.ingredients,
        },
      },
      include: {
        ingredients: true,
        tags: true,
      },
    });
  }

  async getRecipes(userId: string, filters: RecipeFilters): Promise<Recipe[]> {
    return prisma.recipe.findMany({
      where: {
        OR: [
          { userId }, // User's recipes
          { isPublic: true }, // Public recipes
          { userId: null }, // System recipes
        ],
        category: filters.category,
        isVegetarian: filters.isVegetarian,
        isVegan: filters.isVegan,
        isGlutenFree: filters.isGlutenFree,
        tags: filters.tags ? { some: { name: { in: filters.tags } } } : undefined,
      },
      include: {
        ingredients: true,
        tags: true,
      },
    });
  }

  async searchRecipes(userId: string, query: string): Promise<Recipe[]> {
    return prisma.recipe.findMany({
      where: {
        OR: [
          { userId },
          { isPublic: true },
          { userId: null },
        ],
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { ingredients: { some: { name: { contains: query, mode: 'insensitive' } } } },
        ],
      },
      include: {
        ingredients: true,
        tags: true,
      },
    });
  }
}
```

### 2. Meal Plan Generator Service

**`backend/src/modules/meal-plans/meal-plan-generator.service.ts`**
```typescript
interface GenerateMealPlanParams {
  userId: string;
  startDate: string;
  endDate: string;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFats: number;
  dietaryPreferences: string[];
  excludedFoods: string[];
  mealsPerDay: number;
}

class MealPlanGeneratorService {
  async generateMealPlan(params: GenerateMealPlanParams): Promise<MealPlan> {
    // 1. Get available recipes that match dietary preferences
    const availableRecipes = await this.getMatchingRecipes(
      params.userId,
      params.dietaryPreferences,
      params.excludedFoods
    );

    // 2. Calculate days in plan
    const days = this.calculateDays(params.startDate, params.endDate);

    // 3. Generate meals for each day
    const meals: MealPlanRecipe[] = [];

    for (let day = 0; day < days; day++) {
      const dayMeals = await this.generateDayMeals(
        availableRecipes,
        params.targetCalories,
        params.targetProtein,
        params.targetCarbs,
        params.targetFats,
        params.mealsPerDay
      );

      meals.push(...dayMeals.map(meal => ({
        ...meal,
        dayOfWeek: day % 7,
      })));
    }

    // 4. Create meal plan
    const mealPlan = await prisma.mealPlan.create({
      data: {
        userId: params.userId,
        name: `Meal Plan ${params.startDate} to ${params.endDate}`,
        startDate: new Date(params.startDate),
        endDate: new Date(params.endDate),
        targetCalories: params.targetCalories,
        targetProtein: params.targetProtein,
        targetCarbs: params.targetCarbs,
        targetFats: params.targetFats,
        dietaryTags: params.dietaryPreferences,
        excludedFoods: params.excludedFoods,
        meals: {
          create: meals,
        },
      },
      include: {
        meals: {
          include: {
            recipe: {
              include: {
                ingredients: true,
              },
            },
          },
        },
      },
    });

    return mealPlan;
  }

  private async generateDayMeals(
    recipes: Recipe[],
    targetCalories: number,
    targetProtein: number,
    targetCarbs: number,
    targetFats: number,
    mealsPerDay: number
  ): Promise<Partial<MealPlanRecipe>[]> {
    const meals: Partial<MealPlanRecipe>[] = [];

    // Split calories across meals
    const caloriesPerMeal = Math.floor(targetCalories / mealsPerDay);

    // Breakfast (25% of calories)
    const breakfast = this.selectMeal(
      recipes.filter(r => r.category === 'BREAKFAST'),
      caloriesPerMeal * 0.25,
      targetProtein / mealsPerDay,
      targetCarbs / mealsPerDay,
      targetFats / mealsPerDay
    );
    if (breakfast) {
      meals.push({
        recipeId: breakfast.recipe.id,
        mealType: 'BREAKFAST',
        servings: breakfast.servings,
      });
    }

    // Lunch (35% of calories)
    const lunch = this.selectMeal(
      recipes.filter(r => r.category === 'LUNCH'),
      caloriesPerMeal * 0.35,
      targetProtein / mealsPerDay,
      targetCarbs / mealsPerDay,
      targetFats / mealsPerDay
    );
    if (lunch) {
      meals.push({
        recipeId: lunch.recipe.id,
        mealType: 'LUNCH',
        servings: lunch.servings,
      });
    }

    // Dinner (30% of calories)
    const dinner = this.selectMeal(
      recipes.filter(r => r.category === 'DINNER'),
      caloriesPerMeal * 0.30,
      targetProtein / mealsPerDay,
      targetCarbs / mealsPerDay,
      targetFats / mealsPerDay
    );
    if (dinner) {
      meals.push({
        recipeId: dinner.recipe.id,
        mealType: 'DINNER',
        servings: dinner.servings,
      });
    }

    // Snacks (10% of calories)
    if (mealsPerDay >= 4) {
      const snack = this.selectMeal(
        recipes.filter(r => r.category === 'SNACK'),
        caloriesPerMeal * 0.10,
        targetProtein / mealsPerDay,
        targetCarbs / mealsPerDay,
        targetFats / mealsPerDay
      );
      if (snack) {
        meals.push({
          recipeId: snack.recipe.id,
          mealType: 'SNACK',
          servings: snack.servings,
        });
      }
    }

    return meals;
  }

  private selectMeal(
    recipes: Recipe[],
    targetCalories: number,
    targetProtein: number,
    targetCarbs: number,
    targetFats: number
  ): { recipe: Recipe; servings: number } | null {
    if (recipes.length === 0) return null;

    // Score each recipe based on how well it matches targets
    const scoredRecipes = recipes.map(recipe => {
      const calorieScore = 1 - Math.abs(recipe.calories - targetCalories) / targetCalories;
      const proteinScore = 1 - Math.abs(recipe.protein - targetProtein) / targetProtein;
      const carbsScore = 1 - Math.abs(recipe.carbs - targetCarbs) / targetCarbs;
      const fatsScore = 1 - Math.abs(recipe.fats - targetFats) / targetFats;

      const totalScore = (calorieScore + proteinScore + carbsScore + fatsScore) / 4;

      return { recipe, score: totalScore };
    });

    // Sort by score and pick from top 5 randomly (for variety)
    scoredRecipes.sort((a, b) => b.score - a.score);
    const topRecipes = scoredRecipes.slice(0, Math.min(5, scoredRecipes.length));
    const selected = topRecipes[Math.floor(Math.random() * topRecipes.length)];

    // Calculate servings needed
    const servings = parseFloat((targetCalories / selected.recipe.calories).toFixed(1));

    return { recipe: selected.recipe, servings };
  }

  private async getMatchingRecipes(
    userId: string,
    dietaryPreferences: string[],
    excludedFoods: string[]
  ): Promise<Recipe[]> {
    const where: any = {
      OR: [
        { userId },
        { isPublic: true },
        { userId: null },
      ],
    };

    // Apply dietary filters
    if (dietaryPreferences.includes('vegetarian')) {
      where.isVegetarian = true;
    }
    if (dietaryPreferences.includes('vegan')) {
      where.isVegan = true;
    }
    if (dietaryPreferences.includes('gluten-free')) {
      where.isGlutenFree = true;
    }
    if (dietaryPreferences.includes('dairy-free')) {
      where.isDairyFree = true;
    }
    if (dietaryPreferences.includes('keto')) {
      where.isKeto = true;
    }

    // Exclude recipes with excluded ingredients
    if (excludedFoods.length > 0) {
      where.ingredients = {
        none: {
          name: {
            in: excludedFoods,
            mode: 'insensitive',
          },
        },
      };
    }

    return prisma.recipe.findMany({
      where,
      include: {
        ingredients: true,
        tags: true,
      },
    });
  }

  private calculateDays(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }
}
```

### 3. Meal Plan Service

**`backend/src/modules/meal-plans/meal-plan.service.ts`**
```typescript
class MealPlanService {
  async getMealPlans(userId: string): Promise<MealPlan[]> {
    return prisma.mealPlan.findMany({
      where: { userId },
      include: {
        meals: {
          include: {
            recipe: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMealPlan(id: string, userId: string): Promise<MealPlan> {
    const plan = await prisma.mealPlan.findFirst({
      where: { id, userId },
      include: {
        meals: {
          include: {
            recipe: {
              include: {
                ingredients: true,
              },
            },
          },
        },
      },
    });

    if (!plan) {
      throw new Error('Meal plan not found');
    }

    return plan;
  }

  async activateMealPlan(id: string, userId: string): Promise<MealPlan> {
    // Deactivate all other plans
    await prisma.mealPlan.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });

    // Activate this plan
    return prisma.mealPlan.update({
      where: { id },
      data: { isActive: true },
    });
  }

  async applyMealPlanToDay(
    mealPlanId: string,
    userId: string,
    date: string,
    dayOfWeek: number
  ): Promise<void> {
    const plan = await this.getMealPlan(mealPlanId, userId);

    // Get meals for the specified day
    const dayMeals = plan.meals.filter(m => m.dayOfWeek === dayOfWeek);

    // Create food entries for each meal
    for (const meal of dayMeals) {
      await prisma.foodEntry.create({
        data: {
          userId,
          date: new Date(date),
          mealType: meal.mealType,
          foodName: meal.recipe.name,
          servingSize: meal.servings,
          servingUnit: 'serving',
          calories: Math.round(meal.recipe.calories * meal.servings),
          protein: meal.recipe.protein * meal.servings,
          carbs: meal.recipe.carbs * meal.servings,
          fats: meal.recipe.fats * meal.servings,
        },
      });
    }
  }

  async updateMealInPlan(
    mealPlanId: string,
    mealId: string,
    userId: string,
    data: UpdateMealData
  ): Promise<MealPlanRecipe> {
    // Verify ownership
    const plan = await this.getMealPlan(mealPlanId, userId);

    return prisma.mealPlanRecipe.update({
      where: { id: mealId },
      data,
      include: {
        recipe: true,
      },
    });
  }

  async deleteMealPlan(id: string, userId: string): Promise<void> {
    await prisma.mealPlan.deleteMany({
      where: { id, userId },
    });
  }
}
```

## Frontend Implementation

### 1. Meal Plan Generator Page

**`frontend/src/pages/MealPlanGenerator.tsx`**
```typescript
export default function MealPlanGenerator() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    startDate: format(new Date(), 'yyyy-MM-dd'),
    duration: 7,
    mealsPerDay: 3,
    dietaryPreferences: [],
    excludedFoods: '',
  });

  const handleGenerate = async () => {
    const endDate = format(
      addDays(new Date(formData.startDate), formData.duration - 1),
      'yyyy-MM-dd'
    );

    const response = await mealPlanService.generateMealPlan({
      startDate: formData.startDate,
      endDate,
      mealsPerDay: formData.mealsPerDay,
      dietaryPreferences: formData.dietaryPreferences,
      excludedFoods: formData.excludedFoods.split(',').map(f => f.trim()),
    });

    // Navigate to meal plan view
    navigate(`/meal-plans/${response.mealPlan.id}`);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Generate Meal Plan</h1>

        {step === 1 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Step 1: Plan Details</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Duration (days)</label>
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="3">3 days</option>
                  <option value="7">7 days (1 week)</option>
                  <option value="14">14 days (2 weeks)</option>
                  <option value="30">30 days (1 month)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Meals per day</label>
                <select
                  value={formData.mealsPerDay}
                  onChange={(e) => setFormData({ ...formData, mealsPerDay: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="2">2 meals</option>
                  <option value="3">3 meals</option>
                  <option value="4">4 meals (includes snack)</option>
                  <option value="5">5 meals (includes 2 snacks)</option>
                </select>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                Next: Dietary Preferences
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Step 2: Dietary Preferences</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto', 'paleo'].map((pref) => (
                  <label key={pref} className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.dietaryPreferences.includes(pref)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            dietaryPreferences: [...formData.dietaryPreferences, pref],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            dietaryPreferences: formData.dietaryPreferences.filter(p => p !== pref),
                          });
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="capitalize">{pref.replace('-', ' ')}</span>
                  </label>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Excluded Foods (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g., nuts, seafood, mushrooms"
                  value={formData.excludedFoods}
                  onChange={(e) => setFormData({ ...formData, excludedFoods: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
                >
                  Back
                </button>
                <button
                  onClick={handleGenerate}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md"
                >
                  Generate Meal Plan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
```

### 2. Meal Plan View

**`frontend/src/pages/MealPlanView.tsx`**
```typescript
export default function MealPlanView() {
  const { id } = useParams();
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);

  useEffect(() => {
    loadMealPlan();
  }, [id]);

  const handleApplyToDay = async (date: string, dayOfWeek: number) => {
    await mealPlanService.applyMealPlanToDay(id!, date, dayOfWeek);
    alert('Meals added to your food log!');
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">{mealPlan?.name}</h1>
          <button
            onClick={() => mealPlanService.activateMealPlan(id!)}
            className="px-4 py-2 bg-green-600 text-white rounded-md"
          >
            Set as Active Plan
          </button>
        </div>

        {/* Week view with days */}
        <div className="grid grid-cols-7 gap-4">
          {[0, 1, 2, 3, 4, 5, 6].map((day) => (
            <div key={day} className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold mb-3">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day]}
              </h3>

              {mealPlan?.meals
                .filter(m => m.dayOfWeek === day)
                .map((meal) => (
                  <div key={meal.id} className="mb-3 p-2 bg-gray-50 rounded">
                    <div className="text-xs text-gray-600">{meal.mealType}</div>
                    <div className="font-medium text-sm">{meal.recipe.name}</div>
                    <div className="text-xs text-gray-500">
                      {Math.round(meal.recipe.calories * meal.servings)} cal
                    </div>
                  </div>
                ))}

              <button
                onClick={() => handleApplyToDay(
                  format(addDays(new Date(mealPlan!.startDate), day), 'yyyy-MM-dd'),
                  day
                )}
                className="w-full mt-2 px-2 py-1 text-xs bg-blue-600 text-white rounded"
              >
                Apply to Today
              </button>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
```

## Recipe Database Seeding

### Sample Recipes Script

**`backend/src/database/seeds/recipes.seed.ts`**
```typescript
const sampleRecipes = [
  {
    name: 'Classic Scrambled Eggs',
    category: 'BREAKFAST',
    prepTime: 5,
    cookTime: 5,
    servings: 1,
    calories: 180,
    protein: 14,
    carbs: 2,
    fats: 12,
    isVegetarian: true,
    ingredients: [
      { name: 'eggs', amount: 2, unit: 'large' },
      { name: 'butter', amount: 1, unit: 'tbsp' },
      { name: 'milk', amount: 2, unit: 'tbsp' },
      { name: 'salt', amount: 0.25, unit: 'tsp' },
    ],
    instructions: [
      'Crack eggs into a bowl and whisk with milk and salt',
      'Heat butter in a non-stick pan over medium heat',
      'Pour in eggs and gently stir until cooked to desired consistency',
    ],
  },
  // Add 50-100 more recipes covering all meal types
];

async function seedRecipes() {
  for (const recipe of sampleRecipes) {
    await prisma.recipe.create({
      data: {
        ...recipe,
        ingredients: {
          create: recipe.ingredients,
        },
      },
    });
  }
}
```

## API Endpoints

```
# Recipes
GET    /api/recipes                    - List all recipes
POST   /api/recipes                    - Create custom recipe
GET    /api/recipes/:id                - Get recipe details
PUT    /api/recipes/:id                - Update recipe
DELETE /api/recipes/:id                - Delete recipe
GET    /api/recipes/search?q=chicken   - Search recipes

# Meal Plans
GET    /api/meal-plans                 - List user's meal plans
POST   /api/meal-plans/generate        - Generate new meal plan
GET    /api/meal-plans/:id             - Get meal plan details
PUT    /api/meal-plans/:id             - Update meal plan
DELETE /api/meal-plans/:id             - Delete meal plan
POST   /api/meal-plans/:id/activate    - Set as active plan
POST   /api/meal-plans/:id/apply       - Apply plan to food log

# Meal Plan Meals
PUT    /api/meal-plans/:id/meals/:mealId  - Update specific meal
POST   /api/meal-plans/:id/meals/:mealId/swap - Swap with another recipe
```

## Implementation Tasks

### Phase 1: Foundation (Week 1)
1. Add database schema for recipes and meal plans
2. Create recipe service (CRUD operations)
3. Seed initial recipe database (50-100 recipes)
4. Build recipe API endpoints
5. Create recipe browsing UI

### Phase 2: Generation (Week 2)
1. Implement meal plan generator algorithm
2. Build meal plan service
3. Create meal plan API endpoints
4. Build meal plan generator UI (wizard)
5. Test generation with various preferences

### Phase 3: Management (Week 3)
1. Build meal plan viewing/editing UI
2. Implement "apply to food log" functionality
3. Add meal swapping feature
4. Create shopping list generator
5. Add meal plan templates

### Phase 4: Enhancement (Week 4)
1. Add custom recipe creation UI
2. Implement recipe sharing (public recipes)
3. Add nutritional analysis charts
4. Build recipe rating system
5. Add print/export functionality

## Success Criteria

✅ Users can generate meal plans based on goals
✅ Dietary preferences correctly filter recipes
✅ Generated plans meet nutritional targets (±10%)
✅ Users can apply meal plans to food log
✅ Users can customize/swap meals
✅ Recipe database contains 100+ quality recipes
✅ Meal plan generation completes in <5 seconds
✅ Mobile-friendly interface

## Future Enhancements

- AI-powered recipe suggestions
- Integration with grocery delivery services
- Meal prep scheduling
- Leftover optimization
- Budget-conscious meal planning
- Family meal scaling
- Meal plan social sharing
- Integration with smart kitchen devices
