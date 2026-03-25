const express = require("express");
require("dotenv").config();
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();

app.use(express.static(__dirname));
app.use(cors());
app.use(express.json());

const API_KEY = process.env.OPENROUTER_API_KEY;
const PORT = process.env.PORT || 3000;


/* ======================================
   AI CHAT (ของเดิม)
====================================== */

app.post("/api/ai", async (req,res)=>{

  try{

    const message = req.body.message;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method:"POST",
        headers:{
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type":"application/json"
        },
        body: JSON.stringify({
          model:"openai/gpt-4o-mini",
          messages:[
            {
              role:"system",
              content:"คุณคือผู้ช่วยด้านอาหารและโภชนาการ ตอบเป็นภาษาไทย"
            },
            {
              role:"user",
              content:message
            }
          ]
        })
      }
    );

    const data = await response.json();

    console.log("AI CHAT RAW:",data);

    if(!data.choices){
      return res.json({
        reply:"AI API error",
        raw:data
      });
    }

    res.json({
      reply:data.choices[0].message.content
    });

  }catch(err){

    console.log(err);

    res.json({
      reply:"AI server error"
    });

  }

});


/* ======================================
   FOOD IMAGE ANALYSIS
====================================== */

app.post("/api/food-ai", async (req,res)=>{

  try{

    const image = req.body.image;

    // ⭐ debug ดูว่ารูปที่ส่งมาถูกไหม
    console.log("IMAGE HEAD:", image.substring(0,50));

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method:"POST",
        headers:{
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type":"application/json"
        },
        body: JSON.stringify({
          model:"openai/gpt-4o-mini",
          max_tokens:150,
          messages:[
            {
              role:"system",
              content:"วิเคราะห์อาหารจากรูป และตอบ JSON เท่านั้น ห้ามมีข้อความอื่น format: {food_name, calories, protein, carbs, fat}"
            },
            {
              role:"user",
              content:[
                {
                  type:"text",
                  text:"อาหารในรูปคืออะไร และมีสารอาหารเท่าไหร่"
                },
                {
                  type:"image_url",
                  image_url:{
                    url:image
                  }
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    // ⭐ log raw response
    console.log("OPENROUTER RAW:",data);

    if(!data.choices){
      return res.json({
        error:"AI response invalid",
        raw:data
      });
    }

    let aiText = data.choices[0].message.content;

    console.log("AI TEXT BEFORE CLEAN:", aiText);

    // ⭐ ลบ ```json และ ```
    aiText = aiText.replace(/```json/g,"")
                   .replace(/```/g,"")
                   .trim();

    console.log("AI TEXT CLEAN:", aiText);

    let ai;

    try{

      ai = JSON.parse(aiText);

      console.log("AI JSON PARSED:", ai);

    }catch(err){

      console.log("JSON PARSE ERROR:", err);

      ai = {
        food_name:"Unknown food",
        calories:0,
        protein:0,
        carbs:0,
        fat:0,
        raw:aiText
      };

    }

    res.json(ai);

  }catch(err){

    console.log("SERVER ERROR:", err);

    res.json({
      error:"AI analyze error"
    });

  }

});


const fs = require("fs");

const USERS_FILE = "users.json";

function loadUsers(){
  if(!fs.existsSync(USERS_FILE)) return [];
  return JSON.parse(fs.readFileSync(USERS_FILE));
}

function saveUsers(users){
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

/* ===========================
   REGISTER
=========================== */
app.post("/api/register",(req,res)=>{

  const {username, password, email} = req.body;

  let users = loadUsers();

  const exist = users.find(u => u.username === username);

  if(exist){
    return res.json({message:"ชื่อผู้ใช้ซ้ำ"});
  }

  users.push({username, password, email});
  saveUsers(users);

  res.json({message:"สมัครสำเร็จ", email});
});

/* ===========================
   LOGIN
=========================== */
app.post("/api/login",(req,res)=>{

  const {username, password} = req.body;

  let users = loadUsers();

  const user = users.find(
    u => u.username === username && u.password === password
  );

  if(user){
    res.json({
      success:true,
      email:user.email
    });
  }else{
    res.json({success:false});
  }

});

/* ======================================
   START SERVER
====================================== */

app.listen(PORT, ()=>{
  console.log("AI server running on port",PORT);
});