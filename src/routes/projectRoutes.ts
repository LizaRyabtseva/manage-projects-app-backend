import express from 'express';
import * as controllers from "../controllers/projectControllers";

const router = express.Router();


router.get('/', controllers.projects);

router.post('/', controllers.createProject);

router.patch('/make-current-project', controllers.makeCurrentProject);

router.get('/:id', controllers.findOneProject);

router.patch('/:id', controllers.updateProject);

router.patch('/finish/:id', controllers.finishProject);

router.get('/users/:userId', controllers.getProjectsByUserId);

export default router;