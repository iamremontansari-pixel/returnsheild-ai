
import { NextResponse } from "next/server";

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

export async function POST(request: Request) {
  try {
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

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error("OPENAI_API_KEY is missing from the server environment.");

      return NextResponse.json(
        {
          error:
            "AI is not configured. Check OPENAI_API_KEY in Vercel Environment Variables.",
        },
        { status: 503 },
      );
    }

    const aiResponse = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          instructions:
  'Assess possible product return risk cautiously. You do not have historical order outcomes or a validated predictive model. Do not claim a statistically validated probability. COD alone does not prove customer risk. Return only JSON with keys riskLevel ("Low", "Medium", or "High"), reasons (2 or 3 strings), recommendations (2 or 3 strings), and disclaimer (string). Your response must be valid JSON.', 
         input: `Return valid JSON only. Review this order using only the supplied details. Do not assume missing facts.
Product/category: ${product}
Order value: INR ${amount}
Payment: ${payment}
Delivery: ${delivery}`,
          max_output_tokens: 500,
          text: {
  format: { type: "json_object" },
},
        }),
      },
    );

    
    if (!aiResponse.ok) {
  const errorBody = await aiResponse.text();

  let errorMessage = "Unknown OpenAI API error";

  try {
    const parsedError = JSON.parse(errorBody);
    errorMessage =
      parsedError.error?.message || errorMessage;
  } catch {
    errorMessage = errorBody.slice(0, 500) || errorMessage;
  }

  console.error("OpenAI API request failed:", {
    status: aiResponse.status,
    message: errorMessage,
  });

  return NextResponse.json(
    {
      error: "OpenAI request failed.",
      openaiStatus: aiResponse.status,
      details: errorMessage,
    },
    { status: 502 },
  );
} 

    const aiData = await aiResponse.json();

    const outputText =
      typeof aiData.output_text === "string"
        ? aiData.output_text
        : aiData.output
            ?.flatMap(
              (item: {
                content?: Array<{
                  type?: string;
                  text?: string;
                }>;
              }) => item.content ?? [],
            )
            .find(
              (item: { type?: string; text?: string }) =>
                item.type === "output_text",
            )?.text;

    if (!outputText) {
      console.error("OpenAI returned no text output:", {
        status: aiData.status,
        responseId: aiData.id,
      });

      return NextResponse.json(
        { error: "OpenAI returned no usable text. Please try again." },
        { status: 502 },
      );
    }

    let analysis: Analysis;

    try {
      analysis = JSON.parse(outputText) as Analysis;
    } catch {
      console.error("OpenAI output was not valid JSON.");

      return NextResponse.json(
        { error: "OpenAI returned an unreadable result." },
        { status: 502 },
      );
    }

    if (
      !["Low", "Medium", "High"].includes(analysis.riskLevel) ||
      !Array.isArray(analysis.reasons) ||
      !Array.isArray(analysis.recommendations) ||
      typeof analysis.disclaimer !== "string"
    ) {
      console.error("OpenAI output did not match the expected schema.");

      return NextResponse.json(
        { error: "OpenAI returned an invalid analysis result." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      riskLevel: analysis.riskLevel,
      reasons: analysis.reasons.slice(0, 3).map(String),
      recommendations: analysis.recommendations.slice(0, 3).map(String),
      disclaimer: analysis.disclaimer,
    });
  } catch (error) {
    console.error("Analyze-return route failed:", error);

    return NextResponse.json(
      { error: "The server could not process the analysis request." },
      { status: 500 },
    );
  }
}
