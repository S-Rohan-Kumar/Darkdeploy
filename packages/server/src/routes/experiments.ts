import { Router } from "express";
import { authenticateUser, authenticateApiKey, AuthenticatedRequest } from "../middleware/auth.js";
import {
    getExperiments,
    createExperiment,
    updateExperiment,
    deleteExperiment,
    trackEvent,
    getExperimentResults,
} from "../controllers/experimentController.js";

export const experimentRouter = Router();

experimentRouter.post("/events", (req: AuthenticatedRequest, res, next) => {
    if (req.headers["x-api-key"]) {
        return authenticateApiKey(req, res, next);
    }
    return authenticateUser(req, res, next);
}, trackEvent);

experimentRouter.get("/:id/results", authenticateUser, getExperimentResults);

experimentRouter.use(authenticateUser);
experimentRouter.get("/", getExperiments);
experimentRouter.post("/", createExperiment);
experimentRouter.patch("/:id", updateExperiment);
experimentRouter.delete("/:id", deleteExperiment);