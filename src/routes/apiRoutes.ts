import express from "express";
import * as apiControllers from '../controllers/apiControllers';
// import {body, CustomValidator} from 'express-validator';

const router = express.Router();

router.get('/users/:userId/current-project', apiControllers.getCurrentProject);

router.get('/users/find', apiControllers.searchHandler);

router.get('/usersInProject/find', apiControllers.searchHandler);

router.get('/projects/find', apiControllers.searchHandler);


export default router;
