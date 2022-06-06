import {user, task, sprint, comment, PrismaClient, project, usertoprojectmapping} from "@prisma/client";

const prisma = new PrismaClient();

export const findProjects = async () => {
    let projects: Array<project> | null;
    try {
        projects = await prisma.project.findMany({
            include: {
                user: true
            }
        });
        if (projects) {
            let fetchedProjects = JSON.parse(JSON.stringify(projects)).map((project: any) => {
                project.owner = project.user;
                project.ownerId = project.owner_id;
                delete project.user;
                delete project.owner.password;
                delete project.owner_id;
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
            fetchedProject.ownerId = fetchedProject.owner.id;
            delete fetchedProject.owner_id;
            delete fetchedProject.user;
            delete fetchedProject.owner.password;
            
            let sprints = await findSprintByProjectId(fetchedProject.id);
            
            if (sprints && sprints.length > 0) {
                for (const sprint of sprints) {
                    const now = new Date();
                    if (sprint && sprint.date_start && sprint.date_end &&
                        (now > sprint.date_start && now < sprint.date_end)) {
                        fetchedProject.sprintId = sprint.id;
                    } else if (sprint && !sprint.date_start && !sprint.date_end) {
                        fetchedProject.backlogId = sprint.id
                    }
                }
            }
            // console.log(fetchedProject);
            return new Promise<Partial<project> & {owner: user} & {ownerId: number} | null>(((resolve) => resolve(fetchedProject)));
        }
    } catch (err) {
        new Error('Something went wrong');
    }
};

export const findProjectsByUserId = async (userId: number) => {
    let userToProjects: Array<usertoprojectmapping & {user: user, project: project}> | null;
    
    try {
        userToProjects = await prisma.usertoprojectmapping.findMany({
            where: {
                user_id: userId
            },
            include: {
                user: true,
                project: true
            }
        });
        
        if (userToProjects) {
            const projectIds = JSON.parse(JSON.stringify(userToProjects)).map((project: any) => project.project_id);
            const projects: Array<Partial<project> & {owner: user}> = [];
            for (const id of projectIds) {
                const projectRecord = await findProject(id);
                if (projectRecord) {
                    const project = JSON.parse(JSON.stringify(projectRecord));
                    project.ownerId = project.owner_id;
                    projects.push(project);
                }
            }
            return new Promise<Array<Partial<project> & {owner: user}> | null>(((resolve) => resolve(projects)));
        }
    } catch (err) {
        new Error('Something went wrong');
    }
}

export const findUserToProjectMapping = async (projectId: number) => {
    let team: Array<usertoprojectmapping & {user: user}> | null;
    try {
        team = await prisma.usertoprojectmapping.findMany({
            where: {
                project_id: projectId
            }, include: {
                user: true
            }
        });
        
        if (team) {
            return new Promise<Array<usertoprojectmapping & {user: user}> | null>((resolve) => resolve(team));
        }
    } catch (err) {
        new Error('Something went wrong');
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

export const findTasksBySprintId = async (sprintId: number) => {
    let tasks: Array<Partial<task> & {
        user_task_assigner_idTouser?: user | null,
        assigner?: Partial<user> | null,
        user_task_creator_idTouser?: user | null,
        creator?: Partial<user> | null,
        sprintId?: number
    }> | null = null;
    try {
        tasks = await prisma.task.findMany({
            where: {
                sprint_id: sprintId
            },
            include: {
                user_task_assigner_idTouser: true,
                user_task_creator_idTouser: true
            }
        });
        
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
                
                if (task.sprint_id) {
                    task.sprintId = task.sprint_id!;
                }
                delete task.sprint_id;
                
                return task;
            });
            return new Promise<Array<Partial<task> &
                { assigner?: Partial<user> | null,
                    creator?: Partial<user> | null,
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
                    const task = await findTasksBySprintId(sprint.id);
                    tasks = tasks.concat(task)
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
};

export const getMonth = (id: number) => {
    const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return month[id];
}

export const joinDate = (
    day: string | number,
    month: string | number,
    year: string | number,
    hours?: string | number,
    minutes?: string | number) => {
    return hours && minutes ? minutes >= 10 ? `${day}/${month}/${year} ${hours}:${minutes}` :  `${day}/${month}/${year} ${hours}:0${minutes}`: `${day}/${month}/${year} `;
}

export const findCommentsByTaskId = async (taskId: number) => {
    let comments: Array<comment & {user: user}> | null;
    try {
        comments = await prisma.comment.findMany({
            where: {
                task_id: taskId
            }, include: {
                user: true
            }
        });
        // console.log(comments);
        if (comments) {
            let fetchedComments = JSON.parse(JSON.stringify(comments));
            fetchedComments = fetchedComments.map((comment: any) => {
                comment.user = {
                    id: comment.user.id,
                    name: comment.user.name,
                    email: comment.user.email
                };
                const date = new Date(comment.date);
                comment.date = joinDate(
                    date.getDate(),
                    getMonth(date.getMonth()),
                    date.getFullYear(),
                    date.getHours(),
                    date.getMinutes()
                );
                return comment;
            });
            return new Promise<task & {user: user} | null>((resolve) => resolve(fetchedComments));
        }
    } catch (err) {
        new Error('Something went wrong');
    }
};