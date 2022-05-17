import {user, task, sprint, PrismaClient, project, usertoprojectmapping} from "@prisma/client";

const prisma = new PrismaClient();

export const findProject = async (param: number | string) => {
    let project: project | null;
    try {
        if (typeof param === 'number') {
            project = await prisma.project.findUnique({
                where: {
                    id: param
                }
            });
        } else {
            project = await prisma.project.findUnique({
                where: {
                    title: param
                }
            });
        }
        if (project) {
            return new Promise<project | null>(((resolve) => resolve(project)));
        }
    } catch (err) {
        new Error('Something went wrong');
    }
};

export const findUserToProjectMapping = async (param: number) => {
    let team: Array<usertoprojectmapping & {user: user}> | null;
    console.log(param);
    try {
        team = await prisma.usertoprojectmapping.findMany({
            where: {
                project_id: param
            }, include: {
                user: true
            }
        });
    
        console.log(team);
        if (team) {
            return new Promise<Array<usertoprojectmapping & {user: user}> | null>((resolve) => resolve(team));
        }
    } catch (err) {
    
    }
}

export const findUser = async (param: string | number, type: string) => {
    let user: user | null = null;

    try {
        if (typeof param === 'string' && type === 'email') {
            user = await prisma.user.findUnique({
                where: {
                    email: param
                }
            });
        } else if (typeof  param === 'number' && type === 'id') {
            user = await prisma.user.findUnique({
                where: {
                    id: param
                }
            });
        }
        if (user) {
            return new Promise<user | null>((resolve) => resolve(user));
        }
    } catch (err) {
        new Error('Something went wrong');
    }
};

export const findTaskById = async (taskId: number) => {
    let task: task | null;
    try {
        const task = await prisma.task.findUnique({
            where: {
                id: taskId
            },
            include: {
                user_task_assigner_idTouser: true
            }
        });
        if (task) {
            return new Promise<task | null>((resolve) => resolve(task));
        }
    } catch (err) {
        new Error('Something went wrong');
    }
};

export const findTasksBySprintId = async (sprintId: number) => {
    let tasks: Array<task & { user_task_assigner_idTouser?: user | null, assigner?: Partial<user> | null}> | null;
    try {
        tasks = await prisma.task.findMany({
            where: {
                OR: [{
                    sprint_id: sprintId
                }, {
                    backlog_id: sprintId
                }]
            },
            include: {
                user_task_assigner_idTouser: true
            }
        });
        // console.log(tasks);
        if (tasks) {
            tasks = tasks.map(task => {
                if (task.user_task_assigner_idTouser) {
                    task.assigner = {
                        id: task.user_task_assigner_idTouser.id,
                        name: task.user_task_assigner_idTouser.name,
                        email: task.user_task_assigner_idTouser.email
                    };
                    delete task.user_task_assigner_idTouser;
                }
                return task;
            });
            return new Promise<Array<task & { assigner?: Partial<user> | null}> | null>((resolve) => resolve(tasks));
        }
    } catch (err) {
        new Error('Something went wrong');
    }
}

export const findSprintByProjectId = async (projectId: number) => {
    try {
        const sprints = await prisma.sprint.findMany({
            where: {
                project_id: projectId
            }
        });
        // console.log(sprints);
        if (sprints) {
            return new Promise<Array<sprint | null>>((resolve) => resolve(sprints));
        }
    } catch (err) {
        new Error('Something went wrong');
    }
}

export const findTasksByProjectId = async (projectId: number) => {
    try {
        const sprints = await findSprintByProjectId(projectId);
        if (sprints) {
            let tasks: any = [];
            for (const sprint of sprints) {
                if (sprint) {
                    const t = await findTasksBySprintId(sprint.id);
                    tasks = tasks.concat(t)
                }
            }
            if (tasks) {
                return new Promise<Array<task | null>>((resolve) => resolve(tasks));
            }
        }
    } catch (err) {
        new Error('Something went wrong');
    }
}

export const userToProjectMapping = async (projectId: number, personId: number) => {
    try {
        await prisma.usertoprojectmapping.create({
            data: {
                project_id: projectId,
                user_id: personId
            }
        });
    } catch (err) {
        new Error('Something went wrong');
    }
};

export const updateProjectStatus = async (projectId: number, status: string) => {
    try {
        await prisma.project.update({
            where: {
                id: projectId
            }, data: {
                status: status
            }
        });
    } catch (err) {
        new Error('Something went wrong');
    }
}