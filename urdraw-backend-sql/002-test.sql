CREATE TABLE invitations
(
    id                 varchar(255) UNIQUE NOT NULL,
    name               varchar(255)        NOT NULL,
    user_id            varchar(255)        NOT NULL,
    description        text                NULL,
    share_with_user_id varchar(255)        NOT NULL,

    params             jsonb               NULL,
    created_at         timestamptz         NOT NULL,
    created_by         varchar(255)        NOT NULL,
    updated_at         timestamptz,
    updated_by         varchar(255),
    deleted_at         timestamptz,
    deleted_by         varchar(255),
    PRIMARY KEY (id)
);
