import {RequestHandler} from 'express';
import {PrismaClient} from '@prisma/client';
import {findUser, findProject, userToProjectMappingHandler} from '../functions';
import HttpError from '../errors/HttpError';
import NotFoundError from '../errors/NotFoundError';

const prisma = new PrismaClient();


export const projects: RequestHandler = async (req, res, next) => {
    try {
        const projectRecords = await prisma.project.findMany();
        if (projectRecords.length > 0) {
            res.status(200).json({projects: projectRecords});
        } else {
            next(new NotFoundError('Projects were not found!'));
        }
    } catch (err) {
        console.error(err);
        next(new HttpError('Could not find projects!'));
    }
}

export const findOneProject: RequestHandler = async (req, res, next) => {
    const projectId = +req.params.id;
    try {
        const projectRecord = await findProject(projectId);
        if (projectRecord) {
            res.status(200).json({
                message: 'Project was found!',
                project: projectRecord
            });
        } else {
            next(new NotFoundError(projectId));
        }
    } catch (err) {
        console.error(err);
        next(new HttpError(`Could not find project with id = ${projectId}!`));
    }
};

export const createProject: RequestHandler = async (req, res, next) => {
    const title = (req.body as {title: string}).title;
    const code = (req.body as {code: string}).code;
    const description = (req.body as {description: string}).description;
    const email = (req.body as {email: string}).email;
    //email надо получать из текущего пользователя

    try {
        const userRecord = await findUser(email);
        const projectRecord = await findProject(title);
        
        if (!projectRecord && userRecord) {
            const newProjectRecord = await prisma.project.create({
                data: {
                    title: title,
                    code: code,
                    description: description,
                    owner_id: userRecord.id
                }
            });
    
            if (newProjectRecord) {
                const backlog = await prisma.sprint.create({
                    data: {
                        title: `Backlog of ${newProjectRecord.title} project.`,
                        description: `Here you can store all tasks for next sprint.`,
                        project_id: newProjectRecord.id
                    }
                });
                
                const newUserToProjectMapping = await userToProjectMappingHandler(newProjectRecord.id, newProjectRecord.owner_id);

                res.status(201).json({
                    message: 'Project was created!',
                    project: newProjectRecord,
                    userToProject: newUserToProjectMapping,
                    backlog: backlog
                });
            }
        } else {
            next(new HttpError('Project with this title already exists!', 422));
        }
    } catch (err) {
        next(new HttpError('Could not create project!'))
    }
};

export const updateProject: RequestHandler = async (req, res, next) => {
    const projectId = +req.params.id;
    const title = (req.body as {title: string}).title;
    const code = (req.body as {code: string}).code;
    const description = (req.body as {description: string}).description;
    // проверять пользователя
    // т.е. является ли он владельцем проекта
    // если нет, то кидаем ошибку
    try {
        const projectRecord = await findProject(projectId);
        if (projectRecord) {
            const updatedProject = await prisma.project.update({
                where: {
                    id: projectId
                },
                data: {
                    title: title,
                    code: code,
                    description: description
                }
            });
            res.status(201).json({
                message: 'Project was updated!',
                project: updatedProject
            });
        } else {
            next(new NotFoundError(projectId));
        }
    } catch (err) {
        next(new HttpError(`Could not update project with id = ${projectId}!`));
    }
}

export const deleteProject: RequestHandler = async (req, res, next) => {
    const projectId = +req.params.id;
    // если удаляем проект, то надо удалить все спринты, беклог, userToProject, все таски и комментарии
    try {
        const projectRecord = await findProject(projectId);

        if (projectRecord) {
            await prisma.usertoprojectmapping.deleteMany({
                where: {
                    project_id: projectId
                }
            });
            
            await prisma.project.delete({
                where: {
                    id: projectId
                }
            });
            const projects = await prisma.project.findMany();

            res.status(200).json({
                message: 'Project was deleted!',
                projects: projects
            });
        } else {
            next(new NotFoundError(projectId));
        }
    } catch (err) {
        next(new HttpError(`Could not delete project with id = ${projectId}!`))
    }
};
