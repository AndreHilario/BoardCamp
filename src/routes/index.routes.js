import { Router } from "express";
import gameRouter from "./game.routes.js";


const router = Router();

router.use(gameRouter);

export default router;