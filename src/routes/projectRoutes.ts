import express from 'express';
import * as controllers from "../controllers/projectControllers";

const router = express.Router();


router.get('/', controllers.projects);

router.get('/project/:id', controllers.findOneProject);

router.post('/create', controllers.createProject);

router.patch('/update/:id', controllers.updateProject);

router.delete('/delete/:id', controllers.deleteProject);

export default router;