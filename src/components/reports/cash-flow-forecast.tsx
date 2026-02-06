"use client";

import { useState } from "react";
import { AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { useForecast } from "@/hooks/use-forecast";
import { formatCents, parseDollarsToCents } from "@/lib/financial/budget";
import type { ForecastScenario, ForecastWeek } from "@/lib/financial/forecast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/shared/spinner";
import { cn } from "@/lib/utils";

export function CashFlowForecast() {
  const [weeks, setWeeks] = useState(12);
  const [balanceInput, setBalanceInput] = useState("0");
  const [startingBalance, setStartingBalance] = useState(0);
  const [activeScenario, setActiveScenario] = useState<"best" | "expected" | "worst">("expected");

  const { data, isLoading } = useForecast({ weeks, startingBalance });
  const forecast = data?.forecast;

  function handleBalanceApply() {
    try {
      const val = parseDollarsToCents(balanceInput);
      setStartingBalance(val as number);
    } catch {
      // ignore invalid input
    }
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-end gap-4 flex-wrap">
        <div className="flex items-end gap-2">
          <Input
            label="Starting Cash Balance"
            value={balanceInput}
            onChange={(e) => setBalanceInput(e.target.value)}
            placeholder="e.g., 50000"
            type="text"
            inputMode="decimal"
          />
          <button
            onClick={handleBalanceApply}
            className="px-3 py-2 rounded-lg bg-linen text-sm text-ink hover:bg-stone/10 transition-colors whitespace-nowrap"
          >
            Apply
          </button>
        </div>

        <Select
          label="Forecast Period"
          value={String(weeks)}
          onChange={(e) => setWeeks(parseInt(e.target.value, 10))}
          options={[
            { label: "4 weeks", value: "4" },
            { label: "8 weeks", value: "8" },
            { label: "12 weeks", value: "12" },
            { label: "26 weeks", value: "26" },
          ]}
        />

        <Select
          label="Scenario"
          value={activeScenario}
          onChange={(e) => setActiveScenario(e.target.value as "best" | "expected" | "worst")}
          options={[
            { label: "Best Case", value: "best" },
            { label: "Expected", value: "expected" },
            { label: "Worst Case", value: "worst" },
          ]}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : forecast ? (
        <>
          {/* Low Balance Alert */}
          {forecast.lowBalanceAlertWeek !== null && (
            <div className="flex items-center gap-3 p-4 bg-warning-soft rounded-xl border border-warning/20">
              <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
              <div>
                <p className="text-sm font-medium text-ink">
                  Low Cash Balance Alert
                </p>
                <p className="text-sm text-slate">
                  Expected cash balance drops below threshold in week{" "}
                  {forecast.lowBalanceAlertWeek + 1} (
                  {forecast.scenarios.expected.weeks[forecast.lowBalanceAlertWeek]?.weekStart}
                  ).
                </p>
              </div>
            </div>
          )}

          {/* Scenario Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(["best", "expected", "worst"] as const).map((key) => {
              const scenario = forecast.scenarios[key];
              const ending = scenario.endingBalance as number;
              const starting = forecast.startingBalance as number;
              const trend = ending >= starting;

              return (
                <button
                  key={key}
                  onClick={() => setActiveScenario(key)}
                  className={cn(
                    "rounded-xl p-4 text-left transition-all border-2",
                    activeScenario === key
                      ? "border-terracotta-300 bg-terracotta-50/30"
                      : "border-transparent bg-linen hover:border-stone/20",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-slate">{scenario.label}</p>
                    {trend ? (
                      <TrendingUp className="w-4 h-4 text-success" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-error" />
                    )}
                  </div>
                  <p
                    className={cn(
                      "text-lg font-mono font-semibold mt-1",
                      ending >= 0 ? "text-ink" : "text-error",
                    )}
                  >
                    {formatCents(ending)}
                  </p>
                  <p className="text-[10px] text-stone mt-1">
                    Ending balance after {weeks} weeks
                  </p>
                </button>
              );
            })}
          </div>

          {/* Cash Flow Chart (ASCII bar visualization) */}
          <Card>
            <CardHeader>
              <CardTitle>
                {forecast.scenarios[activeScenario].label} -- Weekly Cash Flow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CashFlowBars
                scenario={forecast.scenarios[activeScenario]}
                startingBalance={forecast.startingBalance as number}
              />
            </CardContent>
          </Card>

          {/* Detail Table */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-stone/10">
                      <th className="text-left text-label text-slate px-3 py-2 font-medium">Week</th>
                      <th className="text-right text-label text-slate px-3 py-2 font-medium">Inflows</th>
                      <th className="text-right text-label text-slate px-3 py-2 font-medium">Outflows</th>
                      <th className="text-right text-label text-slate px-3 py-2 font-medium">Net</th>
                      <th className="text-right text-label text-slate px-3 py-2 font-medium">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forecast.scenarios[activeScenario].weeks.map((week, i) => (
                      <tr
                        key={week.weekStart}
                        className={cn(
                          "border-b border-stone/5",
                          (week.runningBalance as number) < 0 && "bg-error-soft/30",
                        )}
                      >
                        <td className="px-3 py-2 text-sm text-slate">
                          W{i + 1}: {week.weekStart}
                        </td>
                        <td className="px-3 py-2 text-sm text-right font-mono text-success">
                          {(week.expectedInflows as number) > 0
                            ? `+${formatCents(week.expectedInflows as number)}`
                            : "--"}
                        </td>
                        <td className="px-3 py-2 text-sm text-right font-mono text-error">
                          {(week.expectedOutflows as number) > 0
                            ? `-${formatCents(week.expectedOutflows as number)}`
                            : "--"}
                        </td>
                        <td
                          className={cn(
                            "px-3 py-2 text-sm text-right font-mono font-medium",
                            (week.netCashFlow as number) >= 0 ? "text-success" : "text-error",
                          )}
                        >
                          {formatCents(week.netCashFlow as number)}
                        </td>
                        <td
                          className={cn(
                            "px-3 py-2 text-sm text-right font-mono font-medium",
                            (week.runningBalance as number) >= 0 ? "text-ink" : "text-error",
                          )}
                        >
                          {formatCents(week.runningBalance as number)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-stone/10">
                      <td className="px-3 py-2 text-sm font-medium text-ink">Total</td>
                      <td className="px-3 py-2 text-sm text-right font-mono font-medium text-success">
                        +{formatCents(forecast.scenarios[activeScenario].totalInflows as number)}
                      </td>
                      <td className="px-3 py-2 text-sm text-right font-mono font-medium text-error">
                        -{formatCents(forecast.scenarios[activeScenario].totalOutflows as number)}
                      </td>
                      <td colSpan={2} className="px-3 py-2 text-sm text-right font-mono font-medium text-ink">
                        Ending: {formatCents(forecast.scenarios[activeScenario].endingBalance as number)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}

/**
 * Simple horizontal bar chart for weekly cash flow.
 */
function CashFlowBars({
  scenario,
  startingBalance,
}: {
  scenario: ForecastScenario;
  startingBalance: number;
}) {
  // Find the max balance for scaling
  const allBalances = scenario.weeks.map((w) => Math.abs(w.runningBalance as number));
  allBalances.push(Math.abs(startingBalance));
  const maxBalance = Math.max(...allBalances, 1);

  return (
    <div className="space-y-1.5">
      {/* Starting balance */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-stone w-16 shrink-0 text-right">Start</span>
        <div className="flex-1 h-5 bg-stone/5 rounded-full overflow-hidden relative">
          <div
            className="h-full bg-info/40 rounded-full transition-all"
            style={{
              width: `${Math.max(2, (Math.abs(startingBalance) / maxBalance) * 100)}%`,
            }}
          />
        </div>
        <span className="text-xs font-mono text-ink w-24 text-right">
          {formatCents(startingBalance)}
        </span>
      </div>

      {scenario.weeks.map((week, i) => {
        const balance = week.runningBalance as number;
        const isNegative = balance < 0;
        const pct = Math.max(2, (Math.abs(balance) / maxBalance) * 100);

        return (
          <div key={week.weekStart} className="flex items-center gap-3">
            <span className="text-xs text-stone w-16 shrink-0 text-right">
              W{i + 1}
            </span>
            <div className="flex-1 h-5 bg-stone/5 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  isNegative ? "bg-error/40" : "bg-success/40",
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span
              className={cn(
                "text-xs font-mono w-24 text-right",
                isNegative ? "text-error" : "text-ink",
              )}
            >
              {formatCents(balance)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
