import {user, task, sprint, PrismaClient, project, usertoprojectmapping} from "@prisma/client";

const prisma = new PrismaClient();

export const findProjects = async () => {
    let projects:  Array<project> | null;
    try {
        projects = await prisma.project.findMany({
            include: {
                user: true
            }
        });
        if (projects) {
            let fetchedProjects = JSON.parse(JSON.stringify(projects)).map((project: any) => {
                project.owner = project.user;
                delete project.user;
                delete project.owner.password;
                return project;
            });

            return new Promise<Array<project & {owner: user}> | null>(((resolve) => resolve(fetchedProjects)));
        }
    } catch (err) {
        new Error('Something went wrong');
    }
}

export const findProject = async (param: number | string) => {
    let project: project & {user: user} | null;
    try {
        if (typeof param === 'number') {
            project = await prisma.project.findUnique({
                where: {
                    id: param
                }, include: {
                    user: true
                }
            });
        } else {
            project = await prisma.project.findUnique({
                where: {
                    title: param
                }, include: {
                    user: true
                }
            });
        }
        if (project) {
            const fetchedProject = JSON.parse(JSON.stringify(project));
            fetchedProject.owner = {...fetchedProject.user};
            delete fetchedProject.user;
            delete fetchedProject.owner.password;
            
            let sprints = await findSprintByProjectId(fetchedProject.id);
            
            if (sprints && sprints.length > 0) {
                for (const sprint of sprints) {
                    if (sprint && sprint.date_start && sprint.date_end) {
                        fetchedProject.sprintId = sprint.id;
                    } else if (sprint) {
                        fetchedProject.backlogId = sprint.id;
                    }
                }
            }
    
            return new Promise<project & {owner: user} | null>(((resolve) => resolve(fetchedProject)));
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
    console.log(param);
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
            console.log('in find user');
            console.log(user);
            return new Promise<user | null>((resolve) => resolve(user));
        }
    } catch (err) {
        new Error('Something went wrong');
    }
};

export const findSprintById = async (sprintId: number) => {
    let sprint: sprint | null;

    try {
        sprint = await prisma.sprint.findUnique({
            where: {
                id: sprintId
            }
        });

        if (sprint) {
            return new Promise<sprint | null>((resolve) => resolve(sprint));
        }
    } catch (err) {
        new Error('Something went wrong');
    }
};

export const findTaskById = async (taskId: number) => {
    let task: task | null;
    let sprint, project;

    try {
        task = await prisma.task.findUnique({
            where: {
                id: taskId
            },
            include: {
                user_task_assigner_idTouser: true,
                user_task_creator_idTouser: true
            }
        });
        if (task) {
            if (task.sprint_id) {
                sprint = await findSprintById(task.sprint_id);
            } else if (task.backlog_id) {
                sprint = await findSprintById(task.backlog_id);
            }
            if (sprint) {
                project = await findProject(sprint.project_id);
                if (project) {
                    const taskWithProjectData = JSON.parse(JSON.stringify(task));
                    taskWithProjectData.project = {
                        id: project.id,
                        title: project.title
                    };
                    return new Promise<task & {user: user} & {project: {id: number, title: string}} | null>((resolve) => resolve(taskWithProjectData));
                }
            }
        }
    } catch (err) {
        new Error('Something went wrong');
    }
};

export const findTasksBySprintId = async (sprintId: number, type: string) => {
    let tasks: Array<Partial<task> & {
        user_task_assigner_idTouser?: user | null,
        assigner?: Partial<user> | null,
        user_task_creator_idTouser?: user | null,
        creator?: Partial<user> | null,
        backlogId?: number,
        sprintId?: number
    }> | null = null;
    try {
        if (type === 'sprint') {
            tasks = await prisma.task.findMany({
                where: {
                    sprint_id: sprintId
                },
                include: {
                    user_task_assigner_idTouser: true,
                    user_task_creator_idTouser: true
                }
            });
        } else if (type === 'backlog') {
            tasks = await prisma.task.findMany({
                where: {
                    backlog_id: sprintId
                },
                include: {
                    user_task_assigner_idTouser: true,
                    user_task_creator_idTouser: true
                }
            });
        }
        
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
                
                if (task.user_task_creator_idTouser) {
                    task.creator = {
                        id: task.user_task_creator_idTouser.id,
                        name: task.user_task_creator_idTouser.name,
                        email: task.user_task_creator_idTouser.email
                    }
                };
                delete task.user_task_creator_idTouser;
                
                if (task.backlog_id || task.backlog_id === null) {
                    task.backlogId = task.backlog_id!;
                }
                
                if (task.sprint_id || task.sprint_id === null) {
                    task.sprintId = task.sprint_id!;
                }
                delete task.backlog_id;
                delete task.sprint_id;
                
                return task;
            });
            return new Promise<Array<Partial<task> &
                { assigner?: Partial<user> | null,
                    creator?: Partial<user> | null,
                    backlogId?: number,
                    sprintId?: number,
                }> | null>((resolve) => resolve(tasks));
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
                    const t = await findTasksBySprintId(sprint.id, 'sprint');
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