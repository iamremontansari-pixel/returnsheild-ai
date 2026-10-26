// Fictional, deterministic sample data. Not real customers.
// Replace this module with calls to the backend API when it exists.

export type PaymentMethod = "COD" | "Prepaid";
export type RiskLevel = "Low" | "Medium" | "High";

export interface SampleOrder {
  id: string;
  product: string;
  value: number;
  payment: PaymentMethod;
  score: number;
  risk: RiskLevel;
  reason: string;
  action: string;
  rto: boolean; // historical outcome in the sample set
}

const products = ["Linen kurta", "Canvas sneakers", "Steel bottle", "Denim jacket", "Wireless earbuds", "Cotton bedsheet"];

function riskFor(score: number): RiskLevel {
  if (score >= 66) return "High";
  if (score >= 36) return "Medium";
  return "Low";
}

export const sampleOrders: SampleOrder[] = Array.from({ length: 36 }, (_, i) => {
  const payment: PaymentMethod = i % 3 === 0 ? "COD" : "Prepaid";
  const score = (i * 37 + (payment === "COD" ? 25 : 0)) % 100;
  const risk = riskFor(score);
  const reason =
    risk === "Low"
      ? "No notable risk factors"
      : payment === "COD"
        ? "COD order with no confirmation recorded"
        : i % 2 === 0
          ? "Address details look incomplete"
          : "Product has an elevated return rate";
  const action =
    risk === "Low"
      ? "No action needed"
      : payment === "COD"
        ? "Send a confirmation message"
        : i % 2 === 0
          ? "Ask the customer to verify the address"
          : "Check size guide and listing";
  return {
    id: `SAMPLE-${1001 + i}`,
    product: products[i % products.length],
    value: 499 + ((i * 173) % 3200),
    payment,
    score,
    risk,
    reason,
    action,
    rto: risk === "High" && i % 2 === 0,
  };
});

export const weeklyOrders = [
  { week: "W1", orders: 310, flagged: 41 },
  { week: "W2", orders: 345, flagged: 52 },
  { week: "W3", orders: 298, flagged: 38 },
  { week: "W4", orders: 372, flagged: 61 },
  { week: "W5", orders: 401, flagged: 57 },
  { week: "W6", orders: 388, flagged: 49 },
];
