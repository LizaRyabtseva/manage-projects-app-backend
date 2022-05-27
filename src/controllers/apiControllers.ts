import {RequestHandler} from "express";
import {PrismaClient} from "@prisma/client";
import HttpError from "../errors/HttpError";
import {
    findCommentsByTaskId,
    findProject,
    findTaskById,
    findTasksByProjectId,
    findUser,
    findUserToProjectMapping
} from "../functions";
import NotFoundError from "../errors/NotFoundError";

const prisma = new PrismaClient();

export const searchHandler: RequestHandler = async (req, res, next) => {
    const category = req.url.split('/')[1];
    const query = (req.query as {query: string}).query;
    
    if (category === 'usersInProject') {
        const projectId = +req.query.projectId!;
        console.log(query)
        try {
            const usersToProject = await findUserToProjectMapping(projectId);
            const users = usersToProject?.filter(member => member.project_id === projectId)
                .filter(member => member.user.email.startsWith(query));
    
            console.log(usersToProject);
    
            res.status(200).json({users: users?.map(member => member.user)});
        } catch (err) {
            next(new HttpError(`Can not find records for ${category}!`));
        }
    }
    try {
        if (category === 'users') {
            const users = await prisma.user.findMany({
                where: {
                    email: {
                        startsWith: query
                    }
                }
            });
    
            res.status(200).json({users});

        } else if (category === 'projects') {
            const projects = await prisma.project.findMany({
                where: {
                    title: {
                        startsWith: query
                    }
                }
            });
            res.status(200).json({projects});
        }
        
    } catch (err) {
        next(new HttpError(`Can not find records for ${category}!`));
    }
};

export const getCurrentProject: RequestHandler = async (req, res, next) => {
    const userId = +req.params.userId;

    try {
        const user = await findUser(userId, 'id');
        if (user) {
            if (!user.current_project_id) {
                res.status(200).json({currentProject: {}});
            } else {
                const currentProject = await findProject(user.current_project_id!);
                res.status(200).json({message: 'Current project was found!', currentProject});
            }
            // const currentProject = {
            //     id: user?.current_project_id,
            //     code: user?.current_project_i
            // }
        } else {
            next(new NotFoundError(userId));
        }
    } catch (err) {
        next(new HttpError(`Can not found ${userId}`));
    }
};

export const countTasks: RequestHandler = async (req, res, next) => {
    const projectId = +req.params.projectId;
    
    try {
        const projectRecord = await findProject(projectId);
        if (projectRecord) {
            const tasks = await findTasksByProjectId(projectId);
            if (tasks) {
                res.status(200).json({count: tasks.length});
            } else {
                res.status(200).json({count: 0});
            }
        } else {
            next(new NotFoundError(projectId));
        }
    } catch (err) {
        next(new HttpError(`Could not find project with id = ${projectId}!`))
    }
};

export const isUniqueValue: RequestHandler = async (req, res, next) => {
    const type = (req.query as {type: string}).type;
    const value = (req.query as {value: string}).value;

    try {
        const userRecord = await findUser(value, type);

        if (userRecord) {
            res.status(200).json({message: `This ${type} already in use!`, valid: false})
        } else {
            res.status(200).json({message: `This ${type} is free!`, valid: true});
        }
    } catch (err) {
        next(new HttpError(`Could not find records with value = ${value}!`))
    }
};

export const createComment: RequestHandler = async (req, res, next) => {
    let date = (req.body as {date: string}).date;
    const text = (req.body as {text: string}).text;
    const taskId = +req.params.taskId;
    const userId = (req.body as {userId: number}).userId;

    let taskRecord, userRecord;
    try {
        taskRecord = await findTaskById(taskId);
    } catch (err) {
        next(new HttpError(`Could not find records with id = ${taskId}`))
    }
    
    try {
        userRecord = await findUser(userId, 'id');
    } catch (err) {
        next(new HttpError(`Could not find records with id = ${userId}`))
    }
    if (taskRecord && userRecord) {
        try {
            const newComment = await prisma.comment.create({
                data: {
                    text: text,
                    date: date,
                    user_id: userId,
                    task_id: taskId
                }
            });
            res.status(201).json({
                message: 'New comment was created!',
                comment: newComment
            });
        } catch (err) {
            next(new HttpError(`Could not create new comment for task with id=${taskId}`));
        }
    }
};

export const getComments: RequestHandler = async (req, res, next) => {
    const taskId = +req.params.taskId;
    
    let taskRecord;
    try {
        taskRecord = await findTaskById(taskId);
    } catch (err) {
        next(new HttpError(`Could not find records with id = ${taskId}`))
    }
    
    if (taskRecord) {
        const comments = await findCommentsByTaskId(taskId);
        if (comments) {
            res.status(200).json({message: 'Comments was found', comments});
        }
    } else {
        next(new NotFoundError(taskId));
    }
};