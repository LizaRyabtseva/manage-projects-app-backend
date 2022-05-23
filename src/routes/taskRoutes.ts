import express from 'express';
import * as controllers from "../controllers/taskControllers";

const router = express.Router();

router.post('/', controllers.createTask);

router.get('/:taskId', controllers.getTask);

router.get('/backlog/:sprintId', controllers.getTasksBySprintId);

router.get('/sprint/:sprintId', controllers.getTasksBySprintId);

router.patch('/:taskId', controllers.updateTask);

export default router;