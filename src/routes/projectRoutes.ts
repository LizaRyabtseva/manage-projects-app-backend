import express from 'express';
import * as controllers from "../controllers/projectControllers";

const router = express.Router();


router.get('/', controllers.projects);

router.get('/project/:id', controllers.findOneProject);

router.post('/create-project', controllers.createProject);

router.patch('/update-project/:id', controllers.updateProject);

router.delete('/delete-project/:id', controllers.deleteProject);

export default router;