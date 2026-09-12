 "use client";
import { useEffect, useState } from "react";

const demoFoods = [
  ["Chapati","🫓","chapati"],["Rice","🍚","rice"],["Dal","🥣","dal"],["Paneer","🧀","paneer"],["Salad","🥗","salad"],["Fruit","🍎","fruit"]
];

const demoMap = {
  chapati:{name:"Chapati / Roti",emoji:"🫓",type:"meal",serving:"2 medium",score:8.4,nutrition:{calories:240,protein_g:7,carbs_g:46,fat_g:4,fiber_g:6,sugar_g:2,sodium_mg:180},summary:"Good whole-wheat carbohydrate with useful fiber.",good:["Whole-grain carbohydrate","Useful fiber","Easy to pair with protein"],know:["Added ghee or oil changes nutrition"],confidence:0.95},
  rice:{name:"Cooked White Rice",emoji:"🍚",type:"meal",serving:"1 cup cooked",score:6.8,nutrition:{calories:205,protein_g:4.3,carbs_g:45,fat_g:0.4,fiber_g:0.6,sugar_g:0.1,sodium_mg:2},summary:"Useful energy, but low in fiber and protein on its own.",good:["Simple carbohydrate source","Low fat"],know:["Low fiber","Best paired with dal or vegetables"],confidence:0.95},
  dal:{name:"Dal",emoji:"🥣",type:"meal",serving:"1 cup",score:9.0,nutrition:{calories:220,protein_g:12,carbs_g:34,fat_g:4,fiber_g:8,sugar_g:4,sodium_mg:320},summary:"Strong plant-protein and fiber profile.",good:["Good plant protein","High fiber","Mineral-rich"],know:["Sodium and oil depend on recipe"],confidence:0.95},
  paneer:{name:"Paneer Curry",emoji:"🧀",type:"meal",serving:"1 bowl",score:7.5,nutrition:{calories:330,protein_g:18,carbs_g:12,fat_g:24,fiber_g:2,sugar_g:5,sodium_mg:420},summary:"Good protein and calcium; preparation can raise saturated fat.",good:["Good protein","Calcium source"],know:["Can be high in saturated fat","Gravy and oil matter"],confidence:0.9},
  salad:{name:"Mixed Salad",emoji:"🥗",type:"meal",serving:"1 bowl",score:9.3,nutrition:{calories:110,protein_g:4,carbs_g:18,fat_g:3,fiber_g:6,sugar_g:8,sodium_mg:120},summary:"High vegetable content and good fiber density.",good:["High vegetable content","Fiber-rich","Low energy density"],know:["Dressings can add sodium and fat"],confidence:0.9},
  fruit:{name:"Fruit Bowl",emoji:"🍎",type:"meal",serving:"1 bowl",score:9.1,nutrition:{calories:140,protein_g:2,carbs_g:35,fat_g:1,fiber_g:6,sugar_g:25,sodium_mg:5},summary:"Whole fruit provides fiber, hydration and micronutrients.",good:["Whole-food fiber","Micronutrients","Hydrating"],know:["Natural sugar is still part of total carbohydrate"],confidence:0.9}
};

export default function Page(){
  const [screen,setScreen]=useState("home");
  const [mode,setMode]=useState("packaged");
  const [photo,setPhoto]=useState(null);
  const [result,setResult]=useState(null);
  const [error,setError]=useState("");
  const [history,setHistory]=useState([]);

  useEffect(()=>{
    try{setHistory(JSON.parse(localStorage.getItem("edible_history")||"[]"))}catch{}
  },[]);

  function saveHistory(r){
    const h=[{name:r.name,emoji:r.emoji||"🍽️",score:r.score,type:r.type,date:new Date().toISOString()},...history].slice(0,20);
    setHistory(h);
    localStorage.setItem("edible_history",JSON.stringify(h));
  }

  function choosePhoto(file){
    if(!file)return;
    const url=URL.createObjectURL(file);
    setPhoto({file,url});
    analyze(file);
  }

  async function analyze(file){
    setError("");
    setScreen("loading");
    try{
      const fd=new FormData();
      fd.append("image",file);
      fd.append("mode",mode);
      const res=await fetch("/api/analyze",{method:"POST",body:fd});
      const data=await res.json();
      if(!res.ok) throw new Error(data.error||"Analysis failed");
      setResult(data);
      saveHistory(data);
      setScreen("result");
    }catch(e){
      setError(e.message);
      setScreen("scan");
    }
  }

  function openDemo(k){
    const r=demoMap[k];
    setResult(r); saveHistory(r); setScreen("result");
  }

  return <div className="app">
    <header className="top">
      <div><div className="brand">edible</div>{screen==="home"&&<div className="tag">Know what you eat.</div>}</div>
      <button className="settings" onClick={()=>setScreen("profile")}>⚙</button>
    </header>

    {screen==="home" && <main>
      <h1>Scan any food.</h1>
      <p className="sub">Understand what’s inside in seconds.</p>
      <div className="modebar">
        <button className={"modepill "+(mode==="packaged"?"active":"")} onClick={()=>setMode("packaged")}>Packaged Food</button>
        <button className={"modepill "+(mode==="meal"?"active":"")} onClick={()=>setMode("meal")}>Food / Meal</button>
      </div>
      <button className="hero" onClick={()=>setScreen("scan")}>
        <div className="camcircle">{mode==="packaged"?"📷":"🍽️"}</div>
        <div className="herobottom"><strong>{mode==="packaged"?"Scan Food":"Scan a Meal"}</strong><span>{mode==="packaged"?"Ingredients • Nutrition • Front label":"Photo estimate • Nutrition • Meal score"}</span></div>
      </button>
      <div className="quick">
        <button className="q" onClick={()=>{setMode("packaged");setScreen("scan")}}><div className="qicon">▦</div><strong>Barcode</strong><span>Instant product info</span></button>
        <button className="q" onClick={()=>setScreen("compare")}><div className="qicon">⇄</div><strong>Compare</strong><span>Find the better choice</span></button>
        <button className="q" onClick={()=>setScreen("history")}><div className="qicon">◷</div><strong>History</strong><span>Your scanned foods</span></button>
      </div>
      <div className="sectionrow"><h3>Food Categories</h3><span>See all</span></div>
      <div className="cats">{demoFoods.map(([n,e,k])=><button key={k} className="cat" onClick={()=>openDemo(k)}><em>{e}</em>{n}</button>)}</div>
      <div className="impact"><div className="avo">🥑</div><div><strong>Small choices. Big impact.</strong><p>Make smarter food choices, one scan at a time.</p></div></div>
    </main>}

    {screen==="scan" && <main>
      <button className="back" onClick={()=>setScreen("home")}>← Home</button>
      <h2>{mode==="packaged"?"Scan packaged food":"Scan food or a meal"}</h2>
      <p className="sub">{mode==="packaged"?"Nutrition panel, ingredients, barcode or front label.":"Chapati, rice, dal, sabzi, fruit, restaurant dishes and more."}</p>
      {photo?.url ? <img className="preview" src={photo.url} alt="Selected food"/> :
      <div className="camera"><div className="frame"></div><div className="line"></div><div style={{fontSize:46}}>{mode==="packaged"?"📦":"🍽️"}</div><div className="camtext"><strong>{mode==="packaged"?"Keep the label inside the frame":"Keep the full plate visible"}</strong><br/><span>{mode==="packaged"?"Edible will read the package":"Photo nutrition is estimated"}</span></div></div>}
      <div className="actions">
        <label className="primary file">Take Photo<input type="file" accept="image/*" capture="environment" onChange={e=>choosePhoto(e.target.files?.[0])}/></label>
        <label className="secondary file">Upload Photo<input type="file" accept="image/*" onChange={e=>choosePhoto(e.target.files?.[0])}/></label>
      </div>
      {error && <div className="error">{error}</div>}
      <button className="secondary" style={{width:"100%",marginTop:10}} onClick={()=>mode==="meal"?openDemo("chapati"):setResult({
        name:"Wholegrain Oat Crunch",emoji:"🌾",type:"packaged",serving:"400 g",score:8.7,
        nutrition:{calories:370,protein_g:12,carbs_g:62,fat_g:7,fiber_g:10,sugar_g:4,sodium_mg:210},
        summary:"High fiber, simple ingredients and no added sugar.",good:["High fiber","Wholegrain base","No added sugar"],know:["Moderate sodium"],confidence:1
      }) || setScreen("result")}>Try Demo Scan</button>
    </main>}

    {screen==="loading" && <main className="loading"><div className="spinner"></div><h2>Understanding your food</h2><p className="sub">Identifying food, estimating portions and calculating your score…</p></main>}

    {screen==="result" && result && <main>
      <button className="back" onClick={()=>setScreen("scan")}>← Scanner</button>
      {photo?.url && <img className="preview" src={photo.url} alt="Analyzed food"/>}
      <div className="card product"><div className="thumb">{result.emoji||"🍽️"}</div><div><div className="small">{result.type==="packaged"?"Packaged food":"Food / Meal"}</div><div className="pname">{result.name}</div><div className="small">{result.serving||"Estimated portion"}</div></div></div>
      <div className="card scorebox">
        <div className="ring" style={{background:`conic-gradient(${result.score>=8?"var(--leaf)":result.score>=6.5?"#F1C94E":"#E48A56"} ${result.score*10}%,#EDF0EB 0)`}}><div className="scoreinner"><div className="score">{Number(result.score).toFixed(1)}</div><small>/10</small></div></div>
        <div className="badge">{result.score>=9?"EXCELLENT":result.score>=8?"VERY GOOD":result.score>=6.5?"GOOD":"FAIR"}</div>
        <p className="sub" style={{margin:"13px 0"}}>{result.summary}</p>
        <div className="pills"><span className="pill">🔥 {Math.round(result.nutrition.calories)} kcal</span><span className="pill">💪 {result.nutrition.protein_g}g protein</span><span className="pill">🌾 {result.nutrition.fiber_g}g fiber</span></div>
      </div>
      <div className="card"><h3>Nutrition {result.type==="meal"?"estimate":"information"}</h3><div className="metrics">
        <div className="metric"><small>Calories</small><strong>{Math.round(result.nutrition.calories)}</strong></div>
        <div className="metric"><small>Protein</small><strong>{result.nutrition.protein_g}g</strong></div>
        <div className="metric"><small>Carbs</small><strong>{result.nutrition.carbs_g}g</strong></div>
        <div className="metric"><small>Fat</small><strong>{result.nutrition.fat_g}g</strong></div>
        <div className="metric"><small>Fiber</small><strong>{result.nutrition.fiber_g}g</strong></div>
        <div className="metric"><small>Sodium</small><strong>{Math.round(result.nutrition.sodium_mg)}mg</strong></div>
      </div></div>
      <div className="card softmint"><h3>What’s Good Here? 🌱</h3>{(result.good||[]).map((x,i)=><p key={i} style={i===(result.good?.length||0)-1?{marginBottom:0}:{}}>✓ {x}</p>)}</div>
      <div className="card softyellow"><h3>Things to Know</h3>{(result.know||["No major concerns detected."]).map((x,i)=><p key={i} style={i===(result.know?.length||1)-1?{marginBottom:0}:{}}>• {x}</p>)}</div>
      {result.type==="meal" && <div className="card softblue"><h3>Photo estimate confidence</h3><p className="small" style={{marginBottom:0}}>{Math.round((result.confidence||0.7)*100)}% confidence. Recipe, hidden oil and exact portion weight can change the real nutrition.</p></div>}
      <button className="primary" style={{width:"100%"}} onClick={()=>{setPhoto(null);setScreen("scan")}}>Scan Another</button>
    </main>}

    {screen==="compare" && <main>
      <button className="back" onClick={()=>setScreen("home")}>← Home</button><h2>Compare</h2><p className="sub">Pick the better choice at a glance.</p>
      <div className="foodgrid"><div className="card" style={{margin:0,textAlign:"center"}}><div style={{fontSize:42}}>🌾</div><strong>Oat Crunch</strong><div className="score" style={{fontSize:37,marginTop:6}}>8.7</div></div><div className="card" style={{margin:0,textAlign:"center"}}><div style={{fontSize:42}}>🍫</div><strong>Protein Bar</strong><div className="score" style={{fontSize:37,marginTop:6}}>6.4</div></div></div>
      <div className="card softmint" style={{marginTop:14}}><h3>Choose Oat Crunch 🏆</h3><p>✓ Less added sugar</p><p>✓ More fiber</p><p style={{marginBottom:0}}>✓ Better ingredient profile</p></div>
    </main>}

    {screen==="history" && <main><h2>History</h2><p className="sub">Your recent scans.</p><div className="card">{history.length?history.map((x,i)=><div className="historyrow" key={i}><div className="thumb" style={{width:55,height:55,fontSize:28}}>{x.emoji}</div><div><strong>{x.name}</strong><div className="small">{x.type==="packaged"?"Packaged food":"Food / Meal"}</div></div><div className="hscore">{Number(x.score).toFixed(1)}</div></div>):<p className="sub" style={{margin:0}}>No scans yet.</p>}</div></main>}

    {screen==="explore" && <main><h2>Explore</h2><p className="sub">Understand food without the lecture.</p><div className="card softmint"><h3>Balanced meals 🍽️</h3><p className="small" style={{marginBottom:0}}>Protein, vegetables and appropriate carbohydrates usually make a stronger meal.</p></div><div className="card softyellow"><h3>Photo estimates 📷</h3><p className="small" style={{marginBottom:0}}>Meal photos are approximate because recipes, hidden oil and weights may be unknown.</p></div><div className="card softblue"><h3>Packaged labels 🏷️</h3><p className="small" style={{marginBottom:0}}>Declared nutrition data enables more precise scoring.</p></div></main>}

    {screen==="profile" && <main><h2>Your preferences</h2><p className="sub">Optional. Health Score stays universal.</p><div className="card"><div className="pills" style={{flexWrap:"wrap"}}><span className="pill">💪 More Protein</span><span className="pill">🌾 More Fiber</span><span className="pill">🍬 Less Sugar</span><span className="pill">❤️ Less Sodium</span><span className="pill">🌱 Vegetarian</span></div></div><div className="card softblue"><h3>Health Score vs Fit for You</h3><p className="small" style={{marginBottom:0}}>Health Score rates the food. Fit for You can reflect your personal goals separately.</p></div></main>}

    <nav className="nav">
      <button className={screen==="home"?"on":""} onClick={()=>setScreen("home")}>⌂<small>Home</small></button>
      <button className={screen==="explore"?"on":""} onClick={()=>setScreen("explore")}>⌕<small>Explore</small></button>
      <button className={screen==="history"?"on":""} onClick={()=>setScreen("history")}>♡<small>Saved</small></button>
      <button className={screen==="profile"?"on":""} onClick={()=>setScreen("profile")}>◉<small>Profile</small></button>
    </nav>
  </div>
}
