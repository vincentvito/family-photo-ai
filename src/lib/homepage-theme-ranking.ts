import { sql } from "drizzle-orm";
import { user as userTable } from "@/../db/auth-schema";
import { db, schema } from "@/lib/db";
import { THEMES } from "@/lib/themes";

export type HomepageThemeRankingRow = { themeId: string; count: number };

/**
 * All recorded completed shoots, one use per look in each shoot. This is usage,
 * including previews and gifted credits, rather than a sales or revenue ranking.
 */
export function buildHomepageThemeRankingQuery(limit = 12) {
  const boundedLimit = Number.isFinite(limit)
    ? Math.max(1, Math.min(THEMES.length, Math.trunc(limit)))
    : 12;
  const effectiveThemeId = sql`coalesce(${schema.images.themeId}, ${schema.generations.themeId})`;
  const catalogIds = sql.join(
    THEMES.map((theme) => sql`${theme.id}`),
    sql`, `,
  );

  // A deleted account must not erase recorded usage; exclude known admin roles when available.
  return sql`
    select ${effectiveThemeId} as "themeId",
      count(distinct ${schema.generations.id}) as "count"
    from ${schema.generations}
    inner join ${schema.images}
      on ${schema.images.generationId} = ${schema.generations.id}
    left join ${userTable}
      on ${userTable.id} = ${schema.generations.userId}
    where ${schema.generations.status} = 'done'
      and ${effectiveThemeId} in (${catalogIds})
      and (',' || replace(lower(coalesce(${userTable.role}, '')), ' ', '') || ',')
        not like '%,admin,%'
    group by ${effectiveThemeId}
    order by count(distinct ${schema.generations.id}) desc, ${effectiveThemeId} asc
    limit ${boundedLimit}
  `;
}

export async function getHomepageThemeRanking(limit = 12): Promise<HomepageThemeRankingRow[]> {
  // Let callers distinguish unavailable data from a successful empty ranking.
  const rows = await db.execute<{ themeId: string; count: number | string }>(
    buildHomepageThemeRankingQuery(limit),
  );
  return rows.map((row) => ({ themeId: row.themeId, count: Number(row.count) }));
}
