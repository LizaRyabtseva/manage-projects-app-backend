import {RequestHandler} from "express";
import {PrismaClient} from '@prisma/client';
import HttpError from '../errors/HttpError';
import NotFoundError from '../errors/NotFoundError';

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
    const backlogId = +req.params.backlogId;
    
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