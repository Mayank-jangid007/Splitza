import { Router } from "express";
import { joinSlot, getMySlots, getSlot, leaveSlot } from "../controllers/slots";
import { castVote, getVotes } from "../controllers/votes";
import { authenticate, requireRole } from "../middleware/auth";

const router = Router();

router.get("/my", authenticate, getMySlots);
router.get("/:slotId", authenticate, getSlot);
router.post("/:slotId/join", authenticate, requireRole("COHOST"), joinSlot);
router.delete("/:slotId/leave", authenticate, requireRole("COHOST"), leaveSlot);
router.post("/:slotId/votes", authenticate, requireRole("COHOST"), castVote);
router.get("/:slotId/votes", authenticate, getVotes);

export default router;
