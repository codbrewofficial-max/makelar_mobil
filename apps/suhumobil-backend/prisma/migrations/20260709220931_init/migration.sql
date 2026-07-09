-- CreateEnum
CREATE TYPE "MediaSourceType" AS ENUM ('UPLOAD', 'EXTERNAL_LINK', 'AI_GENERATED');

-- AlterTable
ALTER TABLE "cars" ADD COLUMN     "inspected_by" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "token_version" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "content_sections" (
    "id" TEXT NOT NULL,
    "page" VARCHAR(50) NOT NULL,
    "section_key" VARCHAR(50) NOT NULL,
    "content" JSONB NOT NULL,
    "updated_by" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_assets" (
    "id" TEXT NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "source_type" "MediaSourceType" NOT NULL,
    "file_hash" VARCHAR(64),
    "size_bytes" INTEGER,
    "alt_text" VARCHAR(255),
    "uploaded_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" VARCHAR(50) NOT NULL,
    "entity" VARCHAR(50) NOT NULL,
    "entity_id" TEXT,
    "metadata" JSONB,
    "ip_address" VARCHAR(45),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "content_sections_page_idx" ON "content_sections"("page");

-- CreateIndex
CREATE UNIQUE INDEX "content_sections_page_section_key_key" ON "content_sections"("page", "section_key");

-- CreateIndex
CREATE INDEX "media_assets_source_type_idx" ON "media_assets"("source_type");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_entity_idx" ON "audit_logs"("entity");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- AddForeignKey
ALTER TABLE "cars" ADD CONSTRAINT "cars_inspected_by_fkey" FOREIGN KEY ("inspected_by") REFERENCES "curators"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_sections" ADD CONSTRAINT "content_sections_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
