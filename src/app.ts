import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { AuthRoutes } from './modules/Auth/auth.route';
import { MealRoutes } from './modules/Meal/meal.route';
import { CategoriesRoutes } from './modules/Categories/categories.route';
import router from './routes';

const app: Application = express();

// parsers
app.use(express.json());
app.use(cors());

// application routes
app.use('/', router);




app.get('/', (req: Request, res: Response) => {
  res.send('Hello from Apollo Gears World!');
});

export default app;
