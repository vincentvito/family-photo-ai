"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type TrendChartPoint = {
  key: string;
  label: string;
  value: number;
};

const NUMBER_FORMAT = new Intl.NumberFormat("en-US");
const COMPACT_CURRENCY_FORMATTERS = new Map<string, Intl.NumberFormat>();

export default function TrendChart({
  title,
  points,
  color,
  dark = false,
  valueFormat = "number",
  currency = "USD",
}: {
  title: string;
  points: TrendChartPoint[];
  color: "coral" | "sage" | "butter";
  dark?: boolean;
  valueFormat?: "number" | "currency";
  currency?: string;
}) {
  const colors = {
    coral: { line: "var(--color-coral)", fill: "var(--color-coral-soft)" },
    sage: { line: "var(--color-sage-deep)", fill: "var(--color-sage-soft)" },
    butter: { line: "#b98524", fill: "var(--color-butter-soft)" },
  }[color];
  const gridColor = dark ? "var(--color-line-dark)" : "var(--color-line)";
  const labelColor = dark ? "var(--color-plum-soft)" : "var(--color-ink-muted)";
  const formatValue =
    valueFormat === "currency"
      ? (value: number) => formatCompactMoney(value, currency)
      : formatNumber;
  const metricName = valueFormat === "currency" ? "Sales" : "Signups";

  return (
    <div className="mt-3 h-[190px] w-full" role="img" aria-label={title}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={points}
          margin={{ top: 12, right: 8, bottom: 4, left: 0 }}
          accessibilityLayer
        >
          <CartesianGrid vertical={false} stroke={gridColor} strokeDasharray="3 5" />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            interval={1}
            padding={{ left: 8, right: 8 }}
            tick={{ fill: labelColor, fontSize: 11 }}
            tickMargin={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: labelColor, fontSize: 11 }}
            tickFormatter={formatValue}
            width={valueFormat === "currency" ? 68 : 46}
          />
          <Tooltip
            cursor={{ stroke: gridColor, strokeDasharray: "3 5" }}
            formatter={(value) => [formatValue(Number(value)), metricName]}
            contentStyle={{
              background: dark ? "var(--color-bg-dark)" : "var(--color-bg-elevated)",
              border: `1px solid ${gridColor}`,
              borderRadius: 12,
              boxShadow: "var(--shadow-md)",
              color: dark ? "var(--color-bg)" : "var(--color-ink)",
              fontSize: 12,
            }}
            labelStyle={{ color: labelColor, marginBottom: 4 }}
            itemStyle={{ color: colors.line, fontWeight: 600 }}
          />
          <Area
            type="linear"
            dataKey="value"
            name={metricName}
            stroke={colors.line}
            strokeWidth={3}
            fill={colors.fill}
            fillOpacity={0.55}
            dot={{ r: 3, fill: colors.line, strokeWidth: 0 }}
            activeDot={{ r: 5, strokeWidth: 0 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
      <ul className="sr-only">
        {points.map((point) => (
          <li key={point.key}>{`${point.label}: ${formatValue(point.value)}`}</li>
        ))}
      </ul>
    </div>
  );
}

function formatNumber(value: number) {
  return NUMBER_FORMAT.format(value);
}

function formatCompactMoney(cents: number, currency: string) {
  const normalizedCurrency = currency.toUpperCase();
  let formatter = COMPACT_CURRENCY_FORMATTERS.get(normalizedCurrency);
  if (!formatter) {
    formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: normalizedCurrency,
      notation: "compact",
      maximumFractionDigits: 1,
    });
    COMPACT_CURRENCY_FORMATTERS.set(normalizedCurrency, formatter);
  }
  return formatter.format(cents / 100);
}
