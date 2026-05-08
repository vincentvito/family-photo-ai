import { schema } from "@/lib/db";
import { studioCutoffDate } from "@/lib/retention";
import { and, eq, gte, isNull, ne, or } from "drizzle-orm";

export function retainedGenerationCondition(now = new Date()) {
  const standardCutoff = studioCutoffDate(now);
  const proCutoff = studioCutoffDate(now, "pro");

  return or(
    and(eq(schema.generations.packTier, "pro"), gte(schema.generations.createdAt, proCutoff)),
    and(
      or(isNull(schema.generations.packTier), ne(schema.generations.packTier, "pro")),
      gte(schema.generations.createdAt, standardCutoff),
    ),
  );
}
