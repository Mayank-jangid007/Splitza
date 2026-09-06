import { Router } from "express";
import {
  listPlans,
  getPlan,
  createPlan,
  updatePlan,
  closePlan,
  getMyPlans,
} from "../controllers/plans";
import { getPlanVotes } from "../controllers/votes";
import { authenticate, requireRole } from "../middleware/auth";

const router = Router();

// Public
router.get("/", listPlans);
router.get("/my", authenticate, getMyPlans);
router.get("/:id", getPlan);

// Host only
router.post("/", authenticate, requireRole("HOST"), createPlan);
router.patch("/:id", authenticate, requireRole("HOST"), updatePlan);
router.delete("/:id", authenticate, requireRole("HOST"), closePlan);

// Votes for a plan (host & admin)
router.get("/:planId/votes", authenticate, getPlanVotes);

export default router;
