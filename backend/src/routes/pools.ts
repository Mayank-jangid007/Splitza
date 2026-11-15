import { Router } from "express";
import {
  handleCreatePool,
  handleJoinPool,
  handleGetMyPools,
  handleGetPoolCredentials,
  handleUpdatePoolVisibility,
  handleDeletePool,
} from "../controllers/pools.controller";
import { authenticate, requireConsent } from "../middleware/auth";

const router = Router();

// Every pool action requires a logged-in user who accepted the current terms.
router.use(authenticate, requireConsent);

// Host creates a pool
router.post("/", handleCreatePool);

// Get my pools (must be before /:poolId routes)
router.get("/my", handleGetMyPools);

// Member joins a pool (mock UPI collect → ACTIVE)
router.post("/:poolId/join", handleJoinPool);

// Decrypt & return credentials (host or ACTIVE member only)
router.get("/:poolId/credentials", handleGetPoolCredentials);

// Host-only pool controls
router.patch("/:poolId", handleUpdatePoolVisibility);
router.delete("/:poolId", handleDeletePool);

export default router;
