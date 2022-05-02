import express from 'express';
import * as controllers from "../controllers/taskControllers";

const router = express.Router();

router.post('/:backlogId/tasks', controllers.createTask);

export default router;