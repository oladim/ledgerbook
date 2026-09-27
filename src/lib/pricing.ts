// Plan pricing. Annual gets a discount (Basic 10%, Pro 15%). Amounts in Naira.
export const PRICING = {
  basic: { month: 2000, year: Math.round(2000 * 12 * 0.9), label: "Basic" },
  pro: { month: 5000, year: Math.round(5000 * 12 * 0.85), label: "Pro" },
} as const;
export type PlanKey = keyof typeof PRICING;
