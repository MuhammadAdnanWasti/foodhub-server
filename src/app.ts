import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { AuthRoutes } from './modules/Auth/auth.route';
import { MealRoutes } from './modules/Meal/meal.route';
import { CategoriesRoutes } from './modules/Categories/categories.route';
import router from './routes';
import { notFound } from './middlewares/notFound';

const app: Application = express();

// parsers
app.use(express.json());


app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// application routes
app.use('/', router);




app.get('/', (req: Request, res: Response) => {
  res.send('Hello from Apollo Gears World!');
});

app.use(notFound);
export default app;
    