drop table UserToProjectMapping;
drop table Comment;
drop table Task;
drop table Sprint;
alter table "user" drop constraint user_current_project_id_fkey;
drop table Project;
drop table "user";


create table Project(
    id serial primary key,
    title text unique not null,
    code text not null,
    description text not null,
    status text default 'Active',
    owner_id integer not null
);

create table "user"(
    id serial primary key,
    name text not null,
    email text unique not null,
    password text not null,
    role text,
    img_url text,
    current_project_id integer,
    foreign key (current_project_id) references Project (id)
);

create table UserToProjectMapping(
    id serial primary key,
    project_id integer not null,
    foreign key (project_id) references Project (id),
    user_id integer not null,
    foreign key (user_id) references "user" (id)
);

create table Sprint(
    id serial primary key,
    title text not null,
    description text,
    date_start timestamp,
    date_end timestamp,
    project_id integer not null,
    foreign key (project_id) references Project (id)
);

create table Task(
    id serial primary key,
    title text not null,
    code text not null,
    description text not null,
    status text default 'To do',
    "type" text default 'Task',
    estimation integer,
    priority text default 'Medium',
    sprint_id integer,
    foreign key (sprint_id) references Sprint (id),
    creator_id integer not null,
    foreign key (creator_id) references "user" (id),
    assigner_id integer,
    foreign key (assigner_id) references "user" (id)
);

create table Comment(
    id serial primary key,
    "date" timestamp not null,
    "text" text not null,
    user_id integer not null,
    foreign key (user_id) references "user" (id),
    task_id integer not null,
    foreign key (task_id) references Task (id)
);

alter table Project add foreign key (owner_id) references "user" (id);
