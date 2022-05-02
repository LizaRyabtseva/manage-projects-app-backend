import express from 'express';
import * as controllers from "../controllers/projectControllers";

const router = express.Router();


router.get('/', controllers.projects);

router.post('/', controllers.createProject);

router.get('/:id', controllers.findOneProject);

router.patch('/:id', controllers.updateProject);

router.delete('/:id', controllers.deleteProject);

export default router;