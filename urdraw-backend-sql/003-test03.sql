CREATE TABLE hieudien_test_03
(
    id          varchar(255) UNIQUE NOT NULL,
    name        varchar(255)        NOT NULL,
    user_id     varchar(255)        NOT NULL,
    description text                NULL,

    PRIMARY KEY (id)
);
