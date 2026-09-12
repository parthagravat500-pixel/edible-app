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

function valueNearLabel(lines, patterns, unit = "") {
  const index = lines.findIndex((line) =>
    patterns.some((pattern) =>
      pattern.test(line)
    )
  );

  if (index < 0) return 0;

  let cleaned = lines[index];

  for (const pattern of patterns) {
    cleaned = cleaned.replace(pattern, " ");
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

  let match = cleaned.match(regex);

  if (match) {
    return numberFrom(match[1]);
  }

  for (
    let i = index + 1;
    i <= Math.min(index + 2, lines.length - 1);
    i++
  ) {
    match = lines[i].match(regex);

    if (match) {
      return numberFrom(match[1]);
    }
  }

  return 0;
}

function parseCalories(lines) {
  const index = lines.findIndex((line) =>
    /\b(calories|energy)\b/i.test(line)
  );

  if (index < 0) return 0;

  const sameLine = lines[index].match(
    /(?:calories|energy)\D*(\d{2,4})/i
  );

  if (sameLine) {
    return numberFrom(sameLine[1]);
  }

  for (
    let i = index + 1;
    i <= Math.min(index + 3, lines.length - 1);
    i++
  ) {
    const match =
      lines[i].match(/\b(\d{2,4})\b/);

    if (match) {
      return numberFrom(match[1]);
    }
  }

  return 0;
}

function parseNutrition(text) {
  const lines = getLines(text);

  return {
    calories: parseCalories(lines),

    protein_g: valueNearLabel(
      lines,
      [/protein/i],
      "g"
    ),

    carbs_g: valueNearLabel(
      lines,
      [
        /total\s*carb(?:ohydrate)?s?\.?/i,
        /carbohydrates?/i,
      ],
      "g"
    ),

    fat_g: valueNearLabel(
      lines,
      [/total\s*fat/i],
      "g"
    ),

    saturated_fat_g: valueNearLabel(
      lines,
      [
        /saturated\s*fat/i,
        /sat\.?\s*fat/i,
      ],
      "g"
    ),

    fiber_g: valueNearLabel(
      lines,
      [
        /dietary\s*fib(?:er|re)/i,
        /\bfib(?:er|re)\b/i,
      ],
      "g"
    ),

    sugar_g: valueNearLabel(
      lines,
      [
        /total\s*sugars?/i,
        /\bsugars?\b/i,
      ],
      "g"
    ),

    sodium_mg: valueNearLabel(
      lines,
      [/sodium/i],
      "mg"
    ),
  };
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
    n.sugar_g >= 0 &&
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
      "Nutrition values verified before scoring"
    );
  }

  if (!know.length) {
    know.push(
      "Serving size and ingredients can add important context"
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

    const existing =
      document.getElementById(
        "edible-tesseract"
      );

    if (existing) {
      existing.onload = () =>
        resolve(window.Tesseract);

      existing.onerror = reject;

      return;
    }

    const script =
      document.createElement("script");

    script.id = "edible-tesseract";

    script.src =
      "https://cdn.jsdelivr.net/npm/tesseract.js@6/dist/tesseract.min.js";

    script.async = true;

    script.onload = () => {
      if (window.Tesseract) {
        resolve(window.Tesseract);
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
          "Could not load free OCR."
        )
      );

    document.head.appendChild(script);
  });
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

  const [progressText, setProgressText] =
    useState("Preparing scanner…");

  const [draftNutrition, setDraftNutrition] =
    useState({
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      saturated_fat_g: 0,
      fiber_g: 0,
      sugar_g: 0,
      sodium_mg: 0,
    });

  const [serving, setServing] =
    useState("Per serving");

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

    const url =
      URL.createObjectURL(file);

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

  async function analyzeLabel(file) {
    setError("");
    setProgress(0);
    setScreen("loading");

    try {
      const Tesseract =
        await loadTesseract();

      setProgressText(
        "Reading nutrition label…"
      );

      const response =
        await Tesseract.recognize(
          file,
          "eng",
          {
            logger: (message) => {
              if (
                message.status ===
                "recognizing text"
              ) {
                const percent =
                  Math.round(
                    (message.progress || 0) *
                      100
                  );

                setProgress(percent);

                setProgressText(
                  `Reading nutrition label… ${percent}%`
                );
              }
            },
          }
        );

      const rawText =
        response?.data?.text || "";

      console.log(
        "EDIBLE OCR:",
        rawText
      );

      const nutrition =
        parseNutrition(rawText);

      setDraftNutrition(nutrition);

      setScreen("verify");
    } catch (err) {
      console.error(err);

      setError(
        "Could not read this label. Try another photo."
      );

      setScreen("scan");
    }
  }

  function updateField(key, value) {
    setDraftNutrition((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function finishVerification() {
    const nutrition = {
      calories:
        Number(draftNutrition.calories) || 0,

      protein_g:
        Number(draftNutrition.protein_g) || 0,

      carbs_g:
        Number(draftNutrition.carbs_g) || 0,

      fat_g:
        Number(draftNutrition.fat_g) || 0,

      saturated_fat_g:
        Number(
          draftNutrition.saturated_fat_g
        ) || 0,

      fiber_g:
        Number(draftNutrition.fiber_g) || 0,

      sugar_g:
        Number(draftNutrition.sugar_g) || 0,

      sodium_mg:
        Number(draftNutrition.sodium_mg) || 0,
    };

    if (
      !nutrition.calories ||
      !nutrition.carbs_g ||
      !nutrition.fat_g ||
      !nutrition.protein_g
    ) {
      setError(
        "Please verify Calories, Protein, Carbs and Fat before continuing."
      );

      return;
    }

    const score =
      calculateScore(nutrition);

    const insights =
      buildInsights(nutrition);

    const scanned = {
      name: "Scanned Packaged Food",
      emoji: "🏷️",
      type: "packaged",
      serving,
      score,
      nutrition,
      summary:
        "You verified the nutrition values before Edible calculated this score.",
      good: insights.good,
      know: insights.know,
      source: "verified-user-scan",
    };

    setResult(scanned);

    saveHistory(scanned);

    setError("");

    setScreen("result");
  }

  function openDemo(key) {
    const item =
      demoMap[key];

    setResult(item);

    saveHistory(item);

    setScreen("result");
  }

  function packagedDemo() {
    setDraftNutrition({
      calories: 150,
      protein_g: 2,
      carbs_g: 15,
      fat_g: 10,
      saturated_fat_g: 1.5,
      fiber_g: 1,
      sugar_g: 1,
      sodium_mg: 220,
    });

    setServing(
      "About 17 chips (28g)"
    );

    setScreen("verify");
  }

  const fields = [
    {
      key: "calories",
      label: "Calories",
      unit: "kcal",
      step: "1",
    },
    {
      key: "protein_g",
      label: "Protein",
      unit: "g",
      step: "0.1",
    },
    {
      key: "carbs_g",
      label: "Carbs",
      unit: "g",
      step: "0.1",
    },
    {
      key: "fat_g",
      label: "Fat",
      unit: "g",
      step: "0.1",
    },
    {
      key: "saturated_fat_g",
      label: "Saturated Fat",
      unit: "g",
      step: "0.1",
    },
    {
      key: "fiber_g",
      label: "Fiber",
      unit: "g",
      step: "0.1",
    },
    {
      key: "sugar_g",
      label: "Sugar",
      unit: "g",
      step: "0.1",
    },
    {
      key: "sodium_mg",
      label: "Sodium",
      unit: "mg",
      step: "1",
    },
  ];

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
                  ? "Scan • Verify • Score"
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
                Verify before score
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
            Scan nutrition label
          </h2>

          <p className="sub">
            Take a clear photo. You’ll
            verify the detected numbers
            before the score is calculated.
          </p>

          {photo?.url ? (
            <img
              className="preview"
              src={photo.url}
              alt="Selected nutrition label"
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
                  Edible will fill the values
                  for you to verify
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
            onClick={packagedDemo}
          >
            Try Verification Demo
          </button>
        </main>
      )}

      {screen === "loading" && (
        <main className="loading">
          <div className="spinner" />

          <h2>
            Reading your label
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
        </main>
      )}

      {screen === "verify" && (
        <main>
          <button
            className="back"
            onClick={() =>
              setScreen("scan")
            }
          >
            ← Scanner
          </button>

          <h2>
            Verify nutrition
          </h2>

          <p className="sub">
            Check these against the label.
            Tap any number to correct it.
          </p>

          {photo?.url && (
            <img
              className="preview"
              src={photo.url}
              alt="Nutrition label"
            />
          )}

          <div
            className="card softyellow"
          >
            <h3>
              Quick check 👀
            </h3>

            <p
              className="small"
              style={{
                marginBottom: 0,
              }}
            >
              OCR can make mistakes, especially
              on labels with multiple columns.
              Edible only scores the values
              after you confirm them.
            </p>
          </div>

          <div className="card">
            <h3>
              Serving
            </h3>

            <input
              value={serving}
              onChange={(e) =>
                setServing(e.target.value)
              }
              style={{
                width: "100%",
                border: "1px solid var(--line)",
                borderRadius: 14,
                padding: 14,
                fontSize: 16,
                background: "#F8F8F5",
              }}
            />
          </div>

          <div className="card">
            <h3>
              Nutrition values
            </h3>

            <div className="metrics">
              {fields.map((field) => (
                <div
                  className="metric"
                  key={field.key}
                >
                  <small>
                    {field.label}
                  </small>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <input
                      type="number"
                      inputMode="decimal"
                      step={field.step}
                      value={
                        draftNutrition[
                          field.key
                        ]
                      }
                      onChange={(e) =>
                        updateField(
                          field.key,
                          e.target.value
                        )
                      }
                      style={{
                        width: "100%",
                        border: 0,
                        outline: 0,
                        background:
                          "transparent",
                        fontWeight: 900,
                        fontSize: 24,
                        color:
                          "var(--ink)",
                      }}
                    />

                    <strong
                      style={{
                        fontSize: 15,
                      }}
                    >
                      {field.unit}
                    </strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="error">
              {error}
            </div>
          )}

          <button
            className="primary"
            style={{
              width: "100%",
              padding: 17,
              marginTop: 5,
            }}
            onClick={finishVerification}
          >
            ✓ Values Look Correct
          </button>

          <button
            className="secondary"
            style={{
              width: "100%",
              marginTop: 10,
            }}
            onClick={() =>
              setScreen("scan")
            }
          >
            Rescan Label
          </button>
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
                Verified nutrition
              </h3>

              <div className="metrics">
                {fields.map((field) => (
                  <div
                    className="metric"
                    key={field.key}
                  >
                    <small>
                      {field.label}
                    </small>

                    <strong>
                      {
                        result.nutrition[
                          field.key
                        ]
                      }
                      {field.unit}
                    </strong>
                  </div>
                ))}
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
                Verified by you ✓
              </h3>

              <p
                className="small"
                style={{
                  marginBottom: 0,
                }}
              >
                The score was calculated only
                after you confirmed the label
                values.
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
              Better accuracy ✓
            </h3>

            <p>
              Edible lets you verify OCR
              values before calculating a
              health score.
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
              OCR runs on your device and
              you verify the values before
              scoring.
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
