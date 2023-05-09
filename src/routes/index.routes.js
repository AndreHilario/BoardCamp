import { Router } from "express";
import gameRouter from "./game.routes.js";
import customersRouter from "./customers.routes.js";
import rentalsRouter from "./rentals.routes.js";


const router = Router();

router.use(gameRouter);
router.use(customersRouter);
router .use(rentalsRouter);

export default router;