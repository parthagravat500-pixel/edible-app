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
    know: [
      "Low fiber",
      "Best paired with dal or vegetables",
    ],
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
  const sat = Number(n.saturated_fat_g || 0);
  const sodium = Number(n.sodium_mg || 0);

  let score = 7;

  score += Math.min(fiber, 10) * 0.18;
  score += Math.min(protein, 25) * 0.06;

  score -= Math.max(0, sugar - 8) * 0.08;
  score -= Math.max(0, sat - 4) * 0.12;
  score -= Math.max(0, sodium - 350) * 0.0015;

  return Number(clamp(score, 0, 10).toFixed(1));
}

function num(value) {
  if (value == null) return 0;

  const cleaned = String(value)
    .replace(",", ".")
    .replace(/[^\d.]/g, "");

  const number = Number(cleaned);

  return Number.isFinite(number) ? number : 0;
}

function normalize(text) {
  return String(text || "")
    .replace(/\r/g, "\n")
    .replace(/[|]/g, "I")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function findLineIndex(lines, patterns) {
  return lines.findIndex((line) =>
    patterns.some((pattern) => pattern.test(line))
  );
}

function firstNumberInText(text) {
  const match = String(text).match(
    /<?\s*(\d+(?:[.,]\d+)?)/
  );

  return match ? num(match[1]) : 0;
}

function valueNearLabel(lines, patterns, unit = "") {
  const index = findLineIndex(lines, patterns);

  if (index === -1) return 0;

  const current = lines[index];

  let afterLabel = current;

  for (const pattern of patterns) {
    afterLabel = afterLabel.replace(pattern, " ");
  }

  let match;

  if (unit === "mg") {
    match = afterLabel.match(
      /<?\s*(\d+(?:[.,]\d+)?)\s*mg/i
    );
  } else if (unit === "g") {
    match = afterLabel.match(
      /<?\s*(\d+(?:[.,]\d+)?)\s*g/i
    );
  } else {
    match = afterLabel.match(
      /<?\s*(\d+(?:[.,]\d+)?)/
    );
  }

  if (match) {
    return num(match[1]);
  }

  /*
    Sometimes Tesseract puts the nutrient
    name on one line and the value on the next.
  */

  for (
    let i = index + 1;
    i <= Math.min(index + 2, lines.length - 1);
    i++
  ) {
    const next = lines[i];

    if (unit === "mg") {
      match = next.match(
        /<?\s*(\d+(?:[.,]\d+)?)\s*mg/i
      );
    } else if (unit === "g") {
      match = next.match(
        /<?\s*(\d+(?:[.,]\d+)?)\s*g/i
      );
    } else {
      match = next.match(
        /<?\s*(\d+(?:[.,]\d+)?)/
      );
    }

    if (match) {
      return num(match[1]);
    }
  }

  return 0;
}

function parseNutrition(textInput) {
  const text = normalize(textInput);

  const lines = text
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);

  /*
    Calories
  */

  let calories = 0;

  const calorieIndex = findLineIndex(lines, [
    /\bcalories\b/i,
    /\benergy\b/i,
  ]);

  if (calorieIndex >= 0) {
    const sameLine = lines[calorieIndex].match(
      /(?:calories|energy)\D*(\d{2,4})/i
    );

    if (sameLine) {
      calories = num(sameLine[1]);
    }

    if (!calories) {
      for (
        let i = calorieIndex + 1;
        i <=
        Math.min(
          calorieIndex + 3,
          lines.length - 1
        );
        i++
      ) {
        const match =
          lines[i].match(
            /\b(\d{2,4})\b/
          );

        if (match) {
          calories = num(match[1]);
          break;
        }
      }
    }
  }

  /*
    Nutrition values
  */

  const fat_g = valueNearLabel(
    lines,
    [/total\s*fat/i],
    "g"
  );

  const saturated_fat_g =
    valueNearLabel(
      lines,
      [
        /saturated\s*fat/i,
        /\bsat\.?\s*fat/i,
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
    carbs_g = valueNearLabel(
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
    fiber_g = valueNearLabel(
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
    sugar_g = valueNearLabel(
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

  /*
    Serving size
  */

  let serving = "";

  const servingIndex =
    findLineIndex(lines, [
      /serving\s*size/i,
    ]);

  if (servingIndex >= 0) {
    serving = lines[
      servingIndex
    ]
      .replace(
        /.*serving\s*size\s*[:\-]?/i,
        ""
      )
      .trim();

    if (
      !serving ||
      serving.length < 2
    ) {
      serving =
        lines[
          servingIndex + 1
        ] || "";
    }
  }

  return {
    serving,

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

function mergeNutrition(a, b, c) {
  const keys = [
    "calories",
    "protein_g",
    "carbs_g",
    "fat_g",
    "saturated_fat_g",
    "fiber_g",
    "sugar_g",
    "sodium_mg",
  ];

  const result = {};

  for (const key of keys) {
    /*
      Priority:
      1. cropped enhanced OCR
      2. full enhanced OCR
      3. original OCR
    */

    result[key] =
      Number(a?.[key] || 0) ||
      Number(b?.[key] || 0) ||
      Number(c?.[key] || 0) ||
      0;
  }

  return result;
}

function enoughData(n) {
  const important = [
    n.calories,
    n.fat_g,
    n.carbs_g,
    n.protein_g,
    n.sodium_mg,
  ];

  return (
    important.filter(
      (value) => Number(value) > 0
    ).length >= 3
  );
}

function buildInsights(n) {
  const good = [];
  const know = [];

  if (n.fiber_g >= 5) {
    good.push("Good source of fiber");
  }

  if (n.protein_g >= 10) {
    good.push("Useful protein content");
  }

  if (
    n.sugar_g > 0 &&
    n.sugar_g <= 5
  ) {
    good.push("Low sugar per serving");
  }

  if (
    n.sodium_mg > 0 &&
    n.sodium_mg <= 200
  ) {
    good.push("Relatively low sodium");
  }

  if (n.sodium_mg > 500) {
    know.push("High sodium per serving");
  }

  if (n.sugar_g > 15) {
    know.push("Higher total sugar");
  }

  if (n.saturated_fat_g > 5) {
    know.push("Higher saturated fat");
  }

  if (
    n.fiber_g > 0 &&
    n.fiber_g < 3
  ) {
    know.push("Low fiber");
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
    good: good.slice(0, 3),
    know: know.slice(0, 3),
  };
}

function loadTesseract() {
  return new Promise(
    (resolve, reject) => {
      if (window.Tesseract) {
        resolve(window.Tesseract);
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
              "OCR could not start."
            )
          );
        }
      };

      script.onerror = () =>
        reject(
          new Error(
            "Could not load the OCR scanner."
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
      const image = new Image();

      const url =
        URL.createObjectURL(file);

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
            "Could not open image."
          )
        );
      };

      image.src = url;
    }
  );
}

async function preprocessImage(
  file,
  cropRatio = 1
) {
  const image =
    await loadImage(file);

  /*
    On labels with:
    nutrient | per serving | per package

    cropRatio 0.76 keeps nutrient names +
    first nutrition column and removes
    most of the per-package column.
  */

  const sourceWidth =
    image.naturalWidth *
    cropRatio;

  const sourceHeight =
    image.naturalHeight;

  /*
    Upscale for OCR.
  */

  const scale = 2.2;

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

  /*
    Grayscale + contrast enhancement.
  */

  const imgData =
    ctx.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );

  const data =
    imgData.data;

  for (
    let i = 0;
    i < data.length;
    i += 4
  ) {
    const gray =
      data[i] * 0.299 +
      data[i + 1] * 0.587 +
      data[i + 2] * 0.114;

    /*
      Strong contrast.
    */

    let value =
      (gray - 128) * 1.65 +
      128;

    value =
      clamp(
        value,
        0,
        255
      );

    /*
      Light thresholding,
      but keep antialiasing.
    */

    if (value > 210) {
      value = 255;
    }

    if (value < 55) {
      value = 0;
    }

    data[i] = value;
    data[i + 1] =
      value;
    data[i + 2] =
      value;
  }

  ctx.putImageData(
    imgData,
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
          item.emoji ||
          "🍽️",
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

  async function choosePhoto(
    file
  ) {
    if (!file) return;

    const url =
      URL.createObjectURL(file);

    setPhoto({
      file,
      url,
    });

    if (
      mode === "meal"
    ) {
      setError(
        "Meal-photo recognition is not included in free OCR mode yet."
      );

      setScreen("scan");

      return;
    }

    await analyzeLabel(
      file
    );
  }

  async function runOCR(
    Tesseract,
    image,
    stageStart,
    stageEnd
  ) {
    const result =
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
                stageStart +
                local *
                  (stageEnd -
                    stageStart);

              const percent =
                Math.round(
                  total
                );

              setProgress(
                percent
              );

              setProgressText(
                `Reading label… ${percent}%`
              );
            }
          },
        }
      );

    return (
      result?.data?.text ||
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
      setProgressText(
        "Preparing image…"
      );

      const Tesseract =
        await loadTesseract();

      /*
        Pass 1:
        Enhanced left 76% of label.

        This is the important pass for
        two-column US Nutrition Facts.
      */

      setProgressText(
        "Enhancing serving column…"
      );

      const cropped =
        await preprocessImage(
          file,
          0.76
        );

      const croppedText =
        await runOCR(
          Tesseract,
          cropped,
          5,
          48
        );

      console.log(
        "CROPPED OCR:",
        croppedText
      );

      /*
        Pass 2:
        Enhanced full label.
      */

      setProgressText(
        "Cross-checking nutrition…"
      );

      const full =
        await preprocessImage(
          file,
          1
        );

      const fullText =
        await runOCR(
          Tesseract,
          full,
          48,
          82
        );

      console.log(
        "FULL OCR:",
        fullText
      );

      /*
        Pass 3:
        Original image as fallback.
      */

      setProgressText(
        "Verifying values…"
      );

      const originalText =
        await runOCR(
          Tesseract,
          file,
          82,
          98
        );

      console.log(
        "ORIGINAL OCR:",
        originalText
      );

      const croppedParsed =
        parseNutrition(
          croppedText
        );

      const fullParsed =
        parseNutrition(
          fullText
        );

      const originalParsed =
        parseNutrition(
          originalText
        );

      const nutrition =
        mergeNutrition(
          croppedParsed
            .nutrition,
          fullParsed
            .nutrition,
          originalParsed
            .nutrition
        );

      console.log(
        "FINAL NUTRITION:",
        nutrition
      );

      if (
        !enoughData(
          nutrition
        )
      ) {
        throw new Error(
          "I couldn't reliably read the nutrition values. Try a straight, close photo with the full label visible."
        );
      }

      setProgress(100);

      const score =
        calculateScore(
          nutrition
        );

      const insights =
        buildInsights(
          nutrition
        );

      const serving =
        croppedParsed
          .serving ||
        fullParsed.serving ||
        originalParsed
          .serving ||
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
          "Edible enhanced the label, isolated the per-serving column and cross-checked multiple OCR readings before calculating the score.",

        good:
          insights.good,

        know:
          insights.know,

        source:
          "multi-pass-device-ocr",
      };

      setResult(scanned);

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
          "Could not read this label."
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

    setScreen(
      "result"
    );
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

    setScreen(
      "result"
    );
  }

  return (
    <div className="app">
      <header className="top">
        <div>
          <div className="brand">
            edible
          </div>

          {screen ===
            "home" && (
            <div className="tag">
              Know what you eat.
            </div>
          )}
        </div>

        <button
          className="settings"
          onClick={() =>
            setScreen(
              "profile"
            )
          }
        >
          ⚙
        </button>
      </header>

      {screen ===
        "home" && (
        <main>
          <h1>
            Scan any food.
          </h1>

          <p className="sub">
            Understand what’s
            inside in seconds.
          </p>

          <div className="modebar">
            <button
              className={
                "modepill " +
                (mode ===
                "packaged"
                  ? "active"
                  : "")
              }
              onClick={() =>
                setMode(
                  "packaged"
                )
              }
            >
              Packaged Food
            </button>

            <button
              className={
                "modepill " +
                (mode ===
                "meal"
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
              setScreen(
                "scan"
              )
            }
          >
            <div className="camcircle">
              {mode ===
              "packaged"
                ? "📷"
                : "🍽️"}
            </div>

            <div className="herobottom">
              <strong>
                {mode ===
                "packaged"
                  ? "Scan Food"
                  : "Scan a Meal"}
              </strong>

              <span>
                {mode ===
                "packaged"
                  ? "Nutrition label • Multi-pass OCR"
                  : "Meal recognition coming next"}
              </span>
            </div>
          </button>

          <div className="quick">
            <button
              className="q"
              onClick={() => {
                setMode(
                  "packaged"
                );

                setScreen(
                  "scan"
                );
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
                setScreen(
                  "compare"
                )
              }
            >
              <div className="qicon">
                ⇄
              </div>

              <strong>
                Compare
              </strong>

              <span>
                Find the better
                choice
              </span>
            </button>

            <button
              className="q"
              onClick={() =>
                setScreen(
                  "history"
                )
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
                    openDemo(
                      key
                    )
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
                Small choices.
                Big impact.
              </strong>

              <p>
                Make smarter food
                choices, one scan at
                a time.
              </p>
            </div>
          </div>
        </main>
      )}

      {screen ===
        "scan" && (
        <main>
          <button
            className="back"
            onClick={() =>
              setScreen(
                "home"
              )
            }
          >
            ← Home
          </button>

          <h2>
            {mode ===
            "packaged"
              ? "Scan nutrition label"
              : "Scan food or a meal"}
          </h2>

          <p className="sub">
            {mode ===
            "packaged"
              ? "Take a straight photo with the complete Nutrition Facts panel visible."
              : "Free meal-photo recognition is not enabled yet."}
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
                  Keep the complete
                  label visible
                </strong>

                <br />

                <span>
                  Edible will isolate
                  the per-serving
                  column automatically
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
                onChange={(
                  event
                ) =>
                  choosePhoto(
                    event
                      .target
                      .files?.[0]
                  )
                }
              />
            </label>

            <label className="secondary file">
              Upload Photo

              <input
                type="file"
                accept="image/*"
                onChange={(
                  event
                ) =>
                  choosePhoto(
                    event
                      .target
                      .files?.[0]
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
              width:
                "100%",
              marginTop:
                10,
            }}
            onClick={() => {
              if (
                mode ===
                "meal"
              ) {
                openDemo(
                  "chapati"
                );
              } else {
                packagedDemo();
              }
            }}
          >
            Try Demo Scan
          </button>
        </main>
      )}

      {screen ===
        "loading" && (
        <main className="loading">
          <div className="spinner" />

          <h2>
            Understanding your
            food
          </h2>

          <p className="sub">
            {progressText}
          </p>

          <div
            style={{
              width: "80%",
              maxWidth: 300,
              height: 10,
              background:
                "#E6ECE8",
              borderRadius: 20,
              overflow:
                "hidden",
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
              textAlign:
                "center",
              marginTop:
                17,
            }}
          >
            Edible is reading the
            label more than once to
            improve accuracy.
          </p>
        </main>
      )}

      {screen ===
        "result" &&
        result && (
          <main>
            <button
              className="back"
              onClick={() =>
                setScreen(
                  "scan"
                )
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
                {result.emoji ||
                  "🏷️"}
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
                    result.score >=
                    8
                      ? "var(--leaf)"
                      : result.score >=
                        6.5
                      ? "#F1C94E"
                      : "#E48A56"
                  } ${
                    result.score *
                    10
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
                {result.score >=
                9
                  ? "EXCELLENT"
                  : result.score >=
                    8
                  ? "VERY GOOD"
                  : result.score >=
                    6.5
                  ? "GOOD"
                  : "FAIR"}
              </div>

              <p
                className="sub"
                style={{
                  margin:
                    "13px 0",
                }}
              >
                {result.summary}
              </p>

              <div className="pills">
                <span className="pill">
                  🔥{" "}
                  {result
                    .nutrition
                    .calories}
                  {" "}
                  kcal
                </span>

                <span className="pill">
                  💪{" "}
                  {result
                    .nutrition
                    .protein_g}
                  g protein
                </span>

                <span className="pill">
                  🌾{" "}
                  {result
                    .nutrition
                    .fiber_g}
                  g fiber
                </span>
              </div>
            </div>

            <div className="card">
              <h3>
                Nutrition
                information
              </h3>

              <div className="metrics">
                <div className="metric">
                  <small>
                    Calories
                  </small>

                  <strong>
                    {
                      result
                        .nutrition
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
                      result
                        .nutrition
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
                      result
                        .nutrition
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
                      result
                        .nutrition
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
                      result
                        .nutrition
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
                      result
                        .nutrition
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
                      result
                        .nutrition
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
                      result
                        .nutrition
                        .sodium_mg
                    }
                    mg
                  </strong>
                </div>
              </div>
            </div>

            <div className="card softmint">
              <h3>
                What’s Good Here?
                🌱
              </h3>

              {(
                result.good ||
                []
              ).map(
                (
                  item,
                  index
                ) => (
                  <p
                    key={
                      index
                    }
                  >
                    ✓ {item}
                  </p>
                )
              )}
            </div>

            <div className="card softyellow">
              <h3>
                Things to Know
              </h3>

              {(
                result.know ||
                []
              ).map(
                (
                  item,
                  index
                ) => (
                  <p
                    key={
                      index
                    }
                  >
                    • {item}
                  </p>
                )
              )}
            </div>

            <div className="card softblue">
              <h3>
                Multi-pass scan 📱
              </h3>

              <p
                className="small"
                style={{
                  marginBottom:
                    0,
                }}
              >
                The image was
                enhanced and scanned
                several times directly
                on your device. No
                paid AI request was
                used.
              </p>
            </div>

            <button
              className="primary"
              style={{
                width:
                  "100%",
              }}
              onClick={() => {
                setPhoto(
                  null
                );

                setResult(
                  null
                );

                setError(
                  ""
                );

                setScreen(
                  "scan"
                );
              }}
            >
              Scan Another
            </button>
          </main>
        )}

      {screen ===
        "compare" && (
        <main>
          <button
            className="back"
            onClick={() =>
              setScreen(
                "home"
              )
            }
          >
            ← Home
          </button>

          <h2>
            Compare
          </h2>

          <p className="sub">
            Pick the better choice
            at a glance.
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

      {screen ===
        "history" && (
        <main>
          <h2>
            History
          </h2>

          <div className="card">
            {history.length ? (
              history.map(
                (
                  item,
                  index
                ) => (
                  <div
                    className="historyrow"
                    key={
                      index
                    }
                  >
                    <div className="thumb">
                      {
                        item.emoji
                      }
                    </div>

                    <div>
                      <strong>
                        {
                          item.name
                        }
                      </strong>
                    </div>

                    <div className="hscore">
                      {Number(
                        item.score
                      ).toFixed(
                        1
                      )}
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

      {screen ===
        "explore" && (
        <main>
          <h2>
            Explore
          </h2>

          <div className="card softmint">
            <h3>
              Better label scanning
              🏷️
            </h3>

            <p>
              Take a straight,
              close photo with all
              nutrition values
              visible.
            </p>
          </div>
        </main>
      )}

      {screen ===
        "saved" && (
        <main>
          <h2>
            Saved
          </h2>

          <div className="card">
            Saved foods will appear
            here.
          </div>
        </main>
      )}

      {screen ===
        "profile" && (
        <main>
          <button
            className="back"
            onClick={() =>
              setScreen(
                "home"
              )
            }
          >
            ← Home
          </button>

          <h2>
            Edible
          </h2>

          <div className="card softmint">
            <h3>
              Free Scan Mode ✓
            </h3>

            <p>
              OCR runs directly on
              your device without
              paid API credits.
            </p>
          </div>
        </main>
      )}

      <nav className="nav">
        <button
          className={
            screen ===
            "home"
              ? "on"
              : ""
          }
          onClick={() =>
            setScreen(
              "home"
            )
          }
        >
          ⌂
          <small>
            Home
          </small>
        </button>

        <button
          className={
            screen ===
            "explore"
              ? "on"
              : ""
          }
          onClick={() =>
            setScreen(
              "explore"
            )
          }
        >
          ⌕
          <small>
            Explore
          </small>
        </button>

        <button
          className={
            screen ===
            "saved"
              ? "on"
              : ""
          }
          onClick={() =>
            setScreen(
              "saved"
            )
          }
        >
          ♡
          <small>
            Saved
          </small>
        </button>

        <button
          className={
            screen ===
            "profile"
              ? "on"
              : ""
          }
          onClick={() =>
            setScreen(
              "profile"
            )
          }
        >
          ◉
          <small>
            Profile
          </small>
        </button>
      </nav>
    </div>
  );
}
