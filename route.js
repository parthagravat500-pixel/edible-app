import OpenAI from "openai";

export const runtime = "nodejs";

function clamp(n,a,b){ return Math.max(a,Math.min(b,n)); }

function deterministicScore(n, type){
  const protein=Number(n.protein_g||0);
  const fiber=Number(n.fiber_g||0);
  const sugar=Number(n.sugar_g||0);
  const sat=Number(n.saturated_fat_g||0);
  const sodium=Number(n.sodium_mg||0);
  const calories=Number(n.calories||0);

  let s = 7.0;
  s += Math.min(fiber,10)*0.18;
  s += Math.min(protein,25)*0.06;
  s -= Math.max(0,sugar-8)*0.08;
  s -= Math.max(0,sat-4)*0.12;
  s -= Math.max(0,sodium-350)*0.0015;
  if(type==="meal" && calories>850) s -= Math.min((calories-850)/500,1.2);
  return Number(clamp(s,0,10).toFixed(1));
}

function emojiFor(name=""){
  const s=name.toLowerCase();
  if(s.includes("chapati")||s.includes("roti")) return "🫓";
  if(s.includes("rice")) return "🍚";
  if(s.includes("dal")||s.includes("lentil")) return "🥣";
  if(s.includes("paneer")) return "🧀";
  if(s.includes("salad")) return "🥗";
  if(s.includes("fruit")) return "🍎";
  if(s.includes("oat")) return "🌾";
  return "🍽️";
}

export async function POST(req){
  try{
    if(!process.env.OPENAI_API_KEY){
      return Response.json({error:"OPENAI_API_KEY is not configured on the server."},{status:500});
    }
    const form=await req.formData();
    const file=form.get("image");
    const mode=form.get("mode")==="packaged"?"packaged":"meal";
    if(!file) return Response.json({error:"No image received."},{status:400});

    const bytes=Buffer.from(await file.arrayBuffer());
    const mime=file.type||"image/jpeg";
    const dataUrl=`data:${mime};base64,${bytes.toString("base64")}`;

    const openai=new OpenAI({apiKey:process.env.OPENAI_API_KEY});
    const instructions = mode==="packaged"
      ? `Analyze this packaged food image. Identify the product if visible, read any nutrition/ingredient information that is legible, and estimate missing nutrition only when necessary.`
      : `Analyze this photo of cooked/raw food or a meal. Identify all visible food items, estimate a realistic serving/portion, and estimate nutrition for the full visible serving.`;

    const prompt = `${instructions}
Return ONLY valid JSON, no markdown:
{
 "name": string,
 "type": "${mode}",
 "serving": string,
 "nutrition": {
   "calories": number,
   "protein_g": number,
   "carbs_g": number,
   "fat_g": number,
   "saturated_fat_g": number,
   "fiber_g": number,
   "sugar_g": number,
   "sodium_mg": number
 },
 "summary": string,
 "good": [string, string, string],
 "know": [string, string],
 "confidence": number
}
Rules:
- confidence must be 0 to 1.
- For meals, clearly estimate rather than imply laboratory precision.
- For packaged food, use visible label values when readable.
- Do not make medical claims.
- Do not invent carcinogenic claims.
- Keep summary plain, friendly and concise.`;

    const response=await openai.responses.create({
      model:"gpt-5.6-terra",
      input:[{
        role:"user",
        content:[
          {type:"input_text",text:prompt},
          {type:"input_image",image_url:dataUrl}
        ]
      }]
    });

    let text=response.output_text?.trim()||"";
    text=text.replace(/^```json\s*/i,"").replace(/```$/,"").trim();
    const data=JSON.parse(text);

    data.type=mode;
    data.score=deterministicScore(data.nutrition||{},mode);
    data.emoji=emojiFor(data.name);
    return Response.json(data);
  }catch(err){
    console.error(err);
    return Response.json({error:"Could not analyze this image. Try a clearer photo with the full label or plate visible."},{status:500});
  }
}
