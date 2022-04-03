"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProject = exports.updateProject = exports.createProject = exports.findOneProject = exports.projects = void 0;
const client_1 = require("@prisma/client");
const functions_1 = require("../functions");
const HttpError_1 = __importDefault(require("../errors/HttpError"));
const NotFoundError_1 = __importDefault(require("../errors/NotFoundError"));
const prisma = new client_1.PrismaClient();
const projects = async (req, res, next) => {
    try {
        const projectRecords = await prisma.project.findMany();
        if (projectRecords.length > 0) {
            res.status(200).json({ projects: projectRecords });
        }
        else {
            next(new NotFoundError_1.default('Projects were not found!'));
        }
    }
    catch (err) {
        console.error(err);
        next(new HttpError_1.default('Could not find projects!'));
    }
};
exports.projects = projects;
const findOneProject = async (req, res, next) => {
    const projectId = +req.params.id;
    try {
        const projectRecord = await (0, functions_1.findProject)(projectId);
        if (projectRecord) {
            res.status(200).json({
                message: 'Project was found!',
                project: projectRecord
            });
        }
        else {
            next(new NotFoundError_1.default(projectId));
        }
    }
    catch (err) {
        console.error(err);
        next(new HttpError_1.default(`Could not find project with id = ${projectId}!`));
    }
};
exports.findOneProject = findOneProject;
const createProject = async (req, res, next) => {
    const title = req.body.title;
    const description = req.body.description;
    const email = req.body.email;
    //email надо получать из текущего пользователя
    try {
        const userRecord = await (0, functions_1.findUser)(email);
        const projectRecord = await (0, functions_1.findProject)(title);
        if (!projectRecord && userRecord) {
            const newProjectRecord = await prisma.project.create({
                data: {
                    title: title,
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
                const newUserToProjectMapping = await (0, functions_1.userToProjectMappingHandler)(newProjectRecord.id, newProjectRecord.owner_id);
                res.status(201).json({
                    message: 'Project was created!',
                    project: newProjectRecord,
                    userToProject: newUserToProjectMapping,
                    backlog: backlog
                });
            }
        }
        else {
            next(new HttpError_1.default('Project with this title already exists!', 422));
        }
    }
    catch (err) {
        next(new HttpError_1.default('Could not create project!'));
    }
};
exports.createProject = createProject;
const updateProject = async (req, res, next) => {
    const projectId = +req.params.id;
    const title = req.body.title;
    const description = req.body.description;
    // проверять пользователя
    // т.е. является ли он владельцем проекта
    // если нет, то кидаем ошибку
    try {
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
            res.status(201).json({
                message: 'Project was updated!',
                project: updatedProject
            });
        }
        else {
            next(new NotFoundError_1.default(projectId));
        }
    }
    catch (err) {
        next(new HttpError_1.default(`Could not update project with id = ${projectId}!`));
    }
};
exports.updateProject = updateProject;
const deleteProject = async (req, res, next) => {
    const projectId = +req.params.id;
    // если удаляем проект, то надо удалить все спринты, беклог, userToProject, все таски и комментарии
    try {
        const projectRecord = await (0, functions_1.findProject)(projectId);
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
        }
        else {
            next(new NotFoundError_1.default(projectId));
        }
    }
    catch (err) {
        next(new HttpError_1.default(`Could not delete project with id = ${projectId}!`));
    }
};
exports.deleteProject = deleteProject;
