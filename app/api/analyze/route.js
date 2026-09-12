import { createWorker } from "tesseract.js";

export const runtime = "nodejs";
export const maxDuration = 60;

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function deterministicScore(n, type) {
  const protein = Number(n.protein_g || 0);
  const fiber = Number(n.fiber_g || 0);
  const sugar = Number(n.sugar_g || 0);
  const sat = Number(n.saturated_fat_g || 0);
  const sodium = Number(n.sodium_mg || 0);
  const calories = Number(n.calories || 0);

  let s = 7.0;

  s += Math.min(fiber, 10) * 0.18;
  s += Math.min(protein, 25) * 0.06;

  s -= Math.max(0, sugar - 8) * 0.08;
  s -= Math.max(0, sat - 4) * 0.12;
  s -= Math.max(0, sodium - 350) * 0.0015;

  if (type === "meal" && calories > 850) {
    s -= Math.min((calories - 850) / 500, 1.2);
  }

  return Number(clamp(s, 0, 10).toFixed(1));
}

function firstNumber(text, patterns, fallback = 0) {
  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match && match[1] != null) {
      const number = Number(
        String(match[1]).replace(/,/g, "")
      );

      if (Number.isFinite(number)) {
        return number;
      }
    }
  }

  return fallback;
}

function cleanOCR(text) {
  return String(text || "")
    .replace(/\r/g, "\n")
    .replace(/[|]/g, "I")
    .replace(/\s+/g, " ")
    .trim();
}

function parseNutrition(raw) {
  const text = cleanOCR(raw);

  const calories = firstNumber(text, [
    /calories?\s*[:\-]?\s*(\d{2,4})/i,
    /energy\s*[:\-]?\s*(\d{2,4})\s*k?cal/i,
    /(\d{2,4})\s*kcal/i,
  ]);

  const fat_g = firstNumber(text, [
    /total\s*fat\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i,
    /\bfat\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i,
  ]);

  const saturated_fat_g = firstNumber(text, [
    /saturated\s*fat\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i,
    /saturates?\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i,
  ]);

  const sodium_mg = firstNumber(text, [
    /sodium\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*mg/i,
  ]);

  const carbs_g = firstNumber(text, [
    /total\s*carb(?:ohydrate)?s?\.?\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i,
    /carbohydrates?\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i,
  ]);

  const fiber_g = firstNumber(text, [
    /dietary\s*fib(?:er|re)\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i,
    /\bfib(?:er|re)\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i,
  ]);

  const sugar_g = firstNumber(text, [
    /total\s*sugars?\s*[:\-]?\s*[<]?\s*(\d+(?:\.\d+)?)\s*g/i,
    /sugars?\s*[:\-]?\s*[<]?\s*(\d+(?:\.\d+)?)\s*g/i,
  ]);

  const protein_g = firstNumber(text, [
    /protein\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i,
  ]);

  return {
    calories,
    protein_g,
    carbs_g,
    fat_g,
    saturated_fat_g,
    fiber_g,
    sugar_g,
    sodium_mg,
  };
}

function enoughData(nutrition) {
  const values = [
    nutrition.calories,
    nutrition.protein_g,
    nutrition.carbs_g,
    nutrition.fat_g,
    nutrition.fiber_g,
    nutrition.sugar_g,
    nutrition.sodium_mg,
  ];

  const found = values.filter(
    (value) => Number(value) > 0
  ).length;

  return found >= 3;
}

function insights(nutrition) {
  const good = [];
  const know = [];

  if (nutrition.fiber_g >= 5) {
    good.push("Good source of fiber");
  }

  if (nutrition.protein_g >= 10) {
    good.push("Useful protein content");
  }

  if (nutrition.sugar_g <= 5) {
    good.push("Low sugar per listed serving");
  }

  if (nutrition.sodium_mg <= 200) {
    good.push("Relatively low sodium");
  }

  if (nutrition.sodium_mg > 500) {
    know.push("High sodium per listed serving");
  }

  if (nutrition.sugar_g > 15) {
    know.push("High total sugar per listed serving");
  }

  if (nutrition.saturated_fat_g > 5) {
    know.push("Higher saturated fat");
  }

  if (
    nutrition.fiber_g > 0 &&
    nutrition.fiber_g < 3
  ) {
    know.push("Low fiber");
  }

  if (!good.length) {
    good.push(
      "Nutrition values successfully read from the label"
    );
  }

  if (!know.length) {
    know.push(
      "Check the ingredient list and serving size for more context"
    );
  }

  return {
    good: good.slice(0, 3),
    know: know.slice(0, 3),
  };
}

export async function POST(req) {
  let worker;

  try {
    const form = await req.formData();

    const file = form.get("image");

    const mode =
      form.get("mode") === "packaged"
        ? "packaged"
        : "meal";

    if (!file) {
      return Response.json(
        {
          error: "No image received.",
        },
        {
          status: 400,
        }
      );
    }

    /*
      Free mode currently supports nutrition
      label scanning.

      Proper food / meal recognition requires
      an image-recognition AI model.
    */

    if (mode === "meal") {
      return Response.json(
        {
          error:
            "Free mode can scan nutrition labels without paid AI. Meal-photo recognition still needs a vision model, so use Packaged Food for now.",
        },
        {
          status: 400,
        }
      );
    }

    /*
      Convert uploaded image into a Buffer
      for OCR processing.
    */

    const bytes = Buffer.from(
      await file.arrayBuffer()
    );

    /*
      Start Tesseract OCR.
    */

    worker = await createWorker("eng");

    const result = await worker.recognize(bytes);

    const text =
      result?.data?.text || "";

    const confidence = clamp(
      (result?.data?.confidence || 0) / 100,
      0,
      1
    );

    /*
      Extract nutrition information from
      the OCR text.
    */

    const nutrition = parseNutrition(text);

    /*
      Make sure enough nutrition values
      were successfully detected.
    */

    if (!enoughData(nutrition)) {
      return Response.json(
        {
          error:
            "I could not read enough nutrition values. Take a straight, close photo of the Nutrition Facts panel with good light.",
        },
        {
          status: 422,
        }
      );
    }

    /*
      Calculate Edible's own score.
    */

    const score = deterministicScore(
      nutrition,
      "packaged"
    );

    /*
      Generate simple health insights
      without using paid AI.
    */

    const { good, know } =
      insights(nutrition);

    /*
      Return the result to the Edible app.
    */

    return Response.json({
      name: "Scanned Packaged Food",

      emoji: "🏷️",

      type: "packaged",

      serving:
        "Per visible label serving",

      score,

      nutrition,

      summary:
        "Edible read the visible nutrition label with OCR and calculated this score using its deterministic scoring rules.",

      good,

      know,

      confidence: Number(
        confidence.toFixed(2)
      ),

      source: "free-ocr",
    });
  } catch (err) {
    console.error(
      "Edible OCR error:",
      err
    );

    return Response.json(
      {
        error:
          "Free label scan failed. Try a clearer, closer photo of the Nutrition Facts panel.",
      },
      {
        status: 500,
      }
    );
  } finally {
    /*
      Always shut down the OCR worker
      so Render memory is released.
    */

    if (worker) {
      try {
        await worker.terminate();
      } catch {
        // Ignore cleanup errors.
      }
    }
  }
}
