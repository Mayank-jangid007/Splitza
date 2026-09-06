import { Router } from "express";
import {
  getStats,
  listUsers,
  listDisputes,
  resolveDispute,
  updateTrustScore,
} from "../controllers/admin";
import { authenticate, requireRole } from "../middleware/auth";

const router = Router();

// All admin routes require ADMIN role
router.use(authenticate, requireRole("ADMIN"));

router.get("/stats", getStats);
router.get("/users", listUsers);
router.get("/disputes", listDisputes);
router.patch("/disputes/:slotId/resolve", resolveDispute);
router.patch("/users/:userId/trust", updateTrustScore);

export default router;
