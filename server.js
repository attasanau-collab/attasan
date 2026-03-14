const express = require("express");
require("dotenv").config();
const cors = require("cors");

const app = express();

app.use(express.static(__dirname));
app.use(cors());
app.use(express.json());

const API_KEY = process.env.OPENROUTER_API_KEY;

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
          model: "google/gemini-2.0-flash",
          messages:[
            {
              role:"system",
              content:"คุณคือผู้ช่วยด้านอาหารและโภชนาการ ตอบเป็นภาษาไทยเสมอ และห้ามใช้ Markdown เช่น ** หรือ * หรือ # ให้ตอบเป็นข้อความธรรมดา จัดบรรทัดให้อ่านง่าย"
            },
            {
              role:"user",
              content: message
            }
          ]
        })
      }
    );

    const data = await response.json();

    console.log(data);

    if(data.choices){

      res.json({
        reply:data.choices[0].message.content
      });

    }else{

      res.json({
        reply:"AI API error"
      });

    }

  }catch(err){

    console.log(err);

    res.json({
      reply:"AI server error"
    });

  }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("AI server running");
});