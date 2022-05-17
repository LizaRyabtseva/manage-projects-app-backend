import express from "express";
import * as sprintControllers from '../controllers/sprintControllers';

const router = express.Router();

router.post('/', sprintControllers.createSprint);

router.get('/:sprintId/tasks', sprintControllers.getTasksBySprintId);

export default router;