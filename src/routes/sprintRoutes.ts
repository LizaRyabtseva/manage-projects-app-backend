import express from "express";
import * as sprintControllers from '../controllers/sprintControllers';

const router = express.Router();

router.post('/sprints/create', sprintControllers.createSprint);

export default router;