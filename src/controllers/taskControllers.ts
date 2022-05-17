import {RequestHandler} from "express";
import {PrismaClient} from '@prisma/client';
import HttpError from '../errors/HttpError';
import NotFoundError from '../errors/NotFoundError';
import {findTaskById} from "../functions";

const prisma = new PrismaClient();

export const createTask: RequestHandler = async (req, res, next) => {
    const title = (req.body as {title: string}).title;
    const code = (req.body as {code: string}).code;
    const description = (req.body as {description: string}).description;
    const estimation = (req.body as {estimation: number}).estimation;
    const priority = (req.body as {priority: string}).priority;
    const type = (req.body as {type: string}).type;
    const assignerId = (req.body as {assignerId: number}).assignerId;
    const creatorId = (req.body as {userId: number}).userId;
    const token = (req.body as {token: string}).token;
    const backlogId = (req.body as {backlogId: number}).backlogId;
    
    try {
        const backlog = await prisma.sprint.findUnique({
            where: {
                id: backlogId
            }
        });
        
        if (backlog) {
            await prisma.task.create({
                data: {
                    title: title,
                    code: code,
                    description: description,
                    estimation: estimation,
                    priority: priority,
                    type: type,
                    // status: 'To do',
                    backlog_id: backlogId,
                    creator_id: creatorId,
                    assigner_id: assignerId
                }
            });
        } else {
            next(new NotFoundError('Backlog was not find!'));
        }
    } catch (err) {
        next(new HttpError('Could not create task!'));
    }
};

export const getTask: RequestHandler = async (req, res, next) => {
    console.log('task');
    
    const taskId = +req.params.taskId;

    try {
        const task = await findTaskById(taskId);
        const fetchedTask = JSON.parse(JSON.stringify(task));
        fetchedTask.assigner = [{
            id: fetchedTask.user_task_assigner_idTouser.id,
            email: fetchedTask.user_task_assigner_idTouser.email
        }];
        delete fetchedTask.user_task_assigner_idTouser;

        if (task) {
            res.status(200).json({
                message: 'Task was found',
                task: fetchedTask
            });
        } else {
            next(new NotFoundError(taskId))
        }
    } catch (err) {
        next(new HttpError(`Could not find task with id=${taskId}`));
    }
};

export const updateTask: RequestHandler = async (req, res, next) => {
    const taskId = +req.params.taskId;
    const title = (req.body as {title: string}).title;
    const description = (req.body as {description: string}).description;
    const estimation = (req.body as {estimation: number}).estimation;
    const priority = (req.body as {priority: string}).priority;
    const type = (req.body as {type: string}).type;
    const status = (req.body as {status: string}).status;
    const assignerId = (req.body as {assignerId: number}).assignerId;
    // const creatorId = (req.body as {userId: number}).userId;
    const token = (req.body as {token: string}).token;
    // const backlogId = (req.body as {backlogId: number}).backlogId;
    
    let taskRecord;
    try {
        taskRecord = await findTaskById(taskId);
    } catch (err) {
        next(new HttpError(`Could not find task with id=${taskId}`));
    }
    
    if (taskRecord) {
        const updatedTask = await prisma.task.update({
            where: {
                id: taskId
            }, data: {
                title: title,
                description: description,
                estimation: estimation,
                priority: priority,
                type: type,
                status: status,
                assigner_id: assignerId
            }
        });
    } else {
        next(new NotFoundError(taskId))
    }
};