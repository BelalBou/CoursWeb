-- CreateTable
CREATE TABLE "projets" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "lien" TEXT NOT NULL,
    "est_publie" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technologies" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,

    CONSTRAINT "technologies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projets_technologies" (
    "projet_id" INTEGER NOT NULL,
    "technologie_id" INTEGER NOT NULL,

    CONSTRAINT "projets_technologies_pkey" PRIMARY KEY ("projet_id","technologie_id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" UUID NOT NULL,
    "nom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "recu_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "projets_slug_key" ON "projets"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "technologies_nom_key" ON "technologies"("nom");

-- CreateIndex
CREATE INDEX "projets_technologies_technologie_id_idx" ON "projets_technologies"("technologie_id");

-- CreateIndex
CREATE INDEX "messages_recu_le_idx" ON "messages"("recu_le" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "messages_email_message_key" ON "messages"("email", "message");

-- AddForeignKey
ALTER TABLE "projets_technologies" ADD CONSTRAINT "projets_technologies_projet_id_fkey" FOREIGN KEY ("projet_id") REFERENCES "projets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projets_technologies" ADD CONSTRAINT "projets_technologies_technologie_id_fkey" FOREIGN KEY ("technologie_id") REFERENCES "technologies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
