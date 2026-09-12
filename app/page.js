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
    confidence: 0.95,
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
    confidence: 0.95,
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
    confidence: 0.95,
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
    confidence: 0.9,
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
    confidence: 0.9,
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
    confidence: 0.9,
  },
};

function clamp(number, min, max) {
  return Math.max(min, Math.min(max, number));
}

function calculateScore(nutrition) {
  const protein = Number(nutrition.protein_g || 0);
  const fiber = Number(nutrition.fiber_g || 0);
  const sugar = Number(nutrition.sugar_g || 0);
  const saturatedFat = Number(
    nutrition.saturated_fat_g || 0
  );
  const sodium = Number(nutrition.sodium_mg || 0);

  let score = 7;

  score += Math.min(fiber, 10) * 0.18;
  score += Math.min(protein, 25) * 0.06;

  score -= Math.max(0, sugar - 8) * 0.08;
  score -= Math.max(0, saturatedFat - 4) * 0.12;
  score -= Math.max(0, sodium - 350) * 0.0015;

  return Number(clamp(score, 0, 10).toFixed(1));
}

function findNumber(text, patterns, fallback = 0) {
  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match && match[1] !== undefined) {
      const value = Number(
        String(match[1])
          .replace(",", ".")
          .replace(/[^\d.]/g, "")
      );

      if (Number.isFinite(value)) {
        return value;
      }
    }
  }

  return fallback;
}

function normalizeOCR(text) {
  return String(text || "")
    .replace(/\r/g, "\n")
    .replace(/[|]/g, "I")
    .replace(/[ ]+/g, " ")
    .trim();
}

function parseNutrition(rawText) {
  const text = normalizeOCR(rawText);

  const calories = findNumber(text, [
    /calories?\s*[:\-]?\s*(\d{2,4})/i,
    /energy\s*[:\-]?\s*(\d{2,4})\s*k?cal/i,
    /(\d{2,4})\s*kcal/i,
  ]);

  const fat_g = findNumber(text, [
    /total\s*fat\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i,
    /\bfat\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i,
  ]);

  const saturated_fat_g = findNumber(text, [
    /saturated\s*fat\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i,
    /saturates?\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i,
  ]);

  const sodium_mg = findNumber(text, [
    /sodium\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*mg/i,
  ]);

  const carbs_g = findNumber(text, [
    /total\s*carb(?:ohydrate)?s?\.?\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i,
    /carbohydrates?\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i,
  ]);

  const fiber_g = findNumber(text, [
    /dietary\s*fib(?:er|re)\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i,
    /\bfib(?:er|re)\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i,
  ]);

  const sugar_g = findNumber(text, [
    /total\s*sugars?\s*[:\-]?\s*<?\s*(\d+(?:\.\d+)?)\s*g/i,
    /\bsugars?\s*[:\-]?\s*<?\s*(\d+(?:\.\d+)?)\s*g/i,
  ]);

  const protein_g = findNumber(text, [
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

function hasEnoughNutrition(nutrition) {
  const values = [
    nutrition.calories,
    nutrition.protein_g,
    nutrition.carbs_g,
    nutrition.fat_g,
    nutrition.fiber_g,
    nutrition.sugar_g,
    nutrition.sodium_mg,
  ];

  return values.filter((value) => Number(value) > 0).length >= 3;
}

function buildInsights(nutrition) {
  const good = [];
  const know = [];

  if (nutrition.fiber_g >= 5) {
    good.push("Good source of fiber");
  }

  if (nutrition.protein_g >= 10) {
    good.push("Useful protein content");
  }

  if (nutrition.sugar_g > 0 && nutrition.sugar_g <= 5) {
    good.push("Low sugar per serving");
  }

  if (nutrition.sodium_mg > 0 && nutrition.sodium_mg <= 200) {
    good.push("Relatively low sodium");
  }

  if (nutrition.sodium_mg > 500) {
    know.push("High sodium per serving");
  }

  if (nutrition.sugar_g > 15) {
    know.push("Higher total sugar");
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

  if (good.length === 0) {
    good.push(
      "Nutrition information was successfully detected"
    );
  }

  if (know.length === 0) {
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
  return new Promise((resolve, reject) => {
    if (window.Tesseract) {
      resolve(window.Tesseract);
      return;
    }

    const existing = document.getElementById(
      "edible-tesseract"
    );

    if (existing) {
      existing.addEventListener("load", () =>
        resolve(window.Tesseract)
      );

      existing.addEventListener("error", reject);

      return;
    }

    const script = document.createElement("script");

    script.id = "edible-tesseract";

    script.src =
      "https://cdn.jsdelivr.net/npm/tesseract.js@6/dist/tesseract.min.js";

    script.async = true;

    script.onload = () => {
      if (window.Tesseract) {
        resolve(window.Tesseract);
      } else {
        reject(
          new Error("OCR library could not start.")
        );
      }
    };

    script.onerror = () => {
      reject(
        new Error(
          "Could not download the free OCR engine."
        )
      );
    };

    document.head.appendChild(script);
  });
}

export default function Page() {
  const [screen, setScreen] = useState("home");

  const [mode, setMode] = useState("packaged");

  const [photo, setPhoto] = useState(null);

  const [result, setResult] = useState(null);

  const [error, setError] = useState("");

  const [history, setHistory] = useState([]);

  const [progress, setProgress] = useState(0);

  const [progressText, setProgressText] =
    useState("Preparing scanner…");

  useEffect(() => {
    try {
      setHistory(
        JSON.parse(
          localStorage.getItem("edible_history") ||
            "[]"
        )
      );
    } catch {}
  }, []);

  function saveHistory(item) {
    const next = [
      {
        name: item.name,
        emoji: item.emoji || "🍽️",
        score: item.score,
        type: item.type,
        date: new Date().toISOString(),
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

    const url = URL.createObjectURL(file);

    setPhoto({
      file,
      url,
    });

    if (mode === "meal") {
      setError(
        "Meal-photo recognition requires a vision model. Free scanning currently supports packaged-food nutrition labels."
      );

      setScreen("scan");

      return;
    }

    await analyzeLabel(file);
  }

  async function analyzeLabel(file) {
    setError("");

    setProgress(0);

    setProgressText("Loading free OCR…");

    setScreen("loading");

    try {
      const Tesseract = await loadTesseract();

      setProgressText("Reading nutrition label…");

      const output = await Tesseract.recognize(
        file,
        "eng",
        {
          logger: (message) => {
            if (
              message.status ===
              "recognizing text"
            ) {
              const percent = Math.round(
                (message.progress || 0) * 100
              );

              setProgress(percent);

              setProgressText(
                `Reading nutrition label… ${percent}%`
              );
            } else if (message.status) {
              setProgressText(
                message.status
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (letter) =>
                    letter.toUpperCase()
                  )
              );
            }
          },
        }
      );

      const rawText =
        output?.data?.text || "";

      console.log(
        "EDIBLE OCR TEXT:",
        rawText
      );

      const nutrition =
        parseNutrition(rawText);

      console.log(
        "EDIBLE NUTRITION:",
        nutrition
      );

      if (!hasEnoughNutrition(nutrition)) {
        throw new Error(
          "I couldn't read enough values. Take a close, straight photo showing the complete Nutrition Facts panel."
        );
      }

      const score =
        calculateScore(nutrition);

      const insights =
        buildInsights(nutrition);

      const confidence = clamp(
        Number(
          output?.data?.confidence || 0
        ) / 100,
        0,
        1
      );

      const scannedResult = {
        name: "Scanned Packaged Food",

        emoji: "🏷️",

        type: "packaged",

        serving:
          "Per visible label serving",

        score,

        nutrition,

        summary:
          "Edible read the nutrition label directly on your device and calculated this score using consistent scoring rules.",

        good: insights.good,

        know: insights.know,

        confidence,

        source: "device-ocr",
      };

      setResult(scannedResult);

      saveHistory(scannedResult);

      setScreen("result");
    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
          "Could not read this label. Try a clearer photo."
      );

      setScreen("scan");
    }
  }

  function openDemo(key) {
    const item = demoMap[key];

    setResult(item);

    saveHistory(item);

    setScreen("result");
  }

  function packagedDemo() {
    const item = {
      name: "Wholegrain Oat Crunch",
      emoji: "🌾",
      type: "packaged",
      serving: "1 serving",
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
      know: ["Moderate sodium"],
      confidence: 1,
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
          <h1>Scan any food.</h1>

          <p className="sub">
            Understand what’s inside in
            seconds.
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
                  ? "Nutrition label • Free device OCR"
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

              <strong>Scan Label</strong>

              <span>Free OCR</span>
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

              <strong>Compare</strong>

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

              <strong>History</strong>

              <span>
                Your scanned foods
              </span>
            </button>
          </div>

          <div className="sectionrow">
            <h3>Food Categories</h3>

            <span>Explore</span>
          </div>

          <div className="cats">
            {demoFoods.map(
              ([name, emoji, key]) => (
                <button
                  key={key}
                  className="cat"
                  onClick={() =>
                    openDemo(key)
                  }
                >
                  <em>{emoji}</em>

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
            {mode === "packaged"
              ? "Scan nutrition label"
              : "Scan food or a meal"}
          </h2>

          <p className="sub">
            {mode === "packaged"
              ? "Take a clear, straight photo of the Nutrition Facts panel."
              : "Free meal-photo recognition is not enabled yet."}
          </p>

          {photo?.url ? (
            <img
              className="preview"
              src={photo.url}
              alt="Selected food"
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
                {mode === "packaged"
                  ? "🏷️"
                  : "🍽️"}
              </div>

              <div className="camtext">
                <strong>
                  {mode === "packaged"
                    ? "Keep the full label inside the frame"
                    : "Meal scanning coming soon"}
                </strong>

                <br />

                <span>
                  {mode === "packaged"
                    ? "OCR runs directly on your device"
                    : "No paid AI is being used"}
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
            onClick={() => {
              if (mode === "meal") {
                openDemo("chapati");
              } else {
                packagedDemo();
              }
            }}
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

          {progress > 0 && (
            <div
              style={{
                width: "80%",
                maxWidth: 300,
                height: 9,
                borderRadius: 20,
                background: "#E6ECE8",
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
                    "width .25s ease",
                }}
              />
            </div>
          )}

          <p
            className="small"
            style={{
              marginTop: 18,
              textAlign: "center",
            }}
          >
            First scan may take a little
            longer while the free OCR
            engine loads.
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
                alt="Analyzed food"
              />
            )}

            <div className="card product">
              <div className="thumb">
                {result.emoji || "🍽️"}
              </div>

              <div>
                <div className="small">
                  {result.type ===
                  "packaged"
                    ? "Packaged food"
                    : "Food / Meal"}
                </div>

                <div className="pname">
                  {result.name}
                </div>

                <div className="small">
                  {result.serving ||
                    "Estimated portion"}
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
                      : result.score >= 6.5
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

                  <small>/10</small>
                </div>
              </div>

              <div className="badge">
                {result.score >= 9
                  ? "EXCELLENT"
                  : result.score >= 8
                  ? "VERY GOOD"
                  : result.score >= 6.5
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
                  {Math.round(
                    result.nutrition
                      .calories || 0
                  )}{" "}
                  kcal
                </span>

                <span className="pill">
                  💪{" "}
                  {result.nutrition
                    .protein_g || 0}
                  g protein
                </span>

                <span className="pill">
                  🌾{" "}
                  {result.nutrition
                    .fiber_g || 0}
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
                    {Math.round(
                      result.nutrition
                        .calories || 0
                    )}
                  </strong>
                </div>

                <div className="metric">
                  <small>
                    Protein
                  </small>

                  <strong>
                    {result.nutrition
                      .protein_g || 0}
                    g
                  </strong>
                </div>

                <div className="metric">
                  <small>
                    Carbs
                  </small>

                  <strong>
                    {result.nutrition
                      .carbs_g || 0}
                    g
                  </strong>
                </div>

                <div className="metric">
                  <small>Fat</small>

                  <strong>
                    {result.nutrition
                      .fat_g || 0}
                    g
                  </strong>
                </div>

                <div className="metric">
                  <small>
                    Fiber
                  </small>

                  <strong>
                    {result.nutrition
                      .fiber_g || 0}
                    g
                  </strong>
                </div>

                <div className="metric">
                  <small>
                    Sodium
                  </small>

                  <strong>
                    {Math.round(
                      result.nutrition
                        .sodium_mg || 0
                    )}
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
              <h3>Things to Know</h3>

              {(
                result.know || [
                  "No major concerns detected.",
                ]
              ).map((item, index) => (
                <p key={index}>
                  • {item}
                </p>
              ))}
            </div>

            {result.source ===
              "device-ocr" && (
              <div className="card softblue">
                <h3>
                  Free device scan 📱
                </h3>

                <p
                  className="small"
                  style={{
                    marginBottom: 0,
                  }}
                >
                  The label was read
                  directly on your device.
                  No paid OpenAI request
                  was used.
                </p>
              </div>
            )}

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
            Pick the better choice at a
            glance.
          </p>

          <div className="foodgrid">
            <div
              className="card"
              style={{
                margin: 0,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 42,
                }}
              >
                🌾
              </div>

              <strong>
                Oat Crunch
              </strong>

              <div
                className="score"
                style={{
                  fontSize: 37,
                  marginTop: 6,
                }}
              >
                8.7
              </div>
            </div>

            <div
              className="card"
              style={{
                margin: 0,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 42,
                }}
              >
                🍫
              </div>

              <strong>
                Protein Bar
              </strong>

              <div
                className="score"
                style={{
                  fontSize: 37,
                  marginTop: 6,
                }}
              >
                6.4
              </div>
            </div>
          </div>

          <div
            className="card softmint"
            style={{
              marginTop: 14,
            }}
          >
            <h3>
              Choose Oat Crunch 🏆
            </h3>

            <p>✓ Less sugar</p>

            <p>✓ More fiber</p>

            <p>
              ✓ Better overall nutrition
              profile
            </p>
          </div>
        </main>
      )}

      {screen === "history" && (
        <main>
          <h2>History</h2>

          <p className="sub">
            Your recent scans.
          </p>

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

                      <div className="small">
                        {item.type ===
                        "packaged"
                          ? "Packaged food"
                          : "Food / Meal"}
                      </div>
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
              <p
                className="sub"
                style={{
                  margin: 0,
                }}
              >
                No scans yet.
              </p>
            )}
          </div>
        </main>
      )}

      {screen === "explore" && (
        <main>
          <h2>Explore</h2>

          <p className="sub">
            Understand food without the
            lecture.
          </p>

          <div className="card softmint">
            <h3>
              Nutrition labels 🏷️
            </h3>

            <p>
              Scan the Nutrition Facts
              panel for a consistent Edible
              score.
            </p>
          </div>

          <div className="card softyellow">
            <h3>Fiber 🌾</h3>

            <p>
              Foods with more fiber often
              provide better fullness and
              nutritional quality.
            </p>
          </div>

          <div className="card softblue">
            <h3>Protein 💪</h3>

            <p>
              Protein contributes
              positively to Edible’s current
              prototype score.
            </p>
          </div>
        </main>
      )}

      {screen === "saved" && (
        <main>
          <h2>Saved</h2>

          <p className="sub">
            Your saved foods will appear
            here.
          </p>

          <div className="card softmint">
            <h3>♡ Saved foods</h3>

            <p>
              Saving individual scan
              results is coming next.
            </p>
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

          <p className="sub">
            Know what you eat.
          </p>

          <div className="card softmint">
            <h3>
              Free Scan Mode ✓
            </h3>

            <p>
              Nutrition-label OCR runs on
              your device without paid AI
              credits.
            </p>
          </div>

          <div className="card">
            <h3>
              Health score
            </h3>

            <p className="small">
              Scores are generated from
              Edible’s prototype
              deterministic nutrition
              formula. They are not medical
              advice.
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
