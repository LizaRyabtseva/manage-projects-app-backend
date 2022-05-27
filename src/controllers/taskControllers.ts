import {RequestHandler} from "express";
import {PrismaClient} from '@prisma/client';
import HttpError from '../errors/HttpError';
import NotFoundError from '../errors/NotFoundError';
import {findSprintById, findTaskById, findTasksBySprintId} from "../functions";

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
    const sprintId = (req.body as {sprintId: number}).sprintId;
    
    try {
        const backlog = await prisma.sprint.findUnique({
            where: {
                id: sprintId
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
                    sprint_id: sprintId,
                    // status: 'To do',
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
    const taskId = +req.params.taskId;
    let task;
    try {
        task = await findTaskById(taskId);
    } catch (err) {
        next(new HttpError(`Could not find task with id=${taskId}`));
    }
    let fetchedTask;
    try {
        if (task) {
            fetchedTask = JSON.parse(JSON.stringify(task));
            fetchedTask = {
                ...fetchedTask, assigner: [{
                    id: fetchedTask.user_task_assigner_idTouser.id,
                    email: fetchedTask.user_task_assigner_idTouser.email,
                    name: fetchedTask.user_task_assigner_idTouser.name
                }], creator: [{
                    id: fetchedTask.user_task_creator_idTouser.id,
                    email: fetchedTask.user_task_creator_idTouser.email,
                    name: fetchedTask.user_task_creator_idTouser.name
                }]
            };
        }

        if (fetchedTask) {
            delete fetchedTask.user_task_assigner_idTouser;
            delete fetchedTask.user_task_creator_idTouser;
            res.status(200).json({
                message: 'Task was found',
                task: fetchedTask
            });
        } else {
            next(new NotFoundError(taskId))
        }
    } catch (err) {
        next(new HttpError(`Could not assign creator and assigner for task with id=${taskId}`));
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
    const sprintId = (req.body as {sprintId: number}).sprintId;
    
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
                assigner_id: assignerId,
                sprint_id: sprintId
            }
        });
        res.status(200).json({message: 'Task was updated', task: taskRecord});
    } else {
        next(new NotFoundError(taskId))
    }
};

export const getTasksBySprintId: RequestHandler = async (req, res, next) => {
    const sprintId = +req.params.sprintId;

    try {
        const sprint = await findSprintById(sprintId);
        if (!sprint) {
            next(new NotFoundError(sprintId));
        }
    } catch (err) {
        next(new HttpError(`Could not find sprint with id=${sprintId}`))
    }
    
    try {
        const tasks = await findTasksBySprintId(sprintId);
        if (tasks) {
            res.status(200).json({message: 'Tasks was found', tasks});
        } else {
            res.status(200).json({message: 'Tasks was not find', tasks: []});
        }
    } catch (err) {
        next(new HttpError(`Could not find tasks with sprintId=${sprintId}`));
    }
};