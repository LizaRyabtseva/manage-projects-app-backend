"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProject = exports.updateProject = exports.createProject = exports.findOneProject = exports.projects = void 0;
const client_1 = require("@prisma/client");
const functions_1 = require("../functions");
const prisma = new client_1.PrismaClient();
const projects = async (req, res, next) => {
    try {
        const projectRecords = await prisma.project.findMany();
        res.status(200).json({ projects: projectRecords });
    }
    catch (err) {
        res.status(500).json({ message: err });
    }
};
exports.projects = projects;
const findOneProject = async (req, res, next) => {
    const projectId = +req.params.id;
    try {
        const projectRecord = await (0, functions_1.findProject)(projectId);
        if (projectRecord) {
            res.status(200).json({
                message: 'Project wad found',
                project: projectRecord
            });
        }
        else {
            res.status(404).json({ message: 'Can not found the project!' });
        }
    }
    catch (err) {
        res.status(500).json({
            message: err
        });
    }
};
exports.findOneProject = findOneProject;
const createProject = async (req, res, next) => {
    const title = req.body.title;
    const description = req.body.description;
    const email = req.body.email;
    //email надо получать из текущего пользователя
    // const people = (req.body as {people: string[]}).people;
    // массив строк с email'ми пользователей
    try {
        const userRecord = await (0, functions_1.findUser)(email);
        const projectRecord = await (0, functions_1.findProject)(title);
        if (!projectRecord && userRecord) {
            try {
                await prisma.project.create({
                    data: {
                        title: title,
                        description: description,
                        owner_id: userRecord.id
                    }
                });
            }
            catch (err) {
                res.status(500).json({
                    message: err,
                });
            }
            const newProjectRecord = await (0, functions_1.findProject)(title);
            if (newProjectRecord) {
                const newUserToProjectMapping = await (0, functions_1.userToProjectMappingHandler)(newProjectRecord.id, newProjectRecord.owner_id);
                res.status(201).json({
                    message: 'Project was created!',
                    project: newProjectRecord,
                    userToProject: newUserToProjectMapping
                });
            }
        }
        else {
            res.status(200).json({
                message: 'This project already exists!'
            });
        }
    }
    catch (err) {
        res.status(500).json({
            err
        });
    }
};
exports.createProject = createProject;
const updateProject = async (req, res, next) => {
    const projectId = +req.params.id;
    const title = req.body.title;
    const description = req.body.description;
    try {
        if (projectId) {
            const projectRecord = await (0, functions_1.findProject)(projectId);
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
            }
            else {
                res.status(404).json({ message: 'Can not found the project!' });
            }
        }
        else {
            res.status(404).json({ message: 'Can not found the project!' });
        }
    }
    catch (err) {
        res.status(500).json({
            message: err
        });
    }
};
exports.updateProject = updateProject;
const deleteProject = async (req, res, next) => {
    const projectId = +req.params.id;
    let projects;
    try {
        const projectRecord = await (0, functions_1.findProject)(projectId);
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
        }
        else {
            res.status(404).json({ message: 'Can not found the project!' });
        }
    }
    catch (err) {
        res.status(500).json({
            message: err
        });
    }
};
exports.deleteProject = deleteProject;
