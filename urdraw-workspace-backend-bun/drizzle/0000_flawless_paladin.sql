CREATE TYPE "public"."permission_enum" AS ENUM('view', 'edit');--> statement-breakpoint
CREATE TYPE "public"."status_enum" AS ENUM('pending', 'accepted');--> statement-breakpoint
CREATE TABLE "collection_share" (
	"id" uuid PRIMARY KEY NOT NULL,
	"collectionId" uuid NOT NULL,
	"ownerId" varchar NOT NULL,
	"sharedWithId" varchar NOT NULL,
	"inviteCode" varchar NOT NULL,
	"permission" "permission_enum" NOT NULL,
	"status" "status_enum" NOT NULL,
	CONSTRAINT "collection_id_unique" UNIQUE("id"),
	CONSTRAINT "collection_share_inviteCode_unique" UNIQUE("inviteCode")
);
--> statement-breakpoint
CREATE TABLE "collection" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"userId" varchar(255) NOT NULL,
	CONSTRAINT "collection_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "drawing" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"content" text,
	"thumbnailUrl" text,
	"userId" varchar(255) NOT NULL,
	"lastModified" date,
	"collectionId" uuid,
	CONSTRAINT "collection_id_unique" UNIQUE("id")
);
