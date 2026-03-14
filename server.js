const express = require("express");

const app = express();

app.use(require("cors")());
app.use(express.json());

const API_KEY = "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";

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
          model: "deepseek/deepseek-chat",
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

app.listen(3000,()=>{

  console.log("AI server running (OpenRouter)");

});