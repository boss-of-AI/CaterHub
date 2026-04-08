-- CreateTable
CREATE TABLE "Caterer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Caterer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Menu" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "pricePerHead" DOUBLE PRECISION NOT NULL,
    "minHeadcount" INTEGER NOT NULL,
    "isNonVeg" BOOLEAN NOT NULL,
    "catererId" TEXT NOT NULL,

    CONSTRAINT "Menu_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Caterer_name_city_key" ON "Caterer"("name", "city");

-- AddForeignKey
ALTER TABLE "Menu" ADD CONSTRAINT "Menu_catererId_fkey" FOREIGN KEY ("catererId") REFERENCES "Caterer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
