import { Router } from "express";
import { authenticateUser } from "../middleware/auth.js";
import {
    getFlags,
    createFlag,
    updateFlag,
    deleteFlag,
} from "../controllers/flagController.js";

export const flagRouter = Router();

flagRouter.use(authenticateUser);
flagRouter.get("/", getFlags);
flagRouter.post("/", createFlag);
flagRouter.put("/:id", updateFlag);
flagRouter.delete("/:id", deleteFlag);
