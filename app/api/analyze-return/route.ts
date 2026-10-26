
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type OrderInput = {
  product?: string;
  payment?: string;
  amount?: number;
  delivery?: string;
};

type Analysis = {
  riskLevel: "Low" | "Medium" | "High";
  reasons: string[];
  recommendations: string[];
  disclaimer: string;
};

const PRIMARY_MODEL = "gemini-3.8-flash";
const FALLBACK_MODEL = "gemini-3.5-flash-lite";

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    riskLevel: {
      type: "STRING",
      enum: ["Low", "Medium", "High"],
    },
    reasons: {
      type: "ARRAY",
      items: { type: "STRING" },
    },
    recommendations: {
      type: "ARRAY",
      items: { type: "STRING" },
    },
    disclaimer: { type: "STRING" },
  },
  required: [
    "riskLevel",
    "reasons",
    "recommendations",
    "disclaimer",
  ],
};

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

    if (response.ok) {
      return response;
    }

    if (response.status !== 503 || attempt === 2) {
      return response;
    }

    await wait(1000 * (attempt + 1));
  }

  throw new Error("Gemini request retries were exhausted.");
}

async function getAnalysis(apiKey: string, prompt: string) {
  let response = await requestGemini(
    PRIMARY_MODEL,
    apiKey,
    prompt,
  );

  if (response.status === 503) {
    console.warn(
      `${PRIMARY_MODEL} remains overloaded; trying ${FALLBACK_MODEL}.`,
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
      details = errorBody.slice(0, 500) || details;
    }

    console.error("Gemini API request failed:", {
      status: response.status,
      model:
        response.status === 503
          ? FALLBACK_MODEL
          : "primary-or-fallback",
      message: details,
    });

    if (response.status === 429) {
      throw new Error(
        "Gemini rate limit or quota reached. Please try again later.",
      );
    }

    if (response.status === 503) {
      throw new Error(
        "Both Gemini model attempts are temporarily overloaded. Please try again shortly.",
      );
    }

    if (response.status === 401 || response.status === 403) {
      throw new Error(
        "Gemini rejected the API key or access to the selected model. Check the key and model access in Google AI Studio.",
      );
    }

    throw new Error(
      `Gemini API returned status ${response.status}: ${details}`,
    );
  }

  const data = await response.json();

  const outputText =
    data.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text ?? "")
      .join("") ?? "";

  if (!outputText) {
    throw new Error("Gemini returned no usable text.");
  }

  let analysis: Analysis;

  try {
    analysis = JSON.parse(outputText) as Analysis;
  } catch {
    throw new Error("Gemini returned an unreadable result.");
  }

  if (
    !analysis ||
    !["Low", "Medium", "High"].includes(analysis.riskLevel) ||
    !Array.isArray(analysis.reasons) ||
    !analysis.reasons.every(
      (item) =>
        typeof item === "string" && item.trim().length > 0,
    ) ||
    analysis.reasons.length < 2 ||
    !Array.isArray(analysis.recommendations) ||
    !analysis.recommendations.every(
      (item) =>
        typeof item === "string" && item.trim().length > 0,
    ) ||
    analysis.recommendations.length < 2 ||
    typeof analysis.disclaimer !== "string" ||
    !analysis.disclaimer.trim()
  ) {
    throw new Error("Gemini returned an invalid analysis result.");
  }

  return {
    riskLevel: analysis.riskLevel,
    reasons: analysis.reasons.slice(0, 3),
    recommendations: analysis.recommendations.slice(0, 3),
    disclaimer: analysis.disclaimer,
  };
}

export async function POST(request: Request) {
  try {
    // Require a Supabase access token.
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
      console.error("Supabase authentication configuration is missing.");

      return NextResponse.json(
        { error: "Authentication service is not configured." },
        { status: 500 },
      );
    }

    // Verify the token with Supabase; never trust a token without verification.
    const authClient = createClient(supabaseUrl, supabaseKey);
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
      typeof body.product === "string" ? body.product.trim() : "";
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
        {
          error:
            "AI is not configured. Check GEMINI_API_KEY in Vercel.",
        },
        { status: 503 },
      );
    }

    const prompt = `
You are assisting an ecommerce seller with a preliminary order review.

Assess possible return or cancellation concerns using ONLY the details supplied.
This is a qualitative assessment, not a trained or statistically validated prediction.

Rules:
- COD alone does not prove a customer is risky.
- A high order value alone does not prove a customer is risky.
- Do not invent customer history, return rates, or probabilities.
- Consider product-specific concerns only when reasonably relevant.
- Explain uncertainty and avoid presenting assumptions as facts.
- Give practical, respectful recommendations.
- Return 2 or 3 concise reasons and 2 or 3 useful recommendations.
- Do not recommend unfair treatment of customers.
- If information is insufficient, prefer Medium or Low rather than asserting High risk without evidence.

Return JSON with exactly these keys:
- riskLevel: "Low", "Medium", or "High"
- reasons: array of 2 or 3 strings
- recommendations: array of 2 or 3 strings
- disclaimer: string explaining that this is a preliminary assessment, not a validated prediction

Order details:
Product/category: ${product}
Order value: INR ${amount}
Payment: ${payment}
Delivery: ${delivery}
`;

    const analysis = await getAnalysis(apiKey, prompt);

    return NextResponse.json(analysis);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "The server could not process the analysis request.";

    console.error("Analyze-return route failed:", message);

    return NextResponse.json(
      { error: message },
      { status: 502 },
    );
  }
}
