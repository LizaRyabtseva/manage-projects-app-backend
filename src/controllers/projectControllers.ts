import {RequestHandler} from 'express';
import {PrismaClient, user} from '@prisma/client';
import {
    findUser,
    findProject,
    userToProjectMapping,
    findUserToProjectMapping,
    updateProjectStatus,
    findProjects,
    findProjectsByUserId
} from '../functions';
import HttpError from '../errors/HttpError';
import NotFoundError from '../errors/NotFoundError';

const prisma = new PrismaClient();


export const projects: RequestHandler = async (req, res, next) => {
    try {
        const projectRecords = await findProjects();

        if (projectRecords && projectRecords.length > 0) {
            res.status(200).json({projects: projectRecords});
        } else {
            next(new NotFoundError('Projects were not found!'));
        }
    } catch (err) {
        next(new HttpError('Could not find projects!'));
    }
}

export const findOneProject: RequestHandler = async (req, res, next) => {
    const projectId = +req.params.id;
    try {
        const projectRecord = await findProject(projectId);
        // let pr = JSON.parse(JSON.stringify(projectRecord));
        // delete pr.owner.password;

        const usersToProject = await findUserToProjectMapping(projectId);

        const team = usersToProject?.filter(member => member.user_id !== projectRecord?.owner_id)
            .map(member => {
                return {
                    id: member.user_id,
                    name: member.user?.name,
                    email: member.user?.email
                }
            });

        const allTeam = usersToProject?.map(member => {
            return {
                id: member.user_id,
                name: member.user?.name,
                email: member.user?.email
            }
        });

        const project = {...projectRecord, team, allTeam};
        if (project) {
            res.status(200).json({
                message: 'Project was found!',
                project
            });
        } else {
            next(new NotFoundError(projectId));
        }
    } catch (err) {
        next(new HttpError(`Could not find project with id = ${projectId}!`));
    }
};

export const createProject: RequestHandler = async (req, res, next) => {
    const title = (req.body as {title: string}).title;
    const code = (req.body as {code: string}).code;
    const description = (req.body as {description: string}).description;
    const userId = (req.body as {owner: string}).owner;
    const team = (req.body as {team: number[]}).team;
    
    //email надо получать из текущего пользователя

    try {
        const userRecord = await findUser(userId, 'id');
        if (userRecord && !team.includes(userRecord.id)) {
            team.push(userRecord.id);
        }
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
    
            if (newProjectRecord && userRecord) {
                for (const member of team) {
                    await prisma.user.update({
                        where: {
                            id: member
                        },
                        data: {
                            current_project_id: newProjectRecord.id
                        }
                    });
                }
                
                const backlog = await prisma.sprint.create({
                    data: {
                        title: `Backlog of ${newProjectRecord.title} project.`,
                        description: `Here you can store all tasks for next sprint.`,
                        project_id: newProjectRecord.id
                    }
                });
                
                team.map(async user => await userToProjectMapping(newProjectRecord.id, user));

                res.status(201).json({
                    message: 'Project was created!',
                    project: newProjectRecord,
                    backlog: backlog
                });
            }
        } else {
            next(new HttpError('You passed wrong data!', 400));
        }
    } catch (err) {
        next(new HttpError('Could not create project!'));
    }
};

export const updateProject: RequestHandler = async (req, res, next) => {
    const projectId = +req.params.id;
    const title = (req.body as {title: string}).title;
    const code = (req.body as {code: string}).code;
    const description = (req.body as {description: string}).description;
    const team = (req.body as {team: number[]}).team;

    // проверять пользователя
    // т.е. является ли он владельцем проекта
    // если нет, то кидаем ошибку
    let projectRecord;
    try {
        projectRecord = await findProject(projectId);
    } catch (err) {
        next(new HttpError(`Could not find project with id = ${projectId}`));
    }
    
    if (projectRecord && team) {
        team.push(projectRecord.ownerId);
        let updatedProject;
        try {
            updatedProject = await prisma.project.update({
                where: {
                    id: projectId
                },
                data: {
                    title: title,
                    code: code,
                    description: description
                }
            });
        } catch (err) {
            next(new HttpError(`Could not update project with id = ${projectId}`));
        }
        
        let usersToProject, userIds;
        try {
            usersToProject = await findUserToProjectMapping(projectId);
            userIds = usersToProject?.map(member => member.user_id);
        } catch (err) {
            next(new HttpError(`Could not create userToProjectMapping for project with id = ${projectId}`));
        }
            
        if ( usersToProject && userIds) {
            // new user
            for (const member of team) {
                if (!userIds.includes(member)) {
                    try {
                        await userToProjectMapping(projectId, member);
                        await prisma.user.update({
                            where: {
                                id: member
                            }, data: {
                                current_project_id: projectId
                            }
                        });
                    } catch (err) {
                        next(new HttpError(`Could not update currentProject field in user with id = ${member}`));
                    }
                }
            }
    
            // delete user if he left the team
            for (const member of usersToProject) {
                if (!team.includes(member.user_id)) {
                    try {
                        await prisma.usertoprojectmapping.delete({
                            where: {
                                id: member.id
                            }
                        });
                        await prisma.user.update({
                            where: {
                                id: member.user_id
                            }, data: {
                                current_project_id: null
                            }
                        });
                    } catch (err) {
                        next(new HttpError(`Could not update currentProject field in user with id = ${member.id}`));
                    }
                }
            }
    
            res.status(201).json({
                message: 'Project was updated!',
                project: updatedProject
            });
        } else {
            next(new NotFoundError(`Could not find users`));
        }
    }
}

export const finishProject: RequestHandler = async (req, res, next) => {
    const projectId = +req.params.id;
    const status = (req.body as {status: string}).status;
    console.log('here');
    try {
        const projectRecord = await findProject(projectId);
        
        if (projectRecord) {
            await updateProjectStatus(projectId, status);
    
            const usersToProject = await findUserToProjectMapping(projectId);
            const userIds = usersToProject?.map(member => member.user_id);
    
            if ( usersToProject && userIds) {
                for (const id of userIds) {
                    // await findUserToProjectMapping(projectId);
                    await prisma.user.update({
                        where: {
                            id: id
                        }, data: {
                            current_project_id: null
                        }
                    });
                }
            }
            
            res.status(200).json({message: `Status of project with id=${projectId} was changed!`});
        } else {
            next(new NotFoundError(projectId));
        }
    } catch (err) {
        next(new HttpError(`Could not change status of project with id = ${projectId}!`))
    }
};

export const getProjectsByUserId: RequestHandler = async (req, res, next) => {
    const userId = +req.params.userId;
    let userRecord;
    try {
        userRecord = await findUser(userId, 'id');
    } catch (err) {
        next(new HttpError(`Could not find user with id = ${userId}!`))
    }
    if (userRecord) {
        try {
            const projects = await findProjectsByUserId(userId)
            if (projects) {
                res.status(200).json({message: 'Projects was found', projects});
            }
        } catch (err) {
            next(new HttpError(`Could not find projects for user with id = ${userId}!`))
        }
    } else {
        next(new NotFoundError(userId));
    }
};

export const makeCurrentProject: RequestHandler = async (req, res, next) => {
    const projectId = (req.body as {projectId: number}).projectId;
    const userId = (req.body as {userId: number}).userId;
    
    let userRecord, projectRecord;
    try {
        userRecord = await findUser(userId, 'id');
    } catch (err) {
        next(new HttpError(`Could not find user with id = ${userId}!`))
    }
    
    try {
        projectRecord = await findProject(projectId);
    } catch (err) {
        next(new HttpError(`Could not find project with id = ${projectId}!`))
    }
    
    if (userRecord && projectRecord) {
        try {
            await prisma.user.update({
                where: {
                    id: userId
                }, data: {
                    current_project_id: projectId
                }
            });
            
            res.status(200).json({message: `Current project of user with id = ${userId} was updated`});
        } catch (err) {
            next(new HttpError(`Could not update user with id = ${userId}!`))
        }
    } else if (userRecord && !projectRecord) {
        next(new NotFoundError(projectId));
    } else if (!userRecord && projectRecord) {
        next(new NotFoundError(userId));
    }
};