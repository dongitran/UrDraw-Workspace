CREATE TABLE hieudien_test
(
    id          varchar(255) UNIQUE NOT NULL,
    name        varchar(255)        NOT NULL,
    user_id     varchar(255)        NOT NULL,

    PRIMARY KEY (id)
);
