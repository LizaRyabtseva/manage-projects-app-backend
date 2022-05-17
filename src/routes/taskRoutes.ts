import express from 'express';
import * as controllers from "../controllers/taskControllers";

const router = express.Router();

router.post('/', controllers.createTask);

router.get('/:taskId', controllers.getTask);

router.patch('/:taskId', controllers.updateTask);

export default router;