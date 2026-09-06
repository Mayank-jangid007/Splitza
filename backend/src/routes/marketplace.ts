import { Router } from "express";
import {
  handleGetMarketplacePools,
  handleGetPrivatePool,
} from "../controllers/marketplace.controller";

const router = Router();

// Public: Browse public active matching pools
router.get("/", handleGetMarketplacePools);

// Public: Fetch specific private pool by invite token
router.get("/private/:token", handleGetPrivatePool);

export default router;
