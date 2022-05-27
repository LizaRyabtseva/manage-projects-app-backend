import {RequestHandler} from "express";
import {PrismaClient, sprint} from '@prisma/client';
import {findProject, findSprintById, findSprintByProjectId, findTasksBySprintId, joinDate, getMonth} from "../functions";
import NotFoundError from "../errors/NotFoundError";
import HttpError from "../errors/HttpError";

const prisma = new PrismaClient();

export const createSprint: RequestHandler = async (req, res, next) => {
    console.log('in create sprint')
    let dateStart: string[] | Date = (req.body as {dateStart: string}).dateStart.toString().split('-');
    let dateEnd: string[] | Date = (req.body as {dateEnd: string}).dateEnd.toString().split('-');
    dateStart = new Date(+dateStart[0], +dateStart[1] - 1, +dateStart[2]);
    dateEnd = new Date(+dateEnd[0], +dateEnd[1] - 1, +dateEnd[2]);
    const projectId = (req.body as {projectId: number}).projectId;
    let project;
    try {
        project = await findProject(projectId);
    } catch (err) {
        next(new HttpError(`Could not find project with id=${projectId}`));
    }
    
    if (project) {
        const sprints = await findSprintByProjectId(projectId);
        const title = `Sprint-${sprints?.length || 1} of ${project.title} project`;
        const description = `Here you can store current tasks`;
    
        try {
            const newSprint = await prisma.sprint.create({
                data: {
                    title: title,
                    description: description,
                    date_start: dateStart,
                    date_end: dateEnd,
                    project_id: projectId
                }
            });
            res.status(201).json({
                message: 'New sprint was created!',
                sprint: newSprint
            });
        } catch (err) {
            console.log(err);
            next(new HttpError(`Could not create sprint`));
        }
    } else {
        next(new NotFoundError(projectId));
    }
};

export const getTasksBySprintId: RequestHandler = async (req, res, next) => {
    const sprintId = +req.params.sprintId;
    try {
        const tasks = await findTasksBySprintId(sprintId);
        if (tasks) {
            
            res.status(200).json({message: 'Tasks was found!', tasks});
        } else {
            next(new NotFoundError(sprintId));
        }
    } catch (err) {
        next(new HttpError(`Could not find sprint with id=${sprintId}`));
    }
};

export const getSprint: RequestHandler = async (req, res, next) => {
    const sprintId = +req.params.sprintId;
    
    try {
        const sprintRecord = await findSprintById(sprintId);
        
        if (sprintRecord) {
            const sprint = JSON.parse(JSON.stringify(sprintRecord));
            const ds = new Date(sprint.date_start);
            const de = new Date(sprint.date_end);
            sprint.dateStart = joinDate(ds.getDate(), getMonth(ds.getMonth()), ds.getFullYear());
            sprint.dateEnd = joinDate(de.getDate(), getMonth(de.getMonth()), de.getFullYear());
            sprint.projectId = sprint.project_id;
            
            delete sprint.date_start;
            delete sprint.date_end;
            delete sprint.project_id;
            
            res.status(200).json({message: 'Sprint was found', sprint});
        } else {
            next(new NotFoundError(sprintId));
        }
    } catch (err) {
        console.log(err);
        next(new HttpError(`Could not find sprint with id=${sprintId}`));
    }
};