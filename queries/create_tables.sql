drop table UserToProjectMapping;
drop table Comment;
drop table Task;
drop table Sprint;
drop table Project;
drop table "User";


create table Project(
    id serial primary key,
    title text unique not null,
    description text not null,
    owner_id integer not null
);

create table "User"
(
    id serial primary key,
    name text not null,
    email text unique not null,
    password text not null,
    role text,
    img_url text
);

create table UserToProjectMapping(
    id serial primary key,
    project_id integer,
    foreign key (project_id) references Project (id),
    person_id integer,
    foreign key (person_id) references "User" (id)
);

create table Sprint(
    id serial primary key,
    project_id integer,
    foreign key (project_id) references Project (id),
    title text not null,
    description text,
    date_start timestamp,
    date_end timestamp
);

create table Task(
    id serial primary key,
    sprint_id integer,
    foreign key (sprint_id) references Sprint (id),
    backlog_id integer,
    foreign key (backlog_id) references Sprint (id),
    creator_id integer not null,
    foreign key (creator_id) references "User" (id),
    assigner_id integer,
    foreign key (assigner_id) references "User" (id),
    title text not null,
    description text not null,
    status text default 'To do',
    estimation integer,
    priority text default 'Medium'
);

create table Comment(
    id serial primary key,
    "date" timestamp,
    "text" text,
    user_id integer,
    foreign key (user_id) references "User" (id),
    task_id integer,
    foreign key (task_id) references Task (id)
);

alter table Project add foreign key (owner_id) references "User" (id);
