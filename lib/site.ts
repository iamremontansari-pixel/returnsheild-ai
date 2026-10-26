export const navLinks = [
  { href: "/features", label: "Features" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
] as const;

export const plans = [
  {
    name: "Starter",
    price: "[YOUR PRICE]",
    blurb: "For small sellers who want clear visibility into orders and returns.",
    features: ["Order and return import", "Return-cost analytics", "Product return rates", "Email support"],
    highlighted: false,
  },
  {
    name: "Growth",
    price: "[YOUR PRICE]",
    blurb: "For growing brands that want risk flags and recommended actions.",
    features: ["Everything in Starter", "Order risk flags with reasons", "AI recommendations with approval", "Delivery follow-up alerts"],
    highlighted: true,
  },
  {
    name: "Pro",
    price: "[YOUR PRICE]",
    blurb: "For high-volume sellers who need deeper analysis and support.",
    features: ["Everything in Growth", "Anomaly detection", "Team access and audit history", "Priority support"],
    highlighted: false,
  },
] as const;

export const faqs = [
  {
    q: "Does ReturnShield AI work with Amazon or Flipkart?",
    a: "Marketplace integrations are planned for eligible sellers. None are active yet. Today you can upload order data.",
  },
  {
    q: "Will it block or penalise my customers?",
    a: "No. It flags orders for your review and suggests actions. Customers keep their return rights, and no one is labelled fraudulent without evidence.",
  },
  {
    q: "How accurate are the predictions?",
    a: "Accuracy depends on how much labelled order history you have. We report measured results from your own data and never promise a specific reduction in returns.",
  },
  {
    q: "What customer data do you use?",
    a: "Only what is needed to estimate risk, such as payment method, address completeness and product history. We do not use sensitive personal attributes.",
  },
  {
    q: "Are the prices final?",
    a: "No. All plans shown are proposed pricing until validated with early users.",
  },
] as const;
