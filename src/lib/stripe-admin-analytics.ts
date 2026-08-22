export type StripeSalesPoint = {
  key: string;
  label: string;
  value: number;
};

export type StripeSalesAnalytics =
  | {
      available: true;
      mode: "live" | "test";
      currency: "USD";
      weekly: StripeSalesPoint[];
      totals: {
        grossCents: number;
        refundsCents: number;
        netSalesCents: number;
        feesCents: number;
        netAfterFeesCents: number;
        salesCount: number;
      };
      thisWeekCents: number;
      previousWeekCents: number;
      thisMonthCents: number;
      previousMonthCents: number;
    }
  | {
      available: false;
      message: string;
    };

type SalesAccumulator = {
  grossCents: number;
  refundsCents: number;
  netSalesCents: number;
  feesCents: number;
  netAfterFeesCents: number;
  salesCount: number;
};

export async function getStripeSalesAnalytics(now = new Date()): Promise<StripeSalesAnalytics> {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return { available: false, message: "Add STRIPE_SECRET_KEY to connect sales data." };
  }

  const weeks = buildWeekPeriods(now, 12);
  const firstWeekStart = weeks[0].start;
  const previousMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const queryStart = new Date(Math.min(firstWeekStart.getTime(), previousMonthStart.getTime()));

  try {
    const { stripe } = await import("@/lib/stripe");
    const transactions = await stripe.balanceTransactions
      .list({
        created: { gte: Math.floor(queryStart.getTime() / 1000) },
        currency: "usd",
        limit: 100,
      })
      .autoPagingToArray({ limit: 10_000 });

    const salesTransactions = transactions.filter(
      (transaction) =>
        transaction.reporting_category === "charge" || transaction.reporting_category === "refund",
    );
    const totals = accumulate(salesTransactions);
    const weekly = weeks.map((period) => ({
      key: period.key,
      label: period.start.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }),
      value: accumulate(
        salesTransactions.filter((transaction) => {
          const created = transaction.created * 1000;
          return created >= period.start.getTime() && created < period.end.getTime();
        }),
      ).netSalesCents,
    }));

    const currentWeek = weeks.at(-1)!;
    const previousWeek = weeks.at(-2)!;
    const currentMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const nextMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

    return {
      available: true,
      mode: secretKey.includes("_live_") ? "live" : "test",
      currency: "USD",
      weekly,
      totals,
      thisWeekCents: periodNetSales(salesTransactions, currentWeek.start, currentWeek.end),
      previousWeekCents: periodNetSales(salesTransactions, previousWeek.start, previousWeek.end),
      thisMonthCents: periodNetSales(salesTransactions, currentMonthStart, nextMonthStart),
      previousMonthCents: periodNetSales(salesTransactions, previousMonthStart, currentMonthStart),
    };
  } catch (error) {
    console.error("Stripe admin analytics failed", error);
    return {
      available: false,
      message: "Stripe sales are temporarily unavailable. Try again shortly.",
    };
  }
}

function accumulate(
  transactions: Array<{
    amount: number;
    fee: number;
    net: number;
    reporting_category: string;
  }>,
): SalesAccumulator {
  const result: SalesAccumulator = {
    grossCents: 0,
    refundsCents: 0,
    netSalesCents: 0,
    feesCents: 0,
    netAfterFeesCents: 0,
    salesCount: 0,
  };

  for (const transaction of transactions) {
    if (transaction.reporting_category === "charge") {
      result.grossCents += transaction.amount;
      result.salesCount += 1;
    } else if (transaction.reporting_category === "refund") {
      result.refundsCents += Math.abs(transaction.amount);
    }
    result.feesCents += transaction.fee;
    result.netAfterFeesCents += transaction.net;
  }
  result.netSalesCents = result.grossCents - result.refundsCents;
  return result;
}

function periodNetSales(
  transactions: Array<{
    amount: number;
    fee: number;
    net: number;
    reporting_category: string;
    created: number;
  }>,
  start: Date,
  end: Date,
) {
  return accumulate(
    transactions.filter((transaction) => {
      const created = transaction.created * 1000;
      return created >= start.getTime() && created < end.getTime();
    }),
  ).netSalesCents;
}

function buildWeekPeriods(now: Date, count: number) {
  const current = startOfUtcWeek(now);
  return Array.from({ length: count }, (_, index) => {
    const start = new Date(current);
    start.setUTCDate(start.getUTCDate() - (count - index - 1) * 7);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 7);
    return { key: start.toISOString().slice(0, 10), start, end };
  });
}

function startOfUtcWeek(date: Date) {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  start.setUTCDate(start.getUTCDate() - ((start.getUTCDay() + 6) % 7));
  return start;
}
