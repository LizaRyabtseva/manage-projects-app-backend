import express from "express";
import * as apiControllers from '../controllers/apiControllers';
import {countTasks} from "../controllers/apiControllers";
// import {body, CustomValidator} from 'express-validator';

const router = express.Router();

router.get('/users/:userId/current-project', apiControllers.getCurrentProject);

router.get('/users/find', apiControllers.searchHandler);

router.get('/usersInProject/find', apiControllers.searchHandler);

router.get('/users/is-unique', apiControllers.isUniqueValue);

router.get('/users/is-unique-name', apiControllers.isUniqueValue);

router.get('/projects/find', apiControllers.searchHandler);

router.get('/projects/:projectId/count-tasks', apiControllers.countTasks);



export default router;
