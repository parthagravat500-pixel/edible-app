"use client";

import { useEffect, useState } from "react";

const demoFoods = [
  ["Chapati", "🫓", "chapati"],
  ["Rice", "🍚", "rice"],
  ["Dal", "🥣", "dal"],
  ["Paneer", "🧀", "paneer"],
  ["Salad", "🥗", "salad"],
  ["Fruit", "🍎", "fruit"],
];

const demoMap = {
  chapati: {
    name: "Chapati / Roti",
    emoji: "🫓",
    type: "meal",
    serving: "2 medium",
    score: 8.4,
    nutrition: {
      calories: 240,
      protein_g: 7,
      carbs_g: 46,
      fat_g: 4,
      saturated_fat_g: 1,
      fiber_g: 6,
      sugar_g: 2,
      sodium_mg: 180,
    },
    summary:
      "Good whole-wheat carbohydrate with useful fiber.",
    good: [
      "Whole-grain carbohydrate",
      "Useful fiber",
      "Easy to pair with protein",
    ],
    know: ["Added ghee or oil changes nutrition"],
  },

  rice: {
    name: "Cooked White Rice",
    emoji: "🍚",
    type: "meal",
    serving: "1 cup cooked",
    score: 6.8,
    nutrition: {
      calories: 205,
      protein_g: 4.3,
      carbs_g: 45,
      fat_g: 0.4,
      saturated_fat_g: 0.1,
      fiber_g: 0.6,
      sugar_g: 0.1,
      sodium_mg: 2,
    },
    summary:
      "Useful energy, but low in fiber and protein on its own.",
    good: ["Simple carbohydrate source", "Low fat"],
    know: ["Low fiber", "Best paired with dal or vegetables"],
  },

  dal: {
    name: "Dal",
    emoji: "🥣",
    type: "meal",
    serving: "1 cup",
    score: 9.0,
    nutrition: {
      calories: 220,
      protein_g: 12,
      carbs_g: 34,
      fat_g: 4,
      saturated_fat_g: 1,
      fiber_g: 8,
      sugar_g: 4,
      sodium_mg: 320,
    },
    summary:
      "Strong plant-protein and fiber profile.",
    good: [
      "Good plant protein",
      "High fiber",
      "Mineral-rich",
    ],
    know: ["Sodium and oil depend on recipe"],
  },

  paneer: {
    name: "Paneer Curry",
    emoji: "🧀",
    type: "meal",
    serving: "1 bowl",
    score: 7.5,
    nutrition: {
      calories: 330,
      protein_g: 18,
      carbs_g: 12,
      fat_g: 24,
      saturated_fat_g: 10,
      fiber_g: 2,
      sugar_g: 5,
      sodium_mg: 420,
    },
    summary:
      "Good protein and calcium; preparation can raise saturated fat.",
    good: ["Good protein", "Calcium source"],
    know: [
      "Can be high in saturated fat",
      "Gravy and oil matter",
    ],
  },

  salad: {
    name: "Mixed Salad",
    emoji: "🥗",
    type: "meal",
    serving: "1 bowl",
    score: 9.3,
    nutrition: {
      calories: 110,
      protein_g: 4,
      carbs_g: 18,
      fat_g: 3,
      saturated_fat_g: 0.5,
      fiber_g: 6,
      sugar_g: 8,
      sodium_mg: 120,
    },
    summary:
      "High vegetable content and good fiber density.",
    good: [
      "High vegetable content",
      "Fiber-rich",
      "Low energy density",
    ],
    know: ["Dressings can add sodium and fat"],
  },

  fruit: {
    name: "Fruit Bowl",
    emoji: "🍎",
    type: "meal",
    serving: "1 bowl",
    score: 9.1,
    nutrition: {
      calories: 140,
      protein_g: 2,
      carbs_g: 35,
      fat_g: 1,
      saturated_fat_g: 0,
      fiber_g: 6,
      sugar_g: 25,
      sodium_mg: 5,
    },
    summary:
      "Whole fruit provides fiber, hydration and micronutrients.",
    good: [
      "Whole-food fiber",
      "Micronutrients",
      "Hydrating",
    ],
    know: [
      "Natural sugar is still part of total carbohydrate",
    ],
  },
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function calculateScore(n) {
  const protein = Number(n.protein_g || 0);
  const fiber = Number(n.fiber_g || 0);
  const sugar = Number(n.sugar_g || 0);
  const saturatedFat = Number(n.saturated_fat_g || 0);
  const sodium = Number(n.sodium_mg || 0);

  let score = 7;

  score += Math.min(fiber, 10) * 0.18;
  score += Math.min(protein, 25) * 0.06;

  score -= Math.max(0, sugar - 8) * 0.08;
  score -= Math.max(0, saturatedFat - 4) * 0.12;
  score -= Math.max(0, sodium - 350) * 0.0015;

  return Number(
    clamp(score, 0, 10).toFixed(1)
  );
}

function numberFrom(value) {
  if (value == null) return 0;

  const cleaned = String(value)
    .replace(/,/g, ".")
    .replace(/[^\d.]/g, "");

  const number = Number(cleaned);

  return Number.isFinite(number)
    ? number
    : 0;
}

function normalizeText(text) {
  return String(text || "")
    .replace(/\r/g, "\n")
    .replace(/[|]/g, "I")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function getLines(text) {
  return normalizeText(text)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function findLabelIndex(lines, patterns) {
  return lines.findIndex((line) =>
    patterns.some((pattern) =>
      pattern.test(line)
    )
  );
}

function extractValueFromLine(
  line,
  patterns,
  unit = ""
) {
  let cleaned = line;

  for (const pattern of patterns) {
    cleaned = cleaned.replace(
      pattern,
      " "
    );
  }

  let regex;

  if (unit === "mg") {
    regex =
      /<?\s*(\d+(?:[.,]\d+)?)\s*mg/i;
  } else if (unit === "g") {
    regex =
      /<?\s*(\d+(?:[.,]\d+)?)\s*g/i;
  } else {
    regex =
      /<?\s*(\d+(?:[.,]\d+)?)/;
  }

  const match = cleaned.match(regex);

  return match
    ? numberFrom(match[1])
    : 0;
}

function valueNearLabel(
  lines,
  patterns,
  unit = ""
) {
  const index = findLabelIndex(
    lines,
    patterns
  );

  if (index < 0) return 0;

  const sameLine =
    extractValueFromLine(
      lines[index],
      patterns,
      unit
    );

  if (sameLine > 0) {
    return sameLine;
  }

  /*
    OCR sometimes puts nutrient name
    and value on separate lines.
  */

  for (
    let i = index + 1;
    i <=
    Math.min(
      index + 2,
      lines.length - 1
    );
    i++
  ) {
    let regex;

    if (unit === "mg") {
      regex =
        /<?\s*(\d+(?:[.,]\d+)?)\s*mg/i;
    } else if (unit === "g") {
      regex =
        /<?\s*(\d+(?:[.,]\d+)?)\s*g/i;
    } else {
      regex =
        /<?\s*(\d+(?:[.,]\d+)?)/;
    }

    const match =
      lines[i].match(regex);

    if (match) {
      return numberFrom(
        match[1]
      );
    }
  }

  return 0;
}

function parseCalories(lines) {
  const index = findLabelIndex(
    lines,
    [
      /\bcalories\b/i,
      /\benergy\b/i,
    ]
  );

  if (index < 0) {
    return 0;
  }

  const sameLine =
    lines[index].match(
      /(?:calories|energy)\D*(\d{2,4})/i
    );

  if (sameLine) {
    return numberFrom(
      sameLine[1]
    );
  }

  for (
    let i = index + 1;
    i <=
    Math.min(
      index + 3,
      lines.length - 1
    );
    i++
  ) {
    const match =
      lines[i].match(
        /\b(\d{2,4})\b/
      );

    if (match) {
      return numberFrom(
        match[1]
      );
    }
  }

  return 0;
}

function parseServing(lines) {
  const index =
    findLabelIndex(lines, [
      /serving\s*size/i,
    ]);

  if (index < 0) {
    return "";
  }

  let value = lines[index]
    .replace(
      /.*serving\s*size\s*[:\-]?/i,
      ""
    )
    .trim();

  if (
    !value ||
    value.length < 2
  ) {
    value =
      lines[index + 1] || "";
  }

  return value;
}

function parseNutrition(text) {
  const lines =
    getLines(text);

  const calories =
    parseCalories(lines);

  const fat_g =
    valueNearLabel(
      lines,
      [/total\s*fat/i],
      "g"
    );

  const saturated_fat_g =
    valueNearLabel(
      lines,
      [
        /saturated\s*fat/i,
        /sat\.?\s*fat/i,
      ],
      "g"
    );

  const sodium_mg =
    valueNearLabel(
      lines,
      [/sodium/i],
      "mg"
    );

  let carbs_g =
    valueNearLabel(
      lines,
      [
        /total\s*carb(?:ohydrate)?s?\.?/i,
        /total\s*carbohydrate/i,
      ],
      "g"
    );

  if (!carbs_g) {
    carbs_g =
      valueNearLabel(
        lines,
        [/carbohydrates?/i],
        "g"
      );
  }

  let fiber_g =
    valueNearLabel(
      lines,
      [
        /dietary\s*fib(?:er|re)/i,
      ],
      "g"
    );

  if (!fiber_g) {
    fiber_g =
      valueNearLabel(
        lines,
        [/\bfib(?:er|re)\b/i],
        "g"
      );
  }

  let sugar_g =
    valueNearLabel(
      lines,
      [/total\s*sugars?/i],
      "g"
    );

  if (!sugar_g) {
    sugar_g =
      valueNearLabel(
        lines,
        [/\bsugars?\b/i],
        "g"
      );
  }

  const protein_g =
    valueNearLabel(
      lines,
      [/protein/i],
      "g"
    );

  return {
    serving:
      parseServing(lines),

    nutrition: {
      calories,
      protein_g,
      carbs_g,
      fat_g,
      saturated_fat_g,
      fiber_g,
      sugar_g,
      sodium_mg,
    },
  };
}

function chooseValue(
  primary,
  secondary,
  fallback
) {
  if (Number(primary) > 0) {
    return Number(primary);
  }

  if (Number(secondary) > 0) {
    return Number(secondary);
  }

  if (Number(fallback) > 0) {
    return Number(fallback);
  }

  return 0;
}

function mergeNutrition(
  tight,
  medium,
  full
) {
  const result = {
    calories: chooseValue(
      tight.calories,
      medium.calories,
      full.calories
    ),

    protein_g: chooseValue(
      tight.protein_g,
      medium.protein_g,
      full.protein_g
    ),

    carbs_g: chooseValue(
      tight.carbs_g,
      medium.carbs_g,
      full.carbs_g
    ),

    fat_g: chooseValue(
      tight.fat_g,
      medium.fat_g,
      full.fat_g
    ),

    saturated_fat_g:
      chooseValue(
        tight.saturated_fat_g,
        medium.saturated_fat_g,
        full.saturated_fat_g
      ),

    fiber_g: chooseValue(
      tight.fiber_g,
      medium.fiber_g,
      full.fiber_g
    ),

    sugar_g: chooseValue(
      tight.sugar_g,
      medium.sugar_g,
      full.sugar_g
    ),

    sodium_mg: chooseValue(
      tight.sodium_mg,
      medium.sodium_mg,
      full.sodium_mg
    ),
  };

  /*
    Sanity corrections.
  */

  if (
    result.carbs_g > 0 &&
    result.fiber_g > result.carbs_g
  ) {
    result.carbs_g =
      chooseValue(
        medium.carbs_g,
        full.carbs_g,
        0
      );
  }

  if (
    result.saturated_fat_g >
    result.fat_g &&
    result.fat_g > 0
  ) {
    result.saturated_fat_g =
      chooseValue(
        medium.saturated_fat_g,
        full.saturated_fat_g,
        0
      );
  }

  return result;
}

function nutritionLooksReliable(n) {
  if (
    !n.calories ||
    !n.fat_g ||
    !n.carbs_g ||
    !n.protein_g ||
    !n.sodium_mg
  ) {
    return false;
  }

  if (
    n.fiber_g >
    n.carbs_g
  ) {
    return false;
  }

  if (
    n.saturated_fat_g >
    n.fat_g
  ) {
    return false;
  }

  if (
    n.calories > 2000 ||
    n.carbs_g > 250 ||
    n.fat_g > 150 ||
    n.protein_g > 150 ||
    n.sodium_mg > 10000
  ) {
    return false;
  }

  return true;
}

function buildInsights(n) {
  const good = [];
  const know = [];

  if (n.fiber_g >= 5) {
    good.push(
      "Good source of fiber"
    );
  }

  if (n.protein_g >= 10) {
    good.push(
      "Useful protein content"
    );
  }

  if (
    n.sugar_g > 0 &&
    n.sugar_g <= 5
  ) {
    good.push(
      "Low sugar per serving"
    );
  }

  if (
    n.sodium_mg > 0 &&
    n.sodium_mg <= 200
  ) {
    good.push(
      "Relatively low sodium"
    );
  }

  if (n.sodium_mg > 500) {
    know.push(
      "High sodium per serving"
    );
  }

  if (n.sugar_g > 15) {
    know.push(
      "Higher total sugar"
    );
  }

  if (
    n.saturated_fat_g > 5
  ) {
    know.push(
      "Higher saturated fat"
    );
  }

  if (
    n.fiber_g > 0 &&
    n.fiber_g < 3
  ) {
    know.push(
      "Low fiber"
    );
  }

  if (!good.length) {
    good.push(
      "Nutrition label successfully scanned"
    );
  }

  if (!know.length) {
    know.push(
      "Check serving size and ingredients for additional context"
    );
  }

  return {
    good:
      good.slice(0, 3),
    know:
      know.slice(0, 3),
  };
}

function loadTesseract() {
  return new Promise(
    (resolve, reject) => {
      if (window.Tesseract) {
        resolve(
          window.Tesseract
        );
        return;
      }

      const existing =
        document.getElementById(
          "edible-tesseract"
        );

      if (existing) {
        existing.onload = () =>
          resolve(
            window.Tesseract
          );

        existing.onerror =
          reject;

        return;
      }

      const script =
        document.createElement(
          "script"
        );

      script.id =
        "edible-tesseract";

      script.src =
        "https://cdn.jsdelivr.net/npm/tesseract.js@6/dist/tesseract.min.js";

      script.async = true;

      script.onload = () => {
        if (
          window.Tesseract
        ) {
          resolve(
            window.Tesseract
          );
        } else {
          reject(
            new Error(
              "OCR scanner could not start."
            )
          );
        }
      };

      script.onerror = () =>
        reject(
          new Error(
            "Could not load the free OCR scanner."
          )
        );

      document.head.appendChild(
        script
      );
    }
  );
}

function loadImage(file) {
  return new Promise(
    (resolve, reject) => {
      const image =
        new Image();

      const url =
        URL.createObjectURL(
          file
        );

      image.onload = () => {
        URL.revokeObjectURL(
          url
        );

        resolve(image);
      };

      image.onerror = () => {
        URL.revokeObjectURL(
          url
        );

        reject(
          new Error(
            "Could not open this image."
          )
        );
      };

      image.src = url;
    }
  );
}

async function preprocessImage(
  file,
  cropRatio
) {
  const image =
    await loadImage(file);

  const sourceWidth =
    Math.round(
      image.naturalWidth *
        cropRatio
    );

  const sourceHeight =
    image.naturalHeight;

  /*
    Upscale image substantially
    for small Nutrition Facts text.
  */

  const scale = 2.4;

  const canvas =
    document.createElement(
      "canvas"
    );

  canvas.width =
    Math.round(
      sourceWidth * scale
    );

  canvas.height =
    Math.round(
      sourceHeight * scale
    );

  const ctx =
    canvas.getContext(
      "2d",
      {
        willReadFrequently: true,
      }
    );

  ctx.fillStyle = "#ffffff";

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  ctx.drawImage(
    image,
    0,
    0,
    sourceWidth,
    sourceHeight,
    0,
    0,
    canvas.width,
    canvas.height
  );

  const imageData =
    ctx.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );

  const pixels =
    imageData.data;

  for (
    let i = 0;
    i < pixels.length;
    i += 4
  ) {
    const gray =
      pixels[i] * 0.299 +
      pixels[i + 1] * 0.587 +
      pixels[i + 2] * 0.114;

    let value =
      (gray - 128) *
        1.8 +
      128;

    value = clamp(
      value,
      0,
      255
    );

    if (value > 205) {
      value = 255;
    }

    if (value < 70) {
      value = 0;
    }

    pixels[i] = value;
    pixels[i + 1] = value;
    pixels[i + 2] = value;
  }

  ctx.putImageData(
    imageData,
    0,
    0
  );

  return canvas;
}

export default function Page() {
  const [screen, setScreen] =
    useState("home");

  const [mode, setMode] =
    useState("packaged");

  const [photo, setPhoto] =
    useState(null);

  const [result, setResult] =
    useState(null);

  const [error, setError] =
    useState("");

  const [history, setHistory] =
    useState([]);

  const [progress, setProgress] =
    useState(0);

  const [
    progressText,
    setProgressText,
  ] = useState(
    "Preparing scanner…"
  );

  useEffect(() => {
    try {
      setHistory(
        JSON.parse(
          localStorage.getItem(
            "edible_history"
          ) || "[]"
        )
      );
    } catch {}
  }, []);

  function saveHistory(item) {
    const next = [
      {
        name: item.name,
        emoji:
          item.emoji || "🍽️",
        score: item.score,
        type: item.type,
        date:
          new Date().toISOString(),
      },
      ...history,
    ].slice(0, 20);

    setHistory(next);

    try {
      localStorage.setItem(
        "edible_history",
        JSON.stringify(next)
      );
    } catch {}
  }

  async function choosePhoto(file) {
    if (!file) return;

    const url =
      URL.createObjectURL(
        file
      );

    setPhoto({
      file,
      url,
    });

    if (mode === "meal") {
      setError(
        "Free meal-photo recognition is not enabled yet."
      );

      setScreen("scan");

      return;
    }

    await analyzeLabel(file);
  }

  async function runOCR(
    Tesseract,
    image,
    start,
    end
  ) {
    const response =
      await Tesseract.recognize(
        image,
        "eng",
        {
          logger: (
            message
          ) => {
            if (
              message.status ===
              "recognizing text"
            ) {
              const local =
                message.progress ||
                0;

              const total =
                start +
                local *
                  (end -
                    start);

              const percent =
                Math.round(
                  total
                );

              setProgress(
                percent
              );

              setProgressText(
                `Reading nutrition label… ${percent}%`
              );
            }
          },
        }
      );

    return (
      response?.data?.text ||
      ""
    );
  }

  async function analyzeLabel(
    file
  ) {
    setError("");
    setProgress(0);
    setScreen("loading");

    try {
      const Tesseract =
        await loadTesseract();

      /*
        PASS 1
        Tight crop.

        This deliberately cuts off
        the per-package column.
      */

      setProgressText(
        "Reading per-serving column…"
      );

      const tightImage =
        await preprocessImage(
          file,
          0.60
        );

      const tightText =
        await runOCR(
          Tesseract,
          tightImage,
          5,
          45
        );

      console.log(
        "EDIBLE TIGHT OCR:",
        tightText
      );

      /*
        PASS 2
        Slightly wider crop in case
        the first crop cuts a value.
      */

      setProgressText(
        "Cross-checking values…"
      );

      const mediumImage =
        await preprocessImage(
          file,
          0.68
        );

      const mediumText =
        await runOCR(
          Tesseract,
          mediumImage,
          45,
          78
        );

      console.log(
        "EDIBLE MEDIUM OCR:",
        mediumText
      );

      /*
        PASS 3
        Full label only as fallback.
      */

      setProgressText(
        "Final verification…"
      );

      const fullImage =
        await preprocessImage(
          file,
          1
        );

      const fullText =
        await runOCR(
          Tesseract,
          fullImage,
          78,
          98
        );

      console.log(
        "EDIBLE FULL OCR:",
        fullText
      );

      const tight =
        parseNutrition(
          tightText
        );

      const medium =
        parseNutrition(
          mediumText
        );

      const full =
        parseNutrition(
          fullText
        );

      const nutrition =
        mergeNutrition(
          tight.nutrition,
          medium.nutrition,
          full.nutrition
        );

      console.log(
        "EDIBLE FINAL:",
        nutrition
      );

      /*
        Do not show a health score
        unless core nutrition fields
        look believable.
      */

      if (
        !nutritionLooksReliable(
          nutrition
        )
      ) {
        throw new Error(
          "Edible could not confidently verify all key nutrition values. Try a closer, straight photo of the Nutrition Facts panel."
        );
      }

      const score =
        calculateScore(
          nutrition
        );

      const insights =
        buildInsights(
          nutrition
        );

      const serving =
        tight.serving ||
        medium.serving ||
        full.serving ||
        "Per serving";

      const scanned = {
        name:
          "Scanned Packaged Food",

        emoji: "🏷️",

        type:
          "packaged",

        serving,

        score,

        nutrition,

        summary:
          "Edible isolated the per-serving nutrition column, cross-checked the label and calculated your score.",

        good:
          insights.good,

        know:
          insights.know,

        source:
          "verified-device-ocr",
      };

      setProgress(100);

      setResult(
        scanned
      );

      saveHistory(
        scanned
      );

      setScreen(
        "result"
      );
    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
          "Could not reliably read this nutrition label."
      );

      setScreen(
        "scan"
      );
    }
  }

  function openDemo(key) {
    const item =
      demoMap[key];

    setResult(item);

    saveHistory(item);

    setScreen("result");
  }

  function packagedDemo() {
    const item = {
      name:
        "Wholegrain Oat Crunch",

      emoji: "🌾",

      type:
        "packaged",

      serving:
        "1 serving",

      score: 8.7,

      nutrition: {
        calories: 370,
        protein_g: 12,
        carbs_g: 62,
        fat_g: 7,
        saturated_fat_g: 1,
        fiber_g: 10,
        sugar_g: 4,
        sodium_mg: 210,
      },

      summary:
        "High fiber with useful protein and relatively low sugar.",

      good: [
        "High fiber",
        "Wholegrain base",
        "Low sugar",
      ],

      know: [
        "Moderate sodium",
      ],
    };

    setResult(item);

    saveHistory(item);

    setScreen("result");
  }

  return (
    <div className="app">
      <header className="top">
        <div>
          <div className="brand">
            edible
          </div>

          {screen === "home" && (
            <div className="tag">
              Know what you eat.
            </div>
          )}
        </div>

        <button
          className="settings"
          onClick={() =>
            setScreen("profile")
          }
        >
          ⚙
        </button>
      </header>

      {screen === "home" && (
        <main>
          <h1>
            Scan any food.
          </h1>

          <p className="sub">
            Understand what’s inside
            in seconds.
          </p>

          <div className="modebar">
            <button
              className={
                "modepill " +
                (mode === "packaged"
                  ? "active"
                  : "")
              }
              onClick={() =>
                setMode("packaged")
              }
            >
              Packaged Food
            </button>

            <button
              className={
                "modepill " +
                (mode === "meal"
                  ? "active"
                  : "")
              }
              onClick={() =>
                setMode("meal")
              }
            >
              Food / Meal
            </button>
          </div>

          <button
            className="hero"
            onClick={() =>
              setScreen("scan")
            }
          >
            <div className="camcircle">
              {mode === "packaged"
                ? "📷"
                : "🍽️"}
            </div>

            <div className="herobottom">
              <strong>
                {mode === "packaged"
                  ? "Scan Food"
                  : "Scan a Meal"}
              </strong>

              <span>
                {mode === "packaged"
                  ? "Verified per-serving label scan"
                  : "Meal recognition coming next"}
              </span>
            </div>
          </button>

          <div className="quick">
            <button
              className="q"
              onClick={() => {
                setMode("packaged");
                setScreen("scan");
              }}
            >
              <div className="qicon">
                ▦
              </div>

              <strong>
                Scan Label
              </strong>

              <span>
                Smart OCR
              </span>
            </button>

            <button
              className="q"
              onClick={() =>
                setScreen("compare")
              }
            >
              <div className="qicon">
                ⇄
              </div>

              <strong>
                Compare
              </strong>

              <span>
                Find the better choice
              </span>
            </button>

            <button
              className="q"
              onClick={() =>
                setScreen("history")
              }
            >
              <div className="qicon">
                ◷
              </div>

              <strong>
                History
              </strong>

              <span>
                Your scanned foods
              </span>
            </button>
          </div>

          <div className="sectionrow">
            <h3>
              Food Categories
            </h3>

            <span>
              Explore
            </span>
          </div>

          <div className="cats">
            {demoFoods.map(
              ([
                name,
                emoji,
                key,
              ]) => (
                <button
                  key={key}
                  className="cat"
                  onClick={() =>
                    openDemo(key)
                  }
                >
                  <em>
                    {emoji}
                  </em>

                  {name}
                </button>
              )
            )}
          </div>

          <div className="impact">
            <div className="avo">
              🥑
            </div>

            <div>
              <strong>
                Small choices. Big impact.
              </strong>

              <p>
                Make smarter food choices,
                one scan at a time.
              </p>
            </div>
          </div>
        </main>
      )}

      {screen === "scan" && (
        <main>
          <button
            className="back"
            onClick={() =>
              setScreen("home")
            }
          >
            ← Home
          </button>

          <h2>
            Scan nutrition label
          </h2>

          <p className="sub">
            Keep the complete Nutrition Facts
            panel straight and clearly visible.
          </p>

          {photo?.url ? (
            <img
              className="preview"
              src={photo.url}
              alt="Selected label"
            />
          ) : (
            <div className="camera">
              <div className="frame" />
              <div className="line" />

              <div
                style={{
                  fontSize: 46,
                }}
              >
                🏷️
              </div>

              <div className="camtext">
                <strong>
                  Keep the full label visible
                </strong>

                <br />

                <span>
                  Edible isolates the
                  per-serving column
                </span>
              </div>
            </div>
          )}

          <div className="actions">
            <label className="primary file">
              Take Photo

              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(event) =>
                  choosePhoto(
                    event.target.files?.[0]
                  )
                }
              />
            </label>

            <label className="secondary file">
              Upload Photo

              <input
                type="file"
                accept="image/*"
                onChange={(event) =>
                  choosePhoto(
                    event.target.files?.[0]
                  )
                }
              />
            </label>
          </div>

          {error && (
            <div className="error">
              {error}
            </div>
          )}

          <button
            className="secondary"
            style={{
              width: "100%",
              marginTop: 10,
            }}
            onClick={() =>
              packagedDemo()
            }
          >
            Try Demo Scan
          </button>
        </main>
      )}

      {screen === "loading" && (
        <main className="loading">
          <div className="spinner" />

          <h2>
            Understanding your food
          </h2>

          <p className="sub">
            {progressText}
          </p>

          <div
            style={{
              width: "80%",
              maxWidth: 300,
              height: 10,
              background: "#E6ECE8",
              borderRadius: 20,
              overflow: "hidden",
              marginTop: 15,
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background:
                  "var(--forest)",
                transition:
                  "width .2s ease",
              }}
            />
          </div>

          <p
            className="small"
            style={{
              textAlign: "center",
              marginTop: 17,
            }}
          >
            Checking the per-serving values
            before showing a score.
          </p>
        </main>
      )}

      {screen === "result" &&
        result && (
          <main>
            <button
              className="back"
              onClick={() =>
                setScreen("scan")
              }
            >
              ← Scanner
            </button>

            {photo?.url && (
              <img
                className="preview"
                src={photo.url}
                alt="Analyzed label"
              />
            )}

            <div className="card product">
              <div className="thumb">
                {result.emoji}
              </div>

              <div>
                <div className="small">
                  Packaged food
                </div>

                <div className="pname">
                  {result.name}
                </div>

                <div className="small">
                  {result.serving}
                </div>
              </div>
            </div>

            <div className="card scorebox">
              <div
                className="ring"
                style={{
                  background: `conic-gradient(${
                    result.score >= 8
                      ? "var(--leaf)"
                      : result.score >=
                        6.5
                      ? "#F1C94E"
                      : "#E48A56"
                  } ${
                    result.score * 10
                  }%, #EDF0EB 0)`,
                }}
              >
                <div className="scoreinner">
                  <div className="score">
                    {Number(
                      result.score
                    ).toFixed(1)}
                  </div>

                  <small>
                    /10
                  </small>
                </div>
              </div>

              <div className="badge">
                {result.score >= 9
                  ? "EXCELLENT"
                  : result.score >= 8
                  ? "VERY GOOD"
                  : result.score >=
                    6.5
                  ? "GOOD"
                  : "FAIR"}
              </div>

              <p
                className="sub"
                style={{
                  margin: "13px 0",
                }}
              >
                {result.summary}
              </p>

              <div className="pills">
                <span className="pill">
                  🔥{" "}
                  {
                    result.nutrition
                      .calories
                  }{" "}
                  kcal
                </span>

                <span className="pill">
                  💪{" "}
                  {
                    result.nutrition
                      .protein_g
                  }
                  g protein
                </span>

                <span className="pill">
                  🌾{" "}
                  {
                    result.nutrition
                      .fiber_g
                  }
                  g fiber
                </span>
              </div>
            </div>

            <div className="card">
              <h3>
                Nutrition information
              </h3>

              <div className="metrics">
                <div className="metric">
                  <small>
                    Calories
                  </small>

                  <strong>
                    {
                      result.nutrition
                        .calories
                    }
                  </strong>
                </div>

                <div className="metric">
                  <small>
                    Protein
                  </small>

                  <strong>
                    {
                      result.nutrition
                        .protein_g
                    }
                    g
                  </strong>
                </div>

                <div className="metric">
                  <small>
                    Carbs
                  </small>

                  <strong>
                    {
                      result.nutrition
                        .carbs_g
                    }
                    g
                  </strong>
                </div>

                <div className="metric">
                  <small>
                    Fat
                  </small>

                  <strong>
                    {
                      result.nutrition
                        .fat_g
                    }
                    g
                  </strong>
                </div>

                <div className="metric">
                  <small>
                    Saturated Fat
                  </small>

                  <strong>
                    {
                      result.nutrition
                        .saturated_fat_g
                    }
                    g
                  </strong>
                </div>

                <div className="metric">
                  <small>
                    Fiber
                  </small>

                  <strong>
                    {
                      result.nutrition
                        .fiber_g
                    }
                    g
                  </strong>
                </div>

                <div className="metric">
                  <small>
                    Sugar
                  </small>

                  <strong>
                    {
                      result.nutrition
                        .sugar_g
                    }
                    g
                  </strong>
                </div>

                <div className="metric">
                  <small>
                    Sodium
                  </small>

                  <strong>
                    {
                      result.nutrition
                        .sodium_mg
                    }
                    mg
                  </strong>
                </div>
              </div>
            </div>

            <div className="card softmint">
              <h3>
                What’s Good Here? 🌱
              </h3>

              {(result.good || []).map(
                (item, index) => (
                  <p key={index}>
                    ✓ {item}
                  </p>
                )
              )}
            </div>

            <div className="card softyellow">
              <h3>
                Things to Know
              </h3>

              {(result.know || []).map(
                (item, index) => (
                  <p key={index}>
                    • {item}
                  </p>
                )
              )}
            </div>

            <div className="card softblue">
              <h3>
                Verified scan ✓
              </h3>

              <p
                className="small"
                style={{
                  marginBottom: 0,
                }}
              >
                Edible checks key nutrition
                relationships before displaying
                the score.
              </p>
            </div>

            <button
              className="primary"
              style={{
                width: "100%",
              }}
              onClick={() => {
                setPhoto(null);
                setResult(null);
                setError("");
                setScreen("scan");
              }}
            >
              Scan Another
            </button>
          </main>
        )}

      {screen === "compare" && (
        <main>
          <button
            className="back"
            onClick={() =>
              setScreen("home")
            }
          >
            ← Home
          </button>

          <h2>Compare</h2>

          <p className="sub">
            Pick the better choice at a glance.
          </p>

          <div className="foodgrid">
            <div className="card">
              🌾 Oat Crunch

              <div className="score">
                8.7
              </div>
            </div>

            <div className="card">
              🍫 Protein Bar

              <div className="score">
                6.4
              </div>
            </div>
          </div>
        </main>
      )}

      {screen === "history" && (
        <main>
          <h2>History</h2>

          <div className="card">
            {history.length ? (
              history.map(
                (item, index) => (
                  <div
                    className="historyrow"
                    key={index}
                  >
                    <div
                      className="thumb"
                      style={{
                        width: 55,
                        height: 55,
                        fontSize: 28,
                      }}
                    >
                      {item.emoji}
                    </div>

                    <div>
                      <strong>
                        {item.name}
                      </strong>
                    </div>

                    <div className="hscore">
                      {Number(
                        item.score
                      ).toFixed(1)}
                    </div>
                  </div>
                )
              )
            ) : (
              <p>
                No scans yet.
              </p>
            )}
          </div>
        </main>
      )}

      {screen === "explore" && (
        <main>
          <h2>Explore</h2>

          <div className="card softmint">
            <h3>
              Nutrition labels 🏷️
            </h3>

            <p>
              Edible focuses on the
              per-serving values when a label
              has multiple nutrition columns.
            </p>
          </div>
        </main>
      )}

      {screen === "saved" && (
        <main>
          <h2>Saved</h2>

          <div className="card">
            Saved foods will appear here.
          </div>
        </main>
      )}

      {screen === "profile" && (
        <main>
          <button
            className="back"
            onClick={() =>
              setScreen("home")
            }
          >
            ← Home
          </button>

          <h2>Edible</h2>

          <div className="card softmint">
            <h3>
              Free Scan Mode ✓
            </h3>

            <p>
              Label OCR runs directly on your
              device without paid API credits.
            </p>
          </div>
        </main>
      )}

      <nav className="nav">
        <button
          className={
            screen === "home"
              ? "on"
              : ""
          }
          onClick={() =>
            setScreen("home")
          }
        >
          ⌂
          <small>Home</small>
        </button>

        <button
          className={
            screen === "explore"
              ? "on"
              : ""
          }
          onClick={() =>
            setScreen("explore")
          }
        >
          ⌕
          <small>Explore</small>
        </button>

        <button
          className={
            screen === "saved"
              ? "on"
              : ""
          }
          onClick={() =>
            setScreen("saved")
          }
        >
          ♡
          <small>Saved</small>
        </button>

        <button
          className={
            screen === "profile"
              ? "on"
              : ""
          }
          onClick={() =>
            setScreen("profile")
          }
        >
          ◉
          <small>Profile</small>
        </button>
      </nav>
    </div>
  );
}
