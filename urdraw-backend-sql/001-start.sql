CREATE TABLE workspaces
(
    id          varchar(255) UNIQUE NOT NULL,
    name        varchar(255)        NOT NULL,
    user_id     varchar(255)        NOT NULL,
    description text                NULL,
    params      jsonb               NULL,
    created_at  timestamptz         NOT NULL,
    created_by  varchar(255)        NOT NULL,
    updated_at  timestamptz,
    updated_by  varchar(255),
    deleted_at  timestamptz,
    deleted_by  varchar(255),
    PRIMARY KEY (id)
);

alter table collections
add column workspace_id varchar(255) NOT NULL;

ALTER TABLE collections
  ADD CONSTRAINT FK_collections_TO_workspaces
  FOREIGN KEY (workspace_id)
  REFERENCES workspaces (id);
