import { cents, type Cents } from "./types";

export interface ForecastWeek {
  weekStart: string;
  weekEnd: string;
  expectedInflows: Cents;
  expectedOutflows: Cents;
  netCashFlow: Cents;
  runningBalance: Cents;
}

export interface ForecastScenario {
  label: string;
  weeks: ForecastWeek[];
  totalInflows: Cents;
  totalOutflows: Cents;
  endingBalance: Cents;
}

export interface CashFlowForecast {
  startingBalance: Cents;
  forecastWeeks: number;
  scenarios: {
    best: ForecastScenario;
    expected: ForecastScenario;
    worst: ForecastScenario;
  };
  lowBalanceAlertWeek: number | null;
  lowBalanceThresholdCents: Cents;
}

/**
 * Payment probability weights for each scenario.
 * Based on invoice age and status.
 */
const PAYMENT_PROBABILITIES = {
  best: {
    current: 0.95,
    overdue_1_30: 0.85,
    overdue_31_60: 0.70,
    overdue_61_90: 0.50,
    overdue_90_plus: 0.25,
  },
  expected: {
    current: 0.80,
    overdue_1_30: 0.65,
    overdue_31_60: 0.45,
    overdue_61_90: 0.25,
    overdue_90_plus: 0.10,
  },
  worst: {
    current: 0.60,
    overdue_1_30: 0.40,
    overdue_31_60: 0.20,
    overdue_61_90: 0.10,
    overdue_90_plus: 0.05,
  },
};

interface OutstandingInvoice {
  balanceDueCents: number;
  dueDate: Date;
  status: string;
}

interface PlannedExpense {
  amountCents: number;
  date: Date;
}

/**
 * Get the aging category for probability lookup.
 */
function getAgingCategory(
  dueDate: Date,
  asOf: Date,
): keyof (typeof PAYMENT_PROBABILITIES)["expected"] {
  const daysOverdue = Math.floor(
    (asOf.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (daysOverdue <= 0) return "current";
  if (daysOverdue <= 30) return "overdue_1_30";
  if (daysOverdue <= 60) return "overdue_31_60";
  if (daysOverdue <= 90) return "overdue_61_90";
  return "overdue_90_plus";
}

/**
 * Generate a cash flow forecast with three scenarios.
 *
 * @param startingBalanceCents - Current cash position
 * @param outstandingInvoices - Invoices with outstanding balances
 * @param plannedExpenses - Approved but not-yet-paid expenses
 * @param weeks - Number of weeks to forecast (default 12)
 * @param lowBalanceThresholdCents - Alert when balance drops below this
 */
export function generateCashFlowForecast(params: {
  startingBalanceCents: number;
  outstandingInvoices: OutstandingInvoice[];
  plannedExpenses: PlannedExpense[];
  weeks?: number;
  lowBalanceThresholdCents?: number;
}): CashFlowForecast {
  const {
    startingBalanceCents,
    outstandingInvoices,
    plannedExpenses,
    weeks = 12,
    lowBalanceThresholdCents = 0,
  } = params;

  const now = new Date();

  function buildScenario(
    label: string,
    probabilities: (typeof PAYMENT_PROBABILITIES)["expected"],
    expenseMultiplier: number,
  ): ForecastScenario {
    const forecastWeeks: ForecastWeek[] = [];
    let runningBalance = startingBalanceCents;
    let totalInflows = 0;
    let totalOutflows = 0;

    for (let w = 0; w < weeks; w++) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() + w * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      // Estimate inflows: invoices due this week weighted by probability
      let weekInflows = 0;
      for (const inv of outstandingInvoices) {
        const due = new Date(inv.dueDate);
        if (due >= weekStart && due <= weekEnd) {
          const agingCat = getAgingCategory(due, now);
          const prob = probabilities[agingCat];
          weekInflows += Math.round(inv.balanceDueCents * prob);
        }
      }

      // For weeks beyond invoice due dates, spread remaining expected collections
      if (w > 0) {
        for (const inv of outstandingInvoices) {
          const due = new Date(inv.dueDate);
          if (due < weekStart) {
            // Already past due - spread remaining over forecast period
            const agingCat = getAgingCategory(due, weekStart);
            const prob = probabilities[agingCat];
            const weeklyShare = Math.round(
              (inv.balanceDueCents * prob) / weeks,
            );
            weekInflows += weeklyShare;
          }
        }
      }

      // Estimate outflows: expenses in this week
      let weekOutflows = 0;
      for (const exp of plannedExpenses) {
        const expDate = new Date(exp.date);
        if (expDate >= weekStart && expDate <= weekEnd) {
          weekOutflows += Math.round(exp.amountCents * expenseMultiplier);
        }
      }

      // If no specific expenses scheduled, estimate a baseline weekly burn
      // from historical average (spread total planned evenly)
      if (plannedExpenses.length > 0 && weekOutflows === 0) {
        const totalPlanned = plannedExpenses.reduce(
          (s, e) => s + e.amountCents,
          0,
        );
        const weeklyBurn = Math.round(
          (totalPlanned * expenseMultiplier) / weeks,
        );
        weekOutflows += weeklyBurn;
      }

      const netCashFlow = weekInflows - weekOutflows;
      runningBalance += netCashFlow;
      totalInflows += weekInflows;
      totalOutflows += weekOutflows;

      forecastWeeks.push({
        weekStart: weekStart.toISOString().split("T")[0],
        weekEnd: weekEnd.toISOString().split("T")[0],
        expectedInflows: cents(weekInflows),
        expectedOutflows: cents(weekOutflows),
        netCashFlow: cents(netCashFlow),
        runningBalance: cents(runningBalance),
      });
    }

    return {
      label,
      weeks: forecastWeeks,
      totalInflows: cents(totalInflows),
      totalOutflows: cents(totalOutflows),
      endingBalance: cents(runningBalance),
    };
  }

  const best = buildScenario("Best Case", PAYMENT_PROBABILITIES.best, 0.9);
  const expected = buildScenario("Expected", PAYMENT_PROBABILITIES.expected, 1.0);
  const worst = buildScenario("Worst Case", PAYMENT_PROBABILITIES.worst, 1.15);

  // Detect first week where expected balance drops below threshold
  let lowBalanceAlertWeek: number | null = null;
  for (let i = 0; i < expected.weeks.length; i++) {
    if ((expected.weeks[i].runningBalance as number) < lowBalanceThresholdCents) {
      lowBalanceAlertWeek = i;
      break;
    }
  }

  return {
    startingBalance: cents(startingBalanceCents),
    forecastWeeks: weeks,
    scenarios: { best, expected, worst },
    lowBalanceAlertWeek,
    lowBalanceThresholdCents: cents(lowBalanceThresholdCents),
  };
}
