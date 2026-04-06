ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Entry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Insight" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;

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
