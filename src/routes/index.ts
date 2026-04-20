import { Router } from "express";
import { CategoriesRoutes } from "../modules/Categories/categories.route";
import { MealRoutes } from "../modules/Meal/meal.route";
import { AuthRoutes } from "../modules/Auth/auth.route";
import path from "node:path";
import { ProviderRoutes } from "../modules/Provider/provider.route";
import { OrderRoutes } from "../modules/Order/order.route";
import { AdminRoutes } from "../modules/Admin/admin.route";
import { ReviewRoutes } from "../modules/Review/review.route";


const router=Router();

// router.use('/api/auth',AuthRoutes)
// router.use('/api/provider/meals',MealRoutes)
// router.use('/admin/categories',CategoriesRoutes)

const routerManager=[
    {
        path:'/api/auth',
        route: AuthRoutes
     },
    //  {
    //     path:'/api/provider/meals',
    //     route: MealRoutes
    //  },
     {
        path:'/admin/categories',
        route: CategoriesRoutes
    },
    {
        path:'/api/meals',
        route: MealRoutes
    },
    {
        path:'/api/providers',
        route: ProviderRoutes
    },
    {
        path:'/api/provider',
        route: ProviderRoutes
    },
    {
        path:'/api/orders',
        route: OrderRoutes
    },
    {
        path:'/api/admin',
        route: AdminRoutes
    },
    {
        path:'/api/reviews',
        route: ReviewRoutes
    }
]

routerManager.forEach((route)=>{router.use(route.path, route.route)})
export default router;