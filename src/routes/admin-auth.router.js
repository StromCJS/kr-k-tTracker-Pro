import { Router } from "express";
import { loginAdmin, logoutAdmin } from "../controllers/auth-admin.controller.js";
import {
    createTournament,
    updateTournament,
    getTournaments,
    createMatch,
    updateMatch,
    getMatches,
    generateFixturesForTournament
} from "../controllers/tournament-match.controller.js";
import { adminMiddleware } from "../middleware/admin.middleware.js";

const router = Router();

router.post("/login", loginAdmin);
router.post("/logout", logoutAdmin);
router.get("/profile", adminMiddleware, (req, res) => res.status(200).json({ message: "this is admin protected route" }));

router.post("/tournaments", adminMiddleware, createTournament);
router.put("/tournaments/:id", adminMiddleware, updateTournament);
router.get("/tournaments", adminMiddleware, getTournaments);

router.post("/matches", adminMiddleware, createMatch);
router.put("/matches/:matchId", adminMiddleware, updateMatch); 
router.get("/matches", adminMiddleware, getMatches);

router.post("/tournaments/:id/generate-fixtures", adminMiddleware, generateFixturesForTournament);

export default router;