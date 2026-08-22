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
const COMPACT_USD_FORMAT = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

export default function TrendChart({
  title,
  points,
  color,
  dark = false,
  valueFormat = "number",
}: {
  title: string;
  points: TrendChartPoint[];
  color: "coral" | "sage" | "butter";
  dark?: boolean;
  valueFormat?: "number" | "currency";
}) {
  const colors = {
    coral: { line: "var(--color-coral)", fill: "var(--color-coral-soft)" },
    sage: { line: "var(--color-sage-deep)", fill: "var(--color-sage-soft)" },
    butter: { line: "#b98524", fill: "var(--color-butter-soft)" },
  }[color];
  const gridColor = dark ? "var(--color-line-dark)" : "var(--color-line)";
  const labelColor = dark ? "var(--color-plum-soft)" : "var(--color-ink-muted)";
  const formatValue = valueFormat === "currency" ? formatCompactMoney : formatNumber;
  const metricName = valueFormat === "currency" ? "Sales" : "Signups";

  return (
    <div className="mt-5 h-[230px] w-full" role="img" aria-label={title}>
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
            width={46}
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

function formatCompactMoney(cents: number) {
  return COMPACT_USD_FORMAT.format(cents / 100);
}
