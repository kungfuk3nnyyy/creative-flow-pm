import { describe, it, expect } from "vitest";
import { generateCashFlowForecast } from "./forecast";

describe("generateCashFlowForecast", () => {
  it("produces three scenarios with correct labels", () => {
    const forecast = generateCashFlowForecast({
      startingBalanceCents: 100000,
      outstandingInvoices: [],
      plannedExpenses: [],
      weeks: 4,
    });

    expect(forecast.scenarios.best.label).toBe("Best Case");
    expect(forecast.scenarios.expected.label).toBe("Expected");
    expect(forecast.scenarios.worst.label).toBe("Worst Case");
  });

  it("respects starting balance", () => {
    const forecast = generateCashFlowForecast({
      startingBalanceCents: 500000,
      outstandingInvoices: [],
      plannedExpenses: [],
      weeks: 4,
    });

    expect(forecast.startingBalance).toBe(500000);
  });

  it("generates correct number of weeks", () => {
    const forecast = generateCashFlowForecast({
      startingBalanceCents: 100000,
      outstandingInvoices: [],
      plannedExpenses: [],
      weeks: 8,
    });

    expect(forecast.scenarios.best.weeks).toHaveLength(8);
    expect(forecast.scenarios.expected.weeks).toHaveLength(8);
    expect(forecast.scenarios.worst.weeks).toHaveLength(8);
    expect(forecast.forecastWeeks).toBe(8);
  });

  it("best case ending balance >= expected >= worst", () => {
    const forecast = generateCashFlowForecast({
      startingBalanceCents: 100000,
      outstandingInvoices: [
        {
          balanceDueCents: 50000,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // due in 1 week
          status: "SENT",
        },
      ],
      plannedExpenses: [
        {
          amountCents: 20000,
          date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        },
      ],
      weeks: 4,
    });

    expect(forecast.scenarios.best.endingBalance).toBeGreaterThanOrEqual(
      forecast.scenarios.expected.endingBalance as number,
    );
    expect(forecast.scenarios.expected.endingBalance).toBeGreaterThanOrEqual(
      forecast.scenarios.worst.endingBalance as number,
    );
  });

  it("worst case has higher outflows (expense multiplier 1.15x)", () => {
    const forecast = generateCashFlowForecast({
      startingBalanceCents: 100000,
      outstandingInvoices: [],
      plannedExpenses: [
        {
          amountCents: 10000,
          date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        },
      ],
      weeks: 4,
    });

    // Worst case should have higher total outflows than expected
    expect(forecast.scenarios.worst.totalOutflows).toBeGreaterThanOrEqual(
      forecast.scenarios.expected.totalOutflows as number,
    );
  });

  it("detects low balance alert", () => {
    const forecast = generateCashFlowForecast({
      startingBalanceCents: 1000, // very low starting balance
      outstandingInvoices: [],
      plannedExpenses: [
        {
          amountCents: 50000,
          date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        },
      ],
      weeks: 4,
      lowBalanceThresholdCents: 500,
    });

    // With high expenses and low starting balance, alert should trigger
    expect(forecast.lowBalanceAlertWeek).not.toBeNull();
  });

  it("no low balance alert when balance stays healthy", () => {
    const forecast = generateCashFlowForecast({
      startingBalanceCents: 10000000, // $100k
      outstandingInvoices: [],
      plannedExpenses: [],
      weeks: 4,
      lowBalanceThresholdCents: 0,
    });

    expect(forecast.lowBalanceAlertWeek).toBeNull();
  });

  it("week data includes all required fields", () => {
    const forecast = generateCashFlowForecast({
      startingBalanceCents: 100000,
      outstandingInvoices: [],
      plannedExpenses: [],
      weeks: 2,
    });

    const week = forecast.scenarios.expected.weeks[0];
    expect(week).toHaveProperty("weekStart");
    expect(week).toHaveProperty("weekEnd");
    expect(week).toHaveProperty("expectedInflows");
    expect(week).toHaveProperty("expectedOutflows");
    expect(week).toHaveProperty("netCashFlow");
    expect(week).toHaveProperty("runningBalance");
  });

  it("running balance is cumulative", () => {
    const forecast = generateCashFlowForecast({
      startingBalanceCents: 100000,
      outstandingInvoices: [],
      plannedExpenses: [],
      weeks: 4,
    });

    const weeks = forecast.scenarios.expected.weeks;
    // Each week's running balance should reflect cumulative changes
    for (let i = 0; i < weeks.length; i++) {
      const prevBalance =
        i === 0 ? 100000 : (weeks[i - 1].runningBalance as number);
      const expectedBalance =
        prevBalance +
        (weeks[i].expectedInflows as number) -
        (weeks[i].expectedOutflows as number);
      expect(weeks[i].runningBalance).toBe(expectedBalance);
    }
  });

  it("total inflows = sum of weekly inflows", () => {
    const forecast = generateCashFlowForecast({
      startingBalanceCents: 100000,
      outstandingInvoices: [
        {
          balanceDueCents: 30000,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          status: "SENT",
        },
      ],
      plannedExpenses: [],
      weeks: 4,
    });

    for (const key of ["best", "expected", "worst"] as const) {
      const scenario = forecast.scenarios[key];
      const weeklySum = scenario.weeks.reduce(
        (s, w) => s + (w.expectedInflows as number),
        0,
      );
      expect(scenario.totalInflows).toBe(weeklySum);
    }
  });
});
