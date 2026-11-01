import { Router } from "express";
import {
  handleCreatePool,
  handleJoinPool,
  handleGetMyPools,
  handleGetPoolCredentials,
  handleUpdatePoolVisibility,
  handleDeletePool,
} from "../controllers/pools.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

// Host creates a pool
router.post("/", authenticate, handleCreatePool);

// Get my pools (must be before /:poolId routes)
router.get("/my", authenticate, handleGetMyPools);

// Member joins a pool (mock UPI collect → ACTIVE)
router.post("/:poolId/join", authenticate, handleJoinPool);

// Decrypt & return credentials (host or ACTIVE member only)
router.get("/:poolId/credentials", authenticate, handleGetPoolCredentials);

// Host-only pool controls
router.patch("/:poolId", authenticate, handleUpdatePoolVisibility);
router.delete("/:poolId", authenticate, handleDeletePool);

export default router;
