"use client";

import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Bot, DollarSign } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/plans";

type RoiChartPoint = {
  label: string;
  spend: number;
  projectedReturn: number;
  roi: number;
};

type SwarmPerformancePoint = {
  label: string;
  qualified: number;
  rejected: number;
  efficiency: number;
};

function formatCompactCurrency(value: number) {
  if (value >= 1000) {
    return `$${Math.round(value / 1000)}k`;
  }

  return `$${Math.round(value)}`;
}

function normalizeTooltipValue(value: number | string | readonly (number | string)[] | undefined) {
  if (Array.isArray(value)) {
    return normalizeTooltipValue(value[0]);
  }

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

export function PerformanceCharts({
  roiData,
  swarmPerformanceData,
  brandColor,
  revenueLabel,
  usesAttributedRevenue,
}: {
  roiData: RoiChartPoint[];
  swarmPerformanceData: SwarmPerformancePoint[];
  brandColor: string;
  revenueLabel: string;
  usesAttributedRevenue: boolean;
}) {
  const latestRoiPoint = roiData[roiData.length - 1] ?? null;
  const latestPerformancePoint = swarmPerformanceData[swarmPerformanceData.length - 1] ?? null;

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card className="border-slate-200/70 bg-white/78 shadow-lg backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-950 dark:text-white">
            <DollarSign className="h-4 w-4 text-[#5ab5e7]" />
            ROI Curve
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            {usesAttributedRevenue
              ? "Attributed revenue versus plan spend, based on recorded closed-won outcomes."
              : "Projected return versus plan spend, modeled from lead fit score and pipeline stage progression."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={roiData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="roi-return-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={brandColor} stopOpacity={0.28} />
                    <stop offset="95%" stopColor={brandColor} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="rgba(100,116,139,0.16)" strokeDasharray="4 4" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis
                  yAxisId="money"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  tickFormatter={formatCompactCurrency}
                />
                <YAxis
                  yAxisId="roi"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  tickFormatter={(value: number) => `${Math.round(value)}%`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 16,
                    border: "1px solid rgba(148,163,184,0.18)",
                    background: "rgba(15,23,42,0.94)",
                    color: "#e2e8f0",
                    boxShadow: "0 18px 42px rgba(15,23,42,0.28)",
                  }}
                  formatter={(value, name) => {
                    const numericValue = normalizeTooltipValue(value);
                    const seriesName = String(name);

                    if (seriesName === "roi") {
                      return [`${Math.round(numericValue)}%`, "ROI"];
                    }

                    return [formatCurrency(numericValue), seriesName === "projectedReturn" ? revenueLabel : "Plan Spend"];
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar yAxisId="money" dataKey="spend" name="Plan Spend" fill="#0f172a" radius={[10, 10, 0, 0]} barSize={18} />
                <Area
                  yAxisId="money"
                  type="monotone"
                  dataKey="projectedReturn"
                  name={revenueLabel}
                  stroke={brandColor}
                  fill="url(#roi-return-fill)"
                  strokeWidth={2.5}
                />
                <Line
                  yAxisId="roi"
                  type="monotone"
                  dataKey="roi"
                  name="ROI"
                  stroke="#5ab5e7"
                  strokeWidth={2}
                  dot={{ r: 3, strokeWidth: 0, fill: "#5ab5e7" }}
                  activeDot={{ r: 5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {latestRoiPoint ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-slate-950/70">
                <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500">Latest Spend</div>
                <div className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{formatCurrency(latestRoiPoint.spend)}</div>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-slate-950/70">
                <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500">{revenueLabel}</div>
                <div className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{formatCurrency(latestRoiPoint.projectedReturn)}</div>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-slate-950/70">
                <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500">ROI</div>
                <div className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{Math.round(latestRoiPoint.roi)}%</div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-slate-200/70 bg-white/78 shadow-lg backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-950 dark:text-white">
            <Bot className="h-4 w-4 text-[#5ab5e7]" />
            Swarm Performance
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Recent pipeline runs showing qualified lead output, rejected noise, and source efficiency.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {swarmPerformanceData.length === 0 ? (
            <div className="flex h-72 items-center justify-center rounded-2xl border border-dashed border-slate-200/80 bg-slate-50/80 text-center text-sm text-slate-500 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-400">
              Run the pipeline once to unlock swarm-performance charts.
            </div>
          ) : (
            <>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={swarmPerformanceData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="rgba(100,116,139,0.16)" strokeDasharray="4 4" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                    <YAxis
                      yAxisId="efficiency"
                      orientation="right"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      tickFormatter={(value: number) => `${Math.round(value)}%`}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 16,
                        border: "1px solid rgba(148,163,184,0.18)",
                        background: "rgba(15,23,42,0.94)",
                        color: "#e2e8f0",
                        boxShadow: "0 18px 42px rgba(15,23,42,0.28)",
                      }}
                      formatter={(value, name) => {
                        const numericValue = normalizeTooltipValue(value);
                        const seriesName = String(name);

                        if (seriesName === "efficiency") {
                          return [`${Math.round(numericValue)}%`, "Efficiency"];
                        }

                        return [numericValue, seriesName === "qualified" ? "Qualified Leads" : "Rejected Noise"];
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="qualified" name="Qualified Leads" fill={brandColor} radius={[10, 10, 0, 0]} barSize={18} />
                    <Bar dataKey="rejected" name="Rejected Noise" fill="#f97316" radius={[10, 10, 0, 0]} barSize={18} />
                    <Line
                      yAxisId="efficiency"
                      type="monotone"
                      dataKey="efficiency"
                      name="Efficiency"
                      stroke="#5ab5e7"
                      strokeWidth={2}
                      dot={{ r: 3, strokeWidth: 0, fill: "#5ab5e7" }}
                      activeDot={{ r: 5 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {latestPerformancePoint ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-slate-950/70">
                    <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500">Latest Qualified</div>
                    <div className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{latestPerformancePoint.qualified}</div>
                  </div>
                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-slate-950/70">
                    <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500">Noise Rejected</div>
                    <div className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{latestPerformancePoint.rejected}</div>
                  </div>
                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-slate-950/70">
                    <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500">Efficiency</div>
                    <div className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{Math.round(latestPerformancePoint.efficiency)}%</div>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}