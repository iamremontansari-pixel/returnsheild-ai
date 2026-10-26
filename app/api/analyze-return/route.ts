
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type OrderInput = {
  product?: string;
  payment?: string;
  amount?: number;
  delivery?: string;
};

type RiskLevel = "Low" | "Medium" | "High";

type GeminiAnalysis = {
  executiveSummary: string;
  reasons: string[];
  recommendations: string[];
  dataGaps: string[];
  confidence: "Low" | "Moderate";
  actionPriority: "Routine" | "Review" | "Urgent review";
  disclaimer: string;
};

type RiskFactor = {
  name: string;
  points: number;
  explanation: string;
  evidence: string;
};

type Analysis = {
  riskLevel: RiskLevel;
  riskScore: number;
  scoreType: string;
  scoreDrivers: RiskFactor[];
  executiveSummary: string;
  reasons: string[];
  recommendations: string[];
  dataGaps: string[];
  confidence: "Low" | "Moderate";
  actionPriority: "Routine" | "Review" | "Urgent review";
  financialExposure: {
    orderValueINR: number;
    maximumOrderValueAtRiskINR: number;
    estimatedLossINR: null;
    note: string;
  };
  disclaimer: string;
};

const PRIMARY_MODEL = "gemini-3.8-flash";
const FALLBACK_MODEL = "gemini-3.5-flash-lite";

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    executiveSummary: { type: "STRING" },
    reasons: {
      type: "ARRAY",
      items: { type: "STRING" },
    },
    recommendations: {
      type: "ARRAY",
      items: { type: "STRING" },
    },
    dataGaps: {
      type: "ARRAY",
      items: { type: "STRING" },
    },
    confidence: {
      type: "STRING",
      enum: ["Low", "Moderate"],
    },
    actionPriority: {
      type: "STRING",
      enum: ["Routine", "Review", "Urgent review"],
    },
    disclaimer: { type: "STRING" },
  },
  required: [
    "executiveSummary",
    "reasons",
    "recommendations",
    "dataGaps",
    "confidence",
    "actionPriority",
    "disclaimer",
  ],
};

const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function cleanStringArray(
  value: unknown,
  min: number,
  max: number,
): string[] {
  if (
    !Array.isArray(value) ||
    !value.every(
      (item) =>
        typeof item === "string" &&
        item.trim().length > 0 &&
        item.length <= 600,
    )
  ) {
    throw new Error("Gemini returned invalid report sections.");
  }

  const result = value
    .map((item: string) => item.trim())
    .slice(0, max);

  if (result.length < min) {
    throw new Error("Gemini returned incomplete report sections.");
  }

  return result;
}

async function requestGemini(
  model: string,
  apiKey: string,
  prompt: string,
) {
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const payload = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
      temperature: 0.2,
    },
  };

  for (let attempt = 0; attempt < 3; attempt++) {
    let response: Response;

    try {
      response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify(payload),
        cache: "no-store",
        signal: AbortSignal.timeout(20000),
      });
    } catch (error) {
      if (attempt < 2) {
        await wait(1000 * (attempt + 1));
        continue;
      }

      throw error;
    }

    if (response.ok) return response;

    if (
      response.status !== 503 &&
      response.status !== 429
    ) {
      return response;
    }

    if (attempt < 2) {
      await wait(1000 * (attempt + 1));
    }
  }

  throw new Error(
    "Gemini is temporarily unavailable. Please try again shortly.",
  );
}

async function getGeminiReport(
  apiKey: string,
  prompt: string,
): Promise<GeminiAnalysis> {
  let response = await requestGemini(
    PRIMARY_MODEL,
    apiKey,
    prompt,
  );

  if (response.status === 503) {
    console.warn(
      `${PRIMARY_MODEL} is overloaded; trying ${FALLBACK_MODEL}.`,
    );

    response = await requestGemini(
      FALLBACK_MODEL,
      apiKey,
      prompt,
    );
  }

  if (!response.ok) {
    const errorBody = await response.text();
    let details = "Unknown Gemini API error";

    try {
      const parsed = JSON.parse(errorBody);
      details = parsed.error?.message || details;
    } catch {
      details = errorBody.slice(0, 300) || details;
    }

    console.error("Gemini API request failed:", {
      status: response.status,
      message: details,
    });

    if (response.status === 429) {
      throw new Error(
        "Gemini quota or rate limit reached. Please try again later.",
      );
    }

    if (response.status === 503) {
      throw new Error(
        "Both Gemini models are temporarily overloaded. Please try again shortly.",
      );
    }

    if (
      response.status === 401 ||
      response.status === 403
    ) {
      throw new Error(
        "Gemini rejected the API key or model access.",
      );
    }

    throw new Error(
      `Gemini API returned status ${response.status}.`,
    );
  }

  const data = await response.json();

  const outputText =
    data.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text ?? "")
      .join("") ?? "";

  if (!outputText) {
    throw new Error("Gemini returned no usable report.");
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(outputText);
  } catch {
    throw new Error("Gemini returned unreadable JSON.");
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Gemini returned an invalid report.");
  }

  const report = parsed as Record<string, unknown>;

  if (
    typeof report.executiveSummary !== "string" ||
    report.executiveSummary.trim().length < 20 ||
    report.executiveSummary.length > 1200 ||
    !["Low", "Moderate"].includes(
      String(report.confidence),
    ) ||
    !["Routine", "Review", "Urgent review"].includes(
      String(report.actionPriority),
    ) ||
    typeof report.disclaimer !== "string" ||
    !report.disclaimer.trim() ||
    report.disclaimer.length > 500
  ) {
    throw new Error("Gemini returned an invalid report structure.");
  }

  return {
    executiveSummary: report.executiveSummary.trim(),
    reasons: cleanStringArray(report.reasons, 2, 5),
    recommendations: cleanStringArray(
      report.recommendations,
      2,
      5,
    ),
    dataGaps: cleanStringArray(report.dataGaps, 1, 5),
    confidence: report.confidence as "Low" | "Moderate",
    actionPriority: report.actionPriority as
      | "Routine"
      | "Review"
      | "Urgent review",
    disclaimer: report.disclaimer.trim(),
  };
}

function buildRiskScore(payment: string): {
  riskScore: number;
  riskLevel: RiskLevel;
  scoreDrivers: RiskFactor[];
} {
  // Transparent, provisional review heuristic — not a trained model.
  // COD adds a small operational verification flag, not proof of risk.
  const baseScore = 25;

  const scoreDrivers: RiskFactor[] = [
    {
      name: "Baseline review score",
      points: baseScore,
      explanation:
        "A neutral starting point used to organize a preliminary review.",
      evidence:
        "No customer history or validated predictive features were supplied.",
    },
  ];

  if (payment === "COD") {
    scoreDrivers.push({
      name: "Cash-on-delivery verification",
      points: 10,
      explanation:
        "COD may require payment and delivery confirmation before dispatch.",
      evidence:
        "The supplied payment method is COD. This alone does not establish that a customer will return an order.",
    });
  } else {
    scoreDrivers.push({
      name: "Prepaid order",
      points: 0,
      explanation:
        "Prepayment removes the need to collect payment at delivery, but does not rule out returns.",
      evidence: "The supplied payment method is Prepaid.",
    });
  }

  const riskScore = clamp(
    scoreDrivers.reduce((total, factor) => total + factor.points, 0),
    0,
    100,
  );

  // Thresholds are provisional operational bands, not calibrated probabilities.
  const riskLevel: RiskLevel =
    riskScore >= 60
      ? "High"
      : riskScore >= 35
        ? "Medium"
        : "Low";

  return { riskScore, riskLevel, scoreDrivers };
}

export async function POST(request: Request) {
  try {
    // Preserve Supabase authentication.
    const authHeader = request.headers.get("Authorization");
    const accessToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Please log in to analyze orders." },
        { status: 401 },
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error(
        "Supabase authentication configuration is missing.",
      );

      return NextResponse.json(
        { error: "Authentication service is not configured." },
        { status: 500 },
      );
    }

    const authClient = createClient(
      supabaseUrl,
      supabaseKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      },
    );

    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json(
        {
          error:
            "Your session is invalid or expired. Please log in again.",
        },
        { status: 401 },
      );
    }

    let body: OrderInput;

    try {
      body = (await request.json()) as OrderInput;
    } catch {
      return NextResponse.json(
        { error: "Request body must be valid JSON." },
        { status: 400 },
      );
    }

    const product =
      typeof body.product === "string"
        ? body.product.trim()
        : "";
    const payment = body.payment;
    const amount = Number(body.amount);
    const delivery = body.delivery;

    if (
      !product ||
      product.length > 120 ||
      !Number.isFinite(amount) ||
      amount < 1 ||
      amount > 10000000 ||
      !["COD", "Prepaid"].includes(payment ?? "") ||
      !["Standard", "Express"].includes(delivery ?? "")
    ) {
      return NextResponse.json(
        { error: "Please provide valid order details." },
        { status: 400 },
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("GEMINI_API_KEY is missing.");

      return NextResponse.json(
        { error: "AI analysis is not configured." },
        { status: 503 },
      );
    }

    const prompt = `
ROLE
You are ReturnShield Intelligence, an ecommerce order-review analyst.
Write a concise, professional report inspired by institutional risk terminals.

OBJECTIVE
Help a seller decide what to verify before dispatch. Analyze only the supplied
order information. Do not pretend to have access to customer databases,
market feeds, transaction history, or external research.

ORDER
Product/category: ${product}
Order value: INR ${amount.toFixed(2)}
Payment method: ${payment}
Delivery speed: ${delivery}

ANALYTICAL RULES
1. Separate observed facts from hypotheses. State what evidence supports each claim.
2. COD is a modest operational consideration, not proof of fraud or a future return.
3. A high order value is not evidence of risk by itself.
4. Express delivery is not inherently risky.
5. Do not infer customer identity, intent, income, location, demographics, or history.
6. Do not invent percentages, historical return rates, financial losses, benchmarks,
   statistical significance, or customer behavior.
7. The supplied information is insufficient to validate the probability of a return.
8. Explain the main limitations specifically. If customer history, product return
   history, address validation, or confirmation status is unavailable, identify
   relevant missing information in dataGaps.
9. Make recommendations practical, proportional, lawful, and respectful.
   Do not recommend rejecting or penalizing customers solely for COD.
10. Do not repeat the same generic disclaimer in every report section.

OUTPUT REQUIREMENTS
- executiveSummary: 2-4 sentences. State the current review assessment, the strongest
  evidence, and the most important limitation. Be specific to this order.
- reasons: 2-5 concise evidence-linked findings. Distinguish observed facts from
  possible operational implications.
- recommendations: 2-5 prioritized, concrete seller actions.
- dataGaps: 1-5 missing data points that would materially improve assessment.
- confidence: use Low when the supplied details are insufficient to assess actual
  return likelihood. Use Moderate only for a well-supported operational assessment,
  never for a statistically validated return prediction.
- actionPriority: Routine for ordinary checks, Review for additional verification,
  Urgent review only when supplied evidence identifies an immediate operational issue.
  Do not use Urgent review merely because the payment is COD.
- disclaimer: one short sentence stating that this is a preliminary assessment and
  not a statistically validated return prediction.

STYLE
Institutional, analytical, precise, direct. No hype, no fake precision, no filler.
Return only JSON matching the supplied schema.
`;

    const report = await getGeminiReport(apiKey, prompt);
    const scoring = buildRiskScore(payment as string);

    const financialExposure = {
      orderValueINR: amount,
      // This is the order's gross value, not an estimated loss.
      maximumOrderValueAtRiskINR: amount,
      estimatedLossINR: null,
      note:
        "Gross order value only. Actual financial loss cannot be estimated without product cost, shipping, reverse-logistics, recovery, and historical return data.",
    };

    const analysis: Analysis = {
      ...scoring,
      scoreType: "Provisional operational review score — not a return probability",
      executiveSummary: report.executiveSummary,
      reasons: report.reasons,
      recommendations: report.recommendations,
      dataGaps: report.dataGaps,
      confidence: report.confidence,
      actionPriority: report.actionPriority,
      financialExposure,
      disclaimer:
        "This is a preliminary, rule-based operational review supplemented by AI analysis. The score is not a statistically validated prediction of return or cancellation.",
    };

    return NextResponse.json(analysis, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "The server could not process the analysis request.";

    console.error("Analyze-return route failed:", message);

    const isTemporary =
      /temporarily unavailable|overloaded|quota|rate limit/i.test(
        message,
      );

    return NextResponse.json(
      {
        error: isTemporary
          ? message
          : "Unable to complete the analysis. Please try again.",
      },
      { status: isTemporary ? 503 : 502 },
    );
  }
}
