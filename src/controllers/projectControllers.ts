import {RequestHandler} from "express";
import {PrismaClient, project} from "@prisma/client";
import {findUser, findProject, userToProjectMappingHandler} from "../functions";

const prisma = new PrismaClient();


export const projects: RequestHandler = async (req, res, next) => {
    try {
        const projectRecords = await prisma.project.findMany();
        res.status(200).json({projects: projectRecords});
    } catch (err) {
        res.status(500).json({message: err});
    }
}

export const findOneProject: RequestHandler = async (req, res, next) => {
    const projectId = +req.params.id;
    try {
        const projectRecord = await findProject(projectId);
        if (projectRecord) {
            res.status(200).json({
                message: 'Project wad found',
                project: projectRecord
            });
        } else {
            res.status(404).json({message: 'Can not found the project!'});
        }
    } catch (err) {
        res.status(500).json({
            message: err
        });
    }
};

export const createProject: RequestHandler = async (req, res, next) => {
    const title = (req.body as {title: string}).title;
    const description = (req.body as {description: string}).description;
    const email = (req.body as {email: string}).email;
    //email надо получать из текущего пользователя
    // const people = (req.body as {people: string[]}).people;
    // массив строк с email'ми пользователей

    try {
        const userRecord = await findUser(email);
        const projectRecord = await findProject(title);
        if (!projectRecord && userRecord) {
            try {
                await prisma.project.create({
                    data: {
                        title: title,
                        description: description,
                        owner_id: userRecord.id
                    }
                });
            } catch (err) {
                res.status(500).json({
                    message: err,
                });
            }
            const newProjectRecord = await findProject(title);
            if (newProjectRecord) {
                const newUserToProjectMapping = await userToProjectMappingHandler(newProjectRecord.id, newProjectRecord.owner_id);
                
                const backlog = await prisma.sprint.create({
                    data: {
                        title: `Backlog of ${newProjectRecord.title} project.`,
                        description: `Here you can store all tasks for next sprint.`,
                        project_id: newProjectRecord.id
                    }
                });

                res.status(201).json({
                    message: 'Project was created!',
                    project: newProjectRecord,
                    userToProject: newUserToProjectMapping,
                    backlog: backlog
                });
            }
        } else {
            res.status(200).json({
                message: 'This project already exists!'
            });
        }
    } catch (err) {
        res.status(500).json({
            err
        });
    }
};

export const updateProject: RequestHandler = async (req, res, next) => {
    const projectId = +req.params.id;
    const title = (req.body as {title: string}).title;
    const description = (req.body as {description: string}).description;

    try {
        if (projectId) {
            const projectRecord = await findProject(projectId);
            if (projectRecord) {
                const updatedProject = await prisma.project.update({
                    where: {
                        id: projectId
                    },
                    data: {
                        title: title,
                        description: description
                    }
                });
                res.status(200).json({
                    message: 'Project was updated!',
                    project: updatedProject
                });
            } else {
                res.status(404).json({message: 'Can not found the project!'});
            }
        } else {
            res.status(404).json({message: 'Can not found the project!'});
        }
    } catch (err) {
        res.status(500).json({
            message: err
        });
    }
}

export const deleteProject: RequestHandler = async (req, res, next) => {
    const projectId = +req.params.id;
    let projects: project[];

    try {
        const projectRecord = await findProject(projectId);

        if (projectRecord) {
            await prisma.project.delete({
                where: {
                    id: projectId
                }
            });
            projects = await prisma.project.findMany();

            res.status(200).json({
                message: 'Project was deleted!',
                projects: projects
            });
        } else {
            res.status(404).json({message: 'Can not found the project!'});
        }
    } catch (err) {
        res.status(500).json({
            message: err
        });
    }
}
