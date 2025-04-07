CREATE TABLE system_logs
(
    id                 varchar(255) UNIQUE NOT NULL,
    user_id            varchar(255)        NOT NULL,
    type               varchar(255)        NOT NULL,
    related_id         varchar(255)        NOT NULL,
    description        text                NOT NULL,
    old_data           jsonb               NOT NULL,
    new_data           jsonb               NOT NULL,
    method             varchar(10)         NOT NULL,
    params             jsonb               NULL,
    created_at         timestamptz         NOT NULL,
    created_by         varchar(255)        NOT NULL,
    updated_at         timestamptz,
    updated_by         varchar(255),
    deleted_at         timestamptz,
    deleted_by         varchar(255),
    PRIMARY KEY (id)
);
