ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "age" INTEGER,
ADD COLUMN IF NOT EXISTS "gender" TEXT,
ADD COLUMN IF NOT EXISTS "weight" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "height" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "trainingLevel" TEXT,
ADD COLUMN IF NOT EXISTS "trainingGoal" TEXT,
ADD COLUMN IF NOT EXISTS "injuryNotes" TEXT;

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Entry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Insight" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "prisma_full_access_user" ON "User";
DROP POLICY IF EXISTS "prisma_full_access_entry" ON "Entry";
DROP POLICY IF EXISTS "prisma_full_access_insight" ON "Insight";
DROP POLICY IF EXISTS "prisma_full_access_migrations" ON "_prisma_migrations";

CREATE POLICY "prisma_full_access_user" ON "User"
  FOR ALL
  TO postgres
  USING (true)
  WITH CHECK (true);

CREATE POLICY "prisma_full_access_entry" ON "Entry"
  FOR ALL
  TO postgres
  USING (true)
  WITH CHECK (true);

CREATE POLICY "prisma_full_access_insight" ON "Insight"
  FOR ALL
  TO postgres
  USING (true)
  WITH CHECK (true);

CREATE POLICY "prisma_full_access_migrations" ON "_prisma_migrations"
  FOR ALL
  TO postgres
  USING (true)
  WITH CHECK (true);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'postgres.kaovesfecguwubypidlz') THEN
    EXECUTE 'CREATE POLICY "prisma_full_access_user_pooler" ON "User" FOR ALL TO "postgres.kaovesfecguwubypidlz" USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "prisma_full_access_entry_pooler" ON "Entry" FOR ALL TO "postgres.kaovesfecguwubypidlz" USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "prisma_full_access_insight_pooler" ON "Insight" FOR ALL TO "postgres.kaovesfecguwubypidlz" USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "prisma_full_access_migrations_pooler" ON "_prisma_migrations" FOR ALL TO "postgres.kaovesfecguwubypidlz" USING (true) WITH CHECK (true)';
  END IF;
END $$;
