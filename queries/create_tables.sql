drop table Ticket;
drop table Person;
drop table Sprint;
drop table Project;
drop table Projecttopersonmaping;


create table Project(
    id serial primary key,
    title text unique not null,
    description text not null,
    ownerId integer not null
);

create table Person(
    id serial primary key,
    name text not null,
    email text unique not null,
    password text not null,
    role text,
    imgUrl text
);

create table ProjectToPersonMaping(
    id serial primary key,
    projectId integer,
    foreign key (projectId) references Project (id),
    personId integer,
    foreign key (personId) references Person (id)
);

create table Sprint(
    id serial primary key,
    projectId integer,
    foreign key (projectId) references Project (id),
    title text not null,
    description text,
    dateStart date,
    dateEnd date
);


create table Ticket(
    id serial primary key,
    sprintId integer,
    foreign key (sprintId) references Sprint (id),
    backlogId integer,
    foreign key (backlogId) references Sprint (id),
    creatorId integer not null,
    foreign key (creatorId) references Person (id),
    assignerId integer,
    foreign key (assignerId) references Person (id),
    updatedId integer,
    foreign key (updatedId) references Person (id),
    title text not null,
    description text not null,
    status text default 'todo',
    storyPoints integer,
    priority text default 'normal'
);

alter table Project add foreign key (ownerId) references Person (id);
