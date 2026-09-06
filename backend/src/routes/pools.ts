import { Router } from "express";
import { handleCreatePool } from "../controllers/pools.controller";
import { handleJoinPool } from "../controllers/pools.controller";
import { handleGetMyPools } from "../controllers/pools.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

// Host creates a pool
router.post("/", authenticate, handleCreatePool);

// Member joins a pool
router.post("/:poolId/join", authenticate, handleJoinPool);

// Get my pools
router.get("/my", authenticate, handleGetMyPools);

export default router;
