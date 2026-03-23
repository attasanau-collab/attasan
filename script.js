function updateThaiDate(){
  const now = new Date();

  const months = [
    "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน",
    "พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม",
    "กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"
  ];

  const day = now.getDate();
  const month = months[now.getMonth()];
  const year = now.getFullYear() + 543; // ปี พ.ศ.

  document.getElementById("todayDate").innerText =
    `${day} ${month} ${year}`;
}

updateThaiDate();

window.onload = function(){

  // ⭐ โหลดค่า goal จากเครื่อง
  calorieGoal = Number(localStorage.getItem("goalCal")) || 2000;

  // ⭐ ใส่ค่า goal ตอนโหลด
  document.getElementById("goalCalText").innerText = calorieGoal;
  updateFoodSummary();
  loadWaterByDate(getLocalDate()); // ⭐ เพิ่มอันนี้
  generateCups();          // ⭐ เพิ่ม
  syncCupsFromWater();     // ⭐ เพิ่ม
}

// ===== GLOBAL VARIABLES =====

// CALORIE
calorieGoal = Number(goalCal.value);
let foodCalories = 0;
let activityCalories = 0;

// MACRO
let carbGoal = 146;
let proteinGoal = 195;
let fatGoal = 65;

let carbNow = 0;
let proteinNow = 0;
let fatNow = 0;

// WATER
let waterGoal = 2000;
let waterNow = 0;
let waterPerCup = 250;

// เช่น 2026-03-21
function getLocalDate(){
  const d = new Date();

  const year = d.getFullYear();
  const month = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');

  return `${year}-${month}-${day}`;
}

let selectedDate = getLocalDate();

function showPage(id){

  document.querySelectorAll('.page')
    .forEach(p=>p.classList.remove('active'));

  document.getElementById(id)
    .classList.add('active');

  const titles = {
    dashboard: "แดชบอร์ด",
    diary: "ไดอารี่",
    page3: "ข้อมูลเชิงลึก", // ⭐ เพิ่ม
    page4: "บัญชี" // ⭐ เพิ่ม
  };

  document.getElementById("pageTitle").innerText =
    titles[id] || "";

  if(id === "diary"){
    highlightDiaryToday();
    generateCups();
    loadWaterByDate(selectedDate); // ⭐ เพิ่มตัวนี้
    updateDiaryWaterRing();

  }

  // ⭐ เพิ่มตรงนี้
  if(id === "page3"){
    generateCalendarStrip();
    updateInsights();
    loadWaterByDate(getLocalDate()); // ⭐ เพิ่ม
    generateCups(); // ⭐ เพิ่ม
    syncCupsFromWater(); // ⭐ เพิ่ม
  }
}



/* Donut helper */
function macro(id,value){
  return new Chart(document.getElementById(id),{
    type:'doughnut',
    data:{datasets:[{data:[value,100-value]}]},
    options:{
      plugins:{legend:{display:false}},
      cutout:'70%'
    }
  });
}

/* หน้า 1 */
const carbChartObj = macro("carbChart",0);
const proteinChartObj = macro("proteinChart",0);
const fatChartObj = macro("fatChart",0);

/***********************
  ระบบกราฟ + ประวัติน้ำหนัก
************************/

let weightHistory =
  JSON.parse(localStorage.getItem("weightHistory")) || [];

const weightChartObj = new Chart(weightChart,{
  type:'line',
  data:{
    labels:[],
    datasets:[{
      data:[],
      borderColor:'orange',
      tension:0.4
    }]
  },
  options:{plugins:{legend:{display:false}}}
});

// โหลดประวัติเดิม
function loadWeightHistory(){

  weightHistory.forEach(item=>{
    weightChartObj.data.labels.push(item.date);
    weightChartObj.data.datasets[0].data.push(item.weight);
  });

  weightChartObj.update();
}

loadWeightHistory();


/***********************
  วันตามเดือน + leap year
************************/

function daysInMonth(month,year){
  return new Date(year, month, 0).getDate();
}

function updateDays(){

  const d = document.getElementById("day");
  const m = Number(document.getElementById("month").value);
  const y = Number(document.getElementById("year").value);

  if(!d || !m || !y) return;

  // ⭐ คำนวณจำนวนวันของเดือนจริง (รองรับ leap year)
  const max = new Date(y, m, 0).getDate();

  const current = d.value;

  d.innerHTML = "";

  for(let i=1;i<=max;i++){
    d.add(new Option(i, i));
  }

  if(current <= max) d.value = current;
}


// ผูก dropdown
document.addEventListener("change", e=>{
  if(e.target.id==="month" || e.target.id==="year"){
    updateDays();
  }
});


/***********************
  override saveWeight
************************/

const oldSaveWeight = saveWeight;

saveWeight = function(){

  let w = parseFloat(weightInput.value);
  if(isNaN(w)) return;

  const d = day.value;
  const m = month.value;
  const y = year.value;

  const label = `${d}/${m}/${y}`;

  // เก็บประวัติ
  weightHistory.push({
    date:label,
    weight:w
  });

  localStorage.setItem(
    "weightHistory",
    JSON.stringify(weightHistory)
  );

  // ลงกราฟ
  weightChartObj.data.labels.push(label);
  weightChartObj.data.datasets[0].data.push(w);
  weightChartObj.update();

  document.getElementById("weightDisplay").innerText =
    w.toFixed(1)+" กก.";

  closeWeightPopup();
};


/* เปลี่ยน dot ตามตำแหน่ง scroll */
const slider = document.getElementById('macroSlider');
const dots = document.querySelectorAll('.dot');

if (slider) {
  slider.addEventListener('scroll', () => {

    const index =
      Math.round(slider.scrollLeft / slider.offsetWidth);

    dots.forEach(d =>
      d.classList.remove('active')
    );

    if (dots[index])
      dots[index].classList.add('active');
  });
}


function openPopup(){
  goalCal.value = calorieGoal;
  document.getElementById("goalPopup").style.display="flex";
}

function closePopup(){
  document.getElementById("goalPopup").style.display="none";
}


/*  */


// ===== popup เปิด/ปิด =====
function openWaterPopup(){
  document.getElementById("waterPopup")
    .style.display = "flex";
}

function closeWaterPopup(){
  document.getElementById("waterPopup")
    .style.display = "none";
}



// ===== บันทึก popup =====
function saveWater(){

  const amountEl =
    document.getElementById("waterAmount");

  const goalEl =
    document.getElementById("waterGoalInput");

  const customInput =
    document.getElementById("customWater");

  if(!amountEl || !goalEl){
    alert("ไม่พบช่องตั้งค่า");
    return;
  }

  // ⭐ ถ้าเลือกกำหนดเอง
  if(amountEl.value === "custom"){

    const val = Number(customInput.value);

    if(!val || val <= 0){
      alert("กรอกปริมาณน้ำให้ถูกต้อง");
      return;
    }

    waterPerCup = val;

  }else{
    waterPerCup = Number(amountEl.value);
  }

  waterGoal = Number(goalEl.value);

  document.getElementById("waterGoal").innerText =
    `เป้าหมาย ${waterGoal} มล.`;

  generateCups();
  closeWaterPopup();
}

// ===== กดแก้ว =====
function toggleWater(el){

  const filled =
    el.classList.contains("fill");

  if(filled){
    el.classList.remove("fill");
    waterNow -= waterPerCup;
  }else{
    el.classList.add("fill");
    waterNow += waterPerCup;
  }


  document.getElementById("waterNow").innerText =
    waterNow + " มล.";

  updateWaterUI();

  if (waterNow >= waterGoal) {
    notifyWaterGoal();
  }

  saveWaterData();
}

  document.getElementById("waterNow").innerText =
    waterNow + " มล.";

  updateWaterUI();

  // ⭐ เช็คว่าดื่มครบเป้าหมายหรือยัง
  if (waterNow >= waterGoal) {
    notifyWaterGoal();
}

  saveWaterData(); // เก็บข้อมูลรายวัน



// ===== วง + % =====
// function updateWaterUI(){

//   const percent =
//     Math.min(waterNow / waterGoal, 1);

//   const offset =
//     314 - (314 * percent);

//   document.getElementById("waterRing")
//     .style.strokeDashoffset = offset;

//   document.getElementById("waterPercent")
//     .innerText =
//     Math.round(percent * 100) + "%";
// }

// โหลดข้อมูลรายวัน
function updateWaterUI(){

  const percent =
    Math.min(waterNow / waterGoal, 1);

  const offset =
    314 - (314 * percent);

  const ring =
    document.getElementById("waterRing");

  if(ring){
    ring.style.strokeDashoffset = offset;
  }

  const percentText =
    document.getElementById("waterPercent");

  if(percentText){
    percentText.innerText =
      Math.round(percent * 100) + "%";
  }
}

function updateCalorieRing(){

  const ring =
    document.getElementById("calRing");

  if(!ring) return;

  const circumference = 471;

  const percent =
    Math.min(foodCalories / calorieGoal, 1);

  const offset =
    circumference - (circumference * percent);

  ring.style.strokeDashoffset = offset;

  const remaining =
    calorieGoal - foodCalories + activityCalories;

  document.getElementById("ringCal").innerText =
    remaining;
}


// ===== auto reset รายวัน =====


function saveWaterData(){
  localStorage.setItem("water_" + selectedDate, waterNow);
}

function loadWaterByDate(date){

  selectedDate = date;

  waterNow = Number(
    localStorage.getItem("water_" + date)
  ) || 0;

  document.getElementById("waterNow").innerText =
    waterNow + " มล.";

  updateWaterUI();
  updateDiaryWaterRing();

  syncCupsFromWater(); // ⭐ เพิ่มตรงนี้

  // ⭐ เพิ่มตรงนี้
  document.getElementById("selectedDateText").innerText =
    formatThaiDate(date);
    updateFoodSummary();
    


}

document.getElementById("selectedDateText").innerText =
  formatThaiDate(selectedDate);

function selectDay(index){

  const today = new Date();
  const map = [1,2,3,4,5,6,0];

  let diff = index - map[today.getDay()];

  const selected = new Date();
  selected.setDate(today.getDate() + diff);

  // ⭐ แปลง selected เป็น YYYY-MM-DD
  const year = selected.getFullYear();
  const month = String(selected.getMonth()+1).padStart(2,'0');
  const day = String(selected.getDate()).padStart(2,'0');

  const dateStr = `${year}-${month}-${day}`;

  loadWaterByDate(dateStr);

  // highlight
  document.querySelectorAll("#diaryWeek span")
    .forEach(el=>el.classList.remove("active"));

  document.querySelectorAll("#diaryWeek span")[index]
    .classList.add("active");
}

function loadWaterData(){

  const savedDate = localStorage.getItem("waterDate");

  if(savedDate === todayKey()){
    waterNow = Number(localStorage.getItem("waterNow")) || 0;
  }else{
    waterNow = 0;
    localStorage.setItem("waterDate", todayKey());
  }

  document.getElementById("waterNow").innerText =
    waterNow + " มล.";

  updateWaterUI();
}


// ===== สร้าง dropdown วัน/เดือน/ปี =====
function initDate(){

  const d = document.getElementById("day");
  const m = document.getElementById("month");
  const y = document.getElementById("year");

  if(!d || !m || !y){
    console.log("ไม่เจอ dropdown");
    return;
  }

  d.innerHTML = "";
  m.innerHTML = "";
  y.innerHTML = "";

  const now = new Date();

  // ⭐ เดือนภาษาไทย (ต้องอยู่ในนี้)
  const monthsThai = [
    "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน",
    "พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม",
    "กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"
  ];

  // เดือน
  monthsThai.forEach((name,i)=>{
    m.add(new Option(name, i+1));
  });

  // ปี ค.ศ.
  const yearNow = now.getFullYear();

  for(let i=yearNow-20;i<=yearNow+20;i++){
    y.add(new Option(i, i));
  }

  // วัน (ชั่วคราวก่อนปรับ)
  for(let i=1;i<=31;i++){
    d.add(new Option(i, i));
  }

  // ตั้งค่า default
  d.value = now.getDate();
  m.value = now.getMonth()+1;
  y.value = yearNow;

  updateDays(); // ⭐ ปรับวันตามเดือนจริง
}


// ===== popup เปิด/ปิด =====
function openWeightPopup(){

  const popup =
    document.getElementById("weightPopup");

  popup.style.display = "flex";

  initDate();
  updateDays();
}

function closeWeightPopup(){

  const popup =
    document.getElementById("weightPopup");

  popup.style.display = "none";
}


// ===== บันทึกน้ำหนัก =====
function saveWeight(){

  let w = parseFloat(weightInput.value);
  if(isNaN(w)) return;

  const day = document.getElementById("day").value;
  const month = document.getElementById("month").selectedIndex;
  const year = document.getElementById("year").value;

  document.getElementById("weightDisplay").innerText =
    w.toFixed(1) + " กก.";

  closeWeightPopup();

  alert(
    `บันทึก ${w.toFixed(1)} กก.\n` +
    `วันที่ ${day} ${monthsThai[month]} ${year}`
  );
}

/***************
  ระบบ streak
****************/

let streakData = JSON.parse(
  localStorage.getItem("streakData")
) || {
  lastFood:null,
  lastWeight:null,
  foodStreak:0,
  weightStreak:0,
  bestFood:0,
  bestWeight:0
};

function todayKey(){
  return new Date().toDateString();
}

function yesterdayKey(){
  const d=new Date();
  d.setDate(d.getDate()-1);
  return d.toDateString();
}

// ===== เรียกเมื่อบันทึกอาหาร =====
function recordFood(){

  if(streakData.lastFood===todayKey()) return;

  if(streakData.lastFood===yesterdayKey())
    streakData.foodStreak++;
  else
    streakData.foodStreak=1;

  streakData.lastFood=todayKey();

  if(streakData.foodStreak>streakData.bestFood)
    streakData.bestFood=streakData.foodStreak;

  saveStreak();
}

// ===== เรียกเมื่อบันทึกน้ำหนัก =====
function recordWeight(){

  if(streakData.lastWeight===todayKey()) return;

  if(streakData.lastWeight===yesterdayKey())
    streakData.weightStreak++;
  else
    streakData.weightStreak=1;

  streakData.lastWeight=todayKey();

  if(streakData.weightStreak>streakData.bestWeight)
    streakData.bestWeight=streakData.weightStreak;

  saveStreak();
}

function saveStreak(){
  localStorage.setItem(
    "streakData",
    JSON.stringify(streakData)
  );
  updateStreakUI();
}

function updateStreakUI(){

  const current=Math.max(
    streakData.foodStreak,
    streakData.weightStreak
  );

  const el = document.getElementById("streakNow");

  el.innerText = `🔥 ${current} วัน`;

  // ⭐ ทำให้เด้ง
  el.classList.remove("streak-pop");
  void el.offsetWidth; // รี animation
  el.classList.add("streak-pop");

  document.getElementById("foodBest").innerText =
    streakData.bestFood;

  document.getElementById("weightBest").innerText =
    streakData.bestWeight;

  highlightToday();
}


/***************
 ไฮไลต์วันในสัปดาห์
****************/

function highlightToday(){

  const map = [6,0,1,2,3,4,5];
  const today = map[new Date().getDay()];

  const days =
    document.querySelectorAll("#weekRow span");

  days.forEach(d=>d.classList.remove("active"));

  if(days[today])
    days[today].classList.add("active");
}




updateStreakUI();

function resetAll(){

  if(!confirm("รีเซ็ตข้อมูลทั้งหมด?")) return;

  localStorage.clear();
  location.reload();
}

function saveGoal(){

  calorieGoal = Number(goalCal.value);
  carbGoal = Number(goalCarb.value);
  proteinGoal = Number(goalProtein.value);
  fatGoal = Number(goalFat.value);

  // ⭐ เก็บค่า
  localStorage.setItem("goalCal", calorieGoal);
  
  // ⭐ เพิ่มบรรทัดนี้
  document.getElementById("goalCalText").innerText = calorieGoal;

  updateCalorieRing();
  updateMacros();

  closePopup();
}

// ===== Notification Permission =====
function requestNotificationPermission(){
  if ("Notification" in window) {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }
}


function notifyWaterGoal(){

  const notifiedDate =
    localStorage.getItem("waterNotifiedDate");

  // ถ้าแจ้งไปแล้ววันนี้ ไม่ต้องแจ้งซ้ำ
  if (notifiedDate === todayKey()) return;

  // แจ้งเตือนจริง
  if ("Notification" in window &&
      Notification.permission === "granted") {

    new Notification("💧 ดื่มน้ำครบแล้ว!", {
      body: `คุณดื่มน้ำครบ ${waterGoal} มล. ต่อวันแล้ว เยี่ยมมาก 🎉`,
      icon: "https://cdn-icons-png.flaticon.com/512/2917/2917990.png"
    });

  } else {
    alert("💧 ดื่มน้ำครบตามเป้าหมายต่อวันแล้ว!");
  }

  // บันทึกว่าวันนี้แจ้งแล้ว
  localStorage.setItem(
    "waterNotifiedDate",
    todayKey()
  );
}

function highlightDiaryToday(){

  // map ให้เริ่ม จันทร์
  const map = [6,0,1,2,3,4,5];
  const todayIndex = map[new Date().getDay()];

  const days =
    document.querySelectorAll("#diaryWeek span");

  days.forEach(d => d.classList.remove("active"));

  if(days[todayIndex]){
    days[todayIndex].classList.add("active");
  }
}

function updateDiaryWaterRing(){

  const percent =
    Math.min(waterNow / waterGoal, 1);

  const offset =
    440 - (440 * percent);

  const ring =
    document.getElementById("diaryWaterRing");

  if(!ring) return;

  ring.style.strokeDashoffset = offset;

  const left =
    Math.max(waterGoal - waterNow, 0);

  document.getElementById("diaryWaterLeft").innerText =
    left;
}

document
  .querySelector(".diary-water-btn")
  ?.addEventListener("click",()=>{

    const cups =
      document.querySelectorAll("#waterCups span");

    // หาแก้วใบแรกที่ยังไม่ fill
    for(let i=0;i<cups.length;i++){
      if(!cups[i].classList.contains("fill")){
        toggleWaterAll(i);
        break;
      }
    }

  });

  // ===== Sync All Cups (Dashboard + Diary) =====

function toggleWaterAll(index){

  const dashCups =
    document.querySelectorAll("#waterCups span");

  const diaryCups =
    document.querySelectorAll("#diaryCups span");

  const dashCup = dashCups[index];
  const diaryCup = diaryCups[index];

  const filled =
    dashCup.classList.contains("fill");

  if(filled){

    dashCup.classList.remove("fill");
    diaryCup.classList.remove("fill");

    waterNow -= waterPerCup;

  }else{

    dashCup.classList.add("fill");
    diaryCup.classList.add("fill");

    waterNow += waterPerCup;
  }

  if(waterNow < 0) waterNow = 0;
  if(waterNow > waterGoal)
    waterNow = waterGoal;

  document.getElementById("waterNow").innerText =
    waterNow + " มล.";

  // ⭐ sync ทุกอย่าง
  updateWaterUI();
  updateDiaryWaterRing();
  saveWaterData();
}

function syncCupsFromWater(){

  const dashCups =
    document.querySelectorAll("#waterCups span");

  const diaryCups =
    document.querySelectorAll("#diaryCups span");

  const filledCount =
    Math.floor(waterNow / waterPerCup);

  for(let i=0;i<8;i++){

    if(dashCups[i]){
      if(i < filledCount){
        dashCups[i].classList.add("fill");
      }else{
        dashCups[i].classList.remove("fill");
      }
    }

    if(diaryCups[i]){
      if(i < filledCount){
        diaryCups[i].classList.add("fill");
      }else{
        diaryCups[i].classList.remove("fill");
      }
    }
  }
}
function updateMacros(){

  const carbPercent =
    Math.min((carbNow / carbGoal) * 100, 100);

  const proteinPercent =
    Math.min((proteinNow / proteinGoal) * 100, 100);

  const fatPercent =
    Math.min((fatNow / fatGoal) * 100, 100);

  carbChartObj.data.datasets[0].data =
    [carbPercent, 100-carbPercent];

  proteinChartObj.data.datasets[0].data =
    [proteinPercent, 100-proteinPercent];

  fatChartObj.data.datasets[0].data =
    [fatPercent, 100-fatPercent];

  carbChartObj.update();
  proteinChartObj.update();
  fatChartObj.update();

  document.getElementById("carbText").innerText =
    `${carbNow} / ${carbGoal} g`;

  document.getElementById("proteinText").innerText =
    `${proteinNow} / ${proteinGoal} g`;

  document.getElementById("fatText").innerText =
    `${fatNow} / ${fatGoal} g`;
}

const diarySlider =
  document.getElementById("diarySlider");

const diaryDots =
  document.querySelectorAll(".diary-water-card .dot");

if(diarySlider){

  diarySlider.addEventListener("scroll",()=>{

    const index =
      Math.round(
        diarySlider.scrollLeft /
        diarySlider.offsetWidth
      );

    diaryDots.forEach(d =>
      d.classList.remove("active")
    );

    if(diaryDots[index])
      diaryDots[index].classList.add("active");
  });

}

function updateDiaryNutrition(){

  const circumference = 440;

  const percent =
    Math.min(foodCalories / calorieGoal, 1);

  const offset =
    circumference - (circumference * percent);

  const calRing =
    document.getElementById("diaryCalRing");

  if(calRing)
    calRing.style.strokeDashoffset = offset;

  const calText =
    document.getElementById("diaryCalText");

  if(calText)
    calText.innerText =
      calorieGoal - foodCalories + activityCalories;

  const carbText =
    document.getElementById("diaryCarbText");

  if(carbText)
    carbText.innerText =
      `${carbNow} / ${carbGoal} g`;

  const proteinText =
    document.getElementById("diaryProteinText");

  if(proteinText)
    proteinText.innerText =
      `${proteinNow} / ${proteinGoal} g`;

  const fatText =
    document.getElementById("diaryFatText");

  if(fatText)
    fatText.innerText =
      `${fatNow} / ${fatGoal} g`;
}

// โหลดค่าน้ำตอนเปิดเว็บ
// โหลดค่าน้ำตอนเปิดเว็บ
requestNotificationPermission();
loadWaterData();
updateCupLevels();
updateDiaryWaterRing();
function updateAll(){
  updateCalorieRing();   // หน้าแดชบอร์ด
  updateMacros();        // macro dashboard
  updateDiaryNutrition(); // หน้าไดอารี่
}

// ทดสอบเพิ่ม แคล
function addFoodTest(){
  foodCalories += 500;
  updateAll();
}

// // ทดสอบเพิ่มค่า macro
function addMacroTest(){
  carbNow += 5;
  proteinNow += 5;
  fatNow += 5;
  updateAll();
}

function toggleQuickMenu(){

  const menu = document.getElementById("quickMenu");

  if(menu.style.display === "flex"){
    menu.style.display = "none";
  }else{
    menu.style.display = "flex";
  }

}


/* ===========================
   CAMERA SYSTEM
=========================== */

let stream;
let currentFacing = "environment";

/* ===========================
   OPEN CAMERA
=========================== */

function openCamera(){

  document.getElementById("quickMenu").style.display="none";
  document.body.classList.add("camera-open");

  const cam = document.getElementById("cameraPage");
  cam.style.display="block";

  startCamera();

}


/* ===========================
   START CAMERA
=========================== */

function startCamera(){

  navigator.mediaDevices.getUserMedia({
    video:{
      facingMode: currentFacing
    }
  }).then(function(s){

    stream = s;

    const video = document.getElementById("video");
    video.srcObject = stream;

  }).catch(function(err){

    alert("เปิดกล้องไม่ได้");
    console.log(err);

  });

}


/* ===========================
   SWITCH CAMERA
=========================== */

function switchCamera(){

  if(stream){
    stream.getTracks().forEach(track=>track.stop());
  }

  currentFacing =
    currentFacing === "environment" ? "user" : "environment";

  startCamera();

}



/* ===========================
   CAPTURE PHOTO
=========================== */

function capturePhoto(){

  const video = document.getElementById("video");
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.drawImage(video,0,0);

  // ⭐ แปลงเป็น base64
  const imageBase64 = canvas.toDataURL("image/jpeg");

  // ⭐ ส่งให้ AI วิเคราะห์
  analyzeFood(imageBase64);

}
/* ===========================
   CLOSE CAMERA
=========================== */

function closeCamera(){

  if(stream){
    stream.getTracks().forEach(track=>track.stop());
  }

  document.getElementById("cameraPage").style.display="none";
  document.body.classList.remove("camera-open");

}


/* ===========================
   OPEN GALLERY
=========================== */

function openGallery(){

  const input = document.getElementById("galleryInput");

  input.value="";
  input.click();

  input.onchange=function(){

    if(this.files && this.files.length > 0){

      const file = this.files[0];

      processImage(file);

    }

  }

}


/* ===========================
   IMAGE RESIZE (RAM SAFE)
=========================== */

function processImage(file){

  const img = new Image();
  const url = URL.createObjectURL(file);

  img.src = url;

  img.onload = function(){

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const MAX = 512;

    let w = img.width;
    let h = img.height;

    if(w > h){
      if(w > MAX){
        h *= MAX / w;
        w = MAX;
      }
    }else{
      if(h > MAX){
        w *= MAX / h;
        h = MAX;
      }
    }

    canvas.width = w;
    canvas.height = h;

    ctx.drawImage(img,0,0,w,h);

    canvas.toBlob(function(blob){

      const image = URL.createObjectURL(blob);

      analyzeFood(image);

      URL.revokeObjectURL(url);

    },"image/jpeg",0.8);

  };

}


/* ===========================
   FOOD ANALYSIS DEMO
=========================== */

async function analyzeFood(image){

  // ⭐ สร้างหน้า UI
  document.body.innerHTML = `
  <div class="food-page">

    <div class="food-top">
      <button class="back-btn" onclick="goBack()">✕</button>
    </div>

    <img src="${image}" class="food-img">

    <h2 id="foodName">Analyzing...</h2>

    <div id="calories" class="food-cal">
      <b>...</b> Calories
    </div>

    <div class="macro-row">
      <div id="protein">...</div>
      <div id="carbs">...</div>
      <div id="fat">...</div>
    </div>

    <button class="save-btn" onclick="openMealPopup()">
      บันทึกอาหาร
    </button>

    <div id="mealPopup" class="popup">
  <div class="popup-card">

    <div class="popup-header">
      <span onclick="closeMealPopup()">✕</span>
      <b>เลือกมื้ออาหาร</b>
    </div>

      <button class="save-btn" onclick="saveMeal('breakfast')">🍳 อาหารเช้า</button>
      <button class="save-btn" onclick="saveMeal('lunch')">🍛 อาหารกลางวัน</button>
      <button class="save-btn" onclick="saveMeal('dinner')">🍝 อาหารเย็น</button>
      <button class="save-btn" onclick="saveMeal('snack')">🍪 อาหารว่าง</button>

    </div>
    
  </div>
  `;

  // ⭐ แปลง blob → base64
  if(image.startsWith("blob:")){

    const res = await fetch(image);
    const blob = await res.blob();

    const reader = new FileReader();

    reader.onload = function(){
      analyzeFood(reader.result);
    };

    reader.readAsDataURL(blob);
    return;
  }

  // ⭐ เรียก AI
  const res = await fetch("api/food-ai",{
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify({
      image:image
    })
  });

  const data = await res.json();

  console.log("FOOD AI:",data);

  // ⭐ กัน error
  if(!data || !data.calories){
    alert("AI วิเคราะห์ไม่สำเร็จ");
    return;
  }

  // ⭐ ใส่ตรงนี้!!!
  setCurrentFood(data);

  // ⭐ แสดงผล
  document.getElementById("foodName").innerText =
    data.food_name;

  document.getElementById("calories").innerHTML =
    "<b>"+data.calories+"</b> Calories";

  document.getElementById("protein").innerText =
    data.protein+"g protein";

  document.getElementById("carbs").innerText =
    data.carbs+"g carbs";

  document.getElementById("fat").innerText =
    data.fat+"g fat";


  // =========================
  // 🔥🔥 จุดสำคัญ (บันทึกจริง)
  // =========================

  function getMealType(){
    const hour = new Date().getHours();

    if(hour < 10) return "breakfast";
    if(hour < 15) return "lunch";
    if(hour < 19) return "dinner";
    return "snack";
  }

  addFood(getMealType(), {
    name: data.food_name || "อาหาร",
    calories: Number(data.calories) || 0,
    protein: Number(data.protein) || 0,
    carbs: Number(data.carbs) || 0,
    fat: Number(data.fat) || 0
  });

  // ⭐ อัปเดต dashboard
  updateFoodSummary();

}



/* ===========================
   BACK TO APP
=========================== */

function goBack(){
  location.reload();
}

function openAI(e){

  if(e) e.stopPropagation(); // กัน event ซ้อน

  const menu = document.getElementById("quickMenu");
  const ai = document.getElementById("aiPage");

  menu.style.display = "none";
  ai.style.display = "flex";

}

function closeAI(){

  const ai = document.getElementById("aiPage");

  ai.style.display="none";

}

function openAI(){

  const menu = document.getElementById("quickMenu");
  const ai = document.getElementById("aiPage");

  menu.style.display = "none";
  ai.style.display = "flex";

}

/* ==========================
   AI CHAT SYSTEM
========================== */

async function sendAI(){

  const input = document.getElementById("aiInput");
  const chat = document.getElementById("aiChat");

  const message = input.value.trim();

  if(message === "") return;

  // แสดงข้อความผู้ใช้
  chat.innerHTML += `
  <div class="ai-msg" style="margin-left:auto;background:#000;color:#fff">
    ${message}
  </div>
  `;

  input.value = "";

  try{

    const res = await fetch("api/ai",{

      method:"POST",

      headers:{
        "Content-Type":"application/json"
      },

      body: JSON.stringify({
        message: message
      })

    });

    const data = await res.json();

    // แสดงคำตอบ AI
    chat.innerHTML += `
    <div class="ai-msg">
    ${marked.parse(data.reply)}
    </div>
    `;

    chat.scrollTop = chat.scrollHeight;

  }catch(err){

    chat.innerHTML += `
    <div class="ai-msg">
      AI server ยังไม่เปิด
    </div>
    `;

  }

}

/* ===== กด Enter ส่งข้อความ ===== */

const aiInput = document.getElementById("aiInput");

aiInput.addEventListener("keydown", function(e){

  if(e.key === "Enter" && !e.shiftKey){

    e.preventDefault();
    sendAI();

  }

});



function confirmDate(){

  const date = document.getElementById("calendarInput").value;

  if(!date) return;

  loadWaterByDate(date);
  updateFoodSummary();

  closeCalendar();
}

let pickedDate = null;

function openCalendar(){

  const btn = document.querySelector(".calendar-btn");

  flatpickr(btn, {
    defaultDate: selectedDate,
    dateFormat: "Y-m-d",
    position: "auto center", // ⭐ จัดตำแหน่งให้กลางปุ่ม
    static: false,

    onChange: function(selectedDates, dateStr){
      if(dateStr){
        loadWaterByDate(dateStr);
      }
    }
  }).open();
}

function confirmDate(){

  if(!pickedDate) return;

  loadWaterByDate(pickedDate);

  closeCalendar();
}

function formatThaiDate(dateStr){

  const months = [
    "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน",
    "พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม",
    "กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"
  ];

  const d = new Date(dateStr);

  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear() + 543;

  return `${day} ${month} ${year}`;
}

function openCalendar(){

  const btn = document.querySelector(".calendar-btn");

  flatpickr(btn, {
    locale: "th",
    defaultDate: selectedDate,
    dateFormat: "Y-m-d",

    onReady: function(selectedDates, dateStr, instance){
      convertToThaiYear(instance);
    },

    onChange: function(selectedDates, dateStr, instance){

      if(dateStr){
        loadWaterByDate(dateStr);
        convertToThaiYear(instance); // ⭐ สำคัญ
      }
    }
  }).open();
}

function convertToThaiYear(instance){

  const yearEl = instance.currentYearElement;

  if(yearEl){
    const year = parseInt(yearEl.value);
    yearEl.value = year + 543;
  }

  // header ปี
  const yearSpan = instance.calendarContainer.querySelector(".numInput");
  if(yearSpan){
    const year = parseInt(yearSpan.value);
    yearSpan.value = year + 543;
  }
}

function convertToThaiYear(instance){

  const yearInput = instance.calendarContainer
    .querySelector(".numInput");

  if(yearInput){
    const year = parseInt(yearInput.value);
    yearInput.value = year + 543;
  }
}

document.getElementById("waterAmount")
  .addEventListener("change", function(){

    const customInput =
      document.getElementById("customWater");

    if(this.value === "custom"){
      customInput.style.display = "block";
    }else{
      customInput.style.display = "none";
    }
});

document.getElementById("waterAmount")
  .addEventListener("change", function(){

    const custom =
      document.getElementById("customWater");

    if(this.value === "custom"){
      custom.style.display = "block";
    }else{
      custom.style.display = "none";
    }

});

function generateCups(){

  const dashContainer = document.getElementById("waterCups");
  const diaryContainer = document.getElementById("diaryCups");

  if(!dashContainer || !diaryContainer) return;

  dashContainer.innerHTML = "";
  diaryContainer.innerHTML = "";

  const cups = Math.ceil(waterGoal / waterPerCup);

  for(let i=0; i<cups; i++){

    const dash = document.createElement("span");
    dash.innerHTML = `<div class="cup"><div class="water"></div></div>`;
    dash.onclick = function(){
      toggleWaterAll(i);
    };

    const diary = document.createElement("span");
    diary.innerHTML = `<div class="cup"><div class="water"></div></div>`;
    diary.onclick = function(){
      toggleWaterAll(i);
    };

    dashContainer.appendChild(dash);
    diaryContainer.appendChild(diary);
  }
}



function syncCupsFromWater(){

  const dashCups =
    document.querySelectorAll("#waterCups span");

  const diaryCups =
    document.querySelectorAll("#diaryCups span");

  const filled =
    Math.floor(waterNow / waterPerCup);

  dashCups.forEach((cup,i)=>{
    if(i < filled){
      cup.classList.add("fill");
    }else{
      cup.classList.remove("fill");
    }
  });

  diaryCups.forEach((cup,i)=>{
    if(i < filled){
      cup.classList.add("fill");
    }else{
      cup.classList.remove("fill");
    }
  });
}

generateCups();

function saveFood(){

  const name = document.getElementById("foodName").value;
  const cal = Number(document.getElementById("foodCal").value);
  const carb = Number(document.getElementById("foodCarb").value);
  const protein = Number(document.getElementById("foodProtein").value);
  const fat = Number(document.getElementById("foodFat").value);

  if(!name){
    alert("กรอกชื่ออาหารก่อน");
    return;
  }

  // 🔥 เพิ่มค่าเข้า dashboard
  foodCalories += cal;
  carbNow += carb;
  proteinNow += protein;
  fatNow += fat;

  updateCalorieRing();
  updateMacros();

  // ⭐ reset input
  document.getElementById("foodName").value = "";
  document.getElementById("foodCal").value = "";
  document.getElementById("foodCarb").value = "";
  document.getElementById("foodProtein").value = "";
  document.getElementById("foodFat").value = "";

  // กลับหน้า dashboard
  showPage("dashboard");
}

function updateMacros(){

  carbChartObj.data.datasets[0].data =
    [carbNow, carbGoal - carbNow];
  proteinChartObj.data.datasets[0].data =
    [proteinNow, proteinGoal - proteinNow];
  fatChartObj.data.datasets[0].data =
    [fatNow, fatGoal - fatNow];

  carbChartObj.update();
  proteinChartObj.update();
  fatChartObj.update();

  document.getElementById("carbText").innerText =
    `${carbNow} / ${carbGoal} g`;

  document.getElementById("proteinText").innerText =
    `${proteinNow} / ${proteinGoal} g`;

  document.getElementById("fatText").innerText =
    `${fatNow} / ${fatGoal} g`;
}

function saveFood(){
  alert("บันทึกแล้ว"); // ทดสอบก่อน
}


function openFoodPage(){
  document.getElementById("foodFullPage").style.display = "flex";
}

function closeFoodPage(){
  document.getElementById("foodFullPage").style.display = "none";
}

function saveFood(){

  const cal = Number(document.getElementById("foodCal").value) || 0;
  const carb = Number(document.getElementById("foodCarb").value) || 0;
  const protein = Number(document.getElementById("foodProtein").value) || 0;
  const fat = Number(document.getElementById("foodFat").value) || 0;

  foodCalories += cal;
  carbNow += carb;
  proteinNow += protein;
  fatNow += fat;

  updateCalorieRing();
  updateMacros();

  closeFoodPage();
}

function openFoodPage(){
  document.getElementById("foodFullPage").style.display = "flex";
}

function closeFoodPage(){
  document.getElementById("foodFullPage").style.display = "none";
}

function updateCupLevels(){

  const dashCups =
    document.querySelectorAll("#waterCups span");

  const diaryCups =
    document.querySelectorAll("#diaryCups span");

  let remaining = waterNow;

  [...dashCups].forEach((cup,i)=>{

    const waterDiv = cup.querySelector(".water");

    if(!waterDiv) return;

    if(remaining >= waterPerCup){
      waterDiv.style.height = "100%";
      cup.classList.add("fill");
      remaining -= waterPerCup;

    }else if(remaining > 0){
      const percent =
        (remaining / waterPerCup) * 100;

      waterDiv.style.height = percent + "%";
      cup.classList.add("fill");
      remaining = 0;

    }else{
      waterDiv.style.height = "0%";
      cup.classList.remove("fill");
    }
  });

  // diary sync
  [...diaryCups].forEach((cup,i)=>{
    const dashWater =
      dashCups[i]?.querySelector(".water");

    const diaryWater =
      cup.querySelector(".water");

    if(dashWater && diaryWater){
      diaryWater.style.height =
        dashWater.style.height;
    }
  });
}

// ===== INSIGHTS =====

let userWeight = 65;
let userHeight = 175;
let insightsChartInstance = null;

function updateInsights(){

  document.getElementById("insightAvgCal").innerHTML =
    `${foodCalories} <small>kcal</small>`;

  document.getElementById("insightBurnCal").innerHTML =
    `${activityCalories} <small>kcal</small>`;

  let heightM = userHeight / 100;
  let bmi = (userWeight / (heightM * heightM)).toFixed(1);

  document.getElementById("insightWeight").innerText = userWeight;
  document.getElementById("insightBMI").innerText = bmi;

  document.getElementById("insightAvgWater").innerHTML =
    `${waterNow} <small>มล.</small>`;

  // mini cups
  const mini = document.getElementById("insightWaterCups");
  mini.innerHTML = "";

  let total = Math.ceil(waterGoal / waterPerCup) || 8;
  let filled = Math.floor(waterNow / waterPerCup);

  for(let i=0;i<total;i++){
    let cup = document.createElement("span");
    if(i < filled) cup.classList.add("filled");
    mini.appendChild(cup);
  }

  updateInsightsChart();
}

function updateInsightsChart(){

  const ctx = document.getElementById("insightsChart");
  if(!ctx) return;

  if(insightsChartInstance){
    insightsChartInstance.data.datasets[0].data =
      [foodCalories, carbNow, proteinNow, fatNow];
    insightsChartInstance.update();
    return;
  }

  insightsChartInstance = new Chart(ctx,{
    type:'bar',
    data:{
      labels:['แคลอรี่','คาร์บ','โปรตีน','ไขมัน'],
      datasets:[{
        data:[foodCalories, carbNow, proteinNow, fatNow],
        backgroundColor:['#ff9800','#4caf50','#2196f3','#f44336'],
        borderRadius:8
      }]
    },
    options:{
      responsive:true,
      plugins:{legend:{display:false}},
      scales:{y:{beginAtZero:true}}
    }
  });
}

function generateCalendarStrip(){

  const strip = document.getElementById("calendarStrip");
  if(!strip || strip.innerHTML !== "") return;

  const today = new Date();
  const days = ['อา.','จ.','อ.','พ.','พฤ.','ศ.','ส.'];

  for(let i=-3;i<=3;i++){
    let d = new Date(today);
    d.setDate(today.getDate()+i);

    let el = document.createElement("div");
    el.className = "cal-day" + (i===0 ? " active" : "");

    el.innerHTML = `
      <div class="day-name">${days[d.getDay()]}</div>
      <div class="day-num">${d.getDate()}</div>
    `;

    strip.appendChild(el);
  }
}

// ===== FOOD STORAGE SYSTEM =====

// โครงสร้าง:
// food_2026-03-23 = {
//   breakfast: [],
//   lunch: [],
//   dinner: [],
//   snack: []
// }

function getFoodData(date){

  let data = JSON.parse(localStorage.getItem("meals_" + date));

  // ⭐ กันพัง + กัน key หาย
  if(!data){
    data = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: []
    };
  }

  // ⭐ กันบาง key หาย
  if(!data.breakfast) data.breakfast = [];
  if(!data.lunch) data.lunch = [];
  if(!data.dinner) data.dinner = [];
  if(!data.snack) data.snack = [];

  return data;
}

function saveFoodData(date,data){
  localStorage.setItem("food_" + date, JSON.stringify(data));
}

// เพิ่มอาหาร
function addFood(meal, food){

  const data = getFoodData(selectedDate);



  data[meal].push({
    ...food,
    time: new Date().toLocaleTimeString()
  });

  saveFoodData(selectedDate,data);

  // ⭐ update ทุกอย่าง
  updateFoodSummary();
  recordFood(); // streak
}

function updateFoodSummary(){

  const data = getFoodData(selectedDate);

  let cal = 0;
  let carb = 0;
  let protein = 0;
  let fat = 0;

  // ===== รวมทั้งหมด =====
  Object.values(data).forEach(meal=>{
    meal.forEach(item=>{
      cal += Number(item.calories) || 0;
      carb += Number(item.carbs) || 0;
      protein += Number(item.protein) || 0;
      fat += Number(item.fat) || 0;
    });
  });

  // ===== แยกมื้อ =====
  const breakfastCal = data.breakfast.reduce((sum,f)=>sum+(Number(f.calories)||0),0);
  const lunchCal = data.lunch.reduce((sum,f)=>sum+(Number(f.calories)||0),0);
  const dinnerCal = data.dinner.reduce((sum,f)=>sum+(Number(f.calories)||0),0);
  const snackCal = data.snack.reduce((sum,f)=>sum+(Number(f.calories)||0),0);

  // ===== global =====
  foodCalories = cal;
  carbNow = carb;
  proteinNow = protein;
  fatNow = fat;

  updateCalorieRing();
  updateMacros();
  updateDiaryUI();
  updateDiaryFood();

  // ===== ใส่ UI =====
  document.getElementById("breakfastCal").innerText = breakfastCal + " kcal";
  document.getElementById("lunchCal").innerText = lunchCal + " kcal";
  document.getElementById("dinnerCal").innerText = dinnerCal + " kcal";
  document.getElementById("snackCal").innerText = snackCal + " kcal";

  document.getElementById("goalCalText").innerText = calorieGoal;
  document.getElementById("foodCalText").innerText = foodCalories;
  document.getElementById("activityCalText").innerText = activityCalories;
}

function updateMacros(){

  carbChartObj.data.datasets[0].data = [
    carbNow,
    Math.max(carbGoal - carbNow,0)
  ];

  proteinChartObj.data.datasets[0].data = [
    proteinNow,
    Math.max(proteinGoal - proteinNow,0)
  ];

  fatChartObj.data.datasets[0].data = [
    fatNow,
    Math.max(fatGoal - fatNow,0)
  ];

  carbChartObj.update();
  proteinChartObj.update();
  fatChartObj.update();

  document.getElementById("carbText").innerText =
    `${carbNow} / ${carbGoal} g`;

  document.getElementById("proteinText").innerText =
    `${proteinNow} / ${proteinGoal} g`;

  document.getElementById("fatText").innerText =
    `${fatNow} / ${fatGoal} g`;
}

function updateDiaryUI(){

  const data = getFoodData(selectedDate);

  console.log("Diary:",data);

  // TODO: ต่อ UI จริง (ถ้าจะโชว์รายการ)
}

function updateDiaryFood(){

  // 🔥 วงแคล
  const ring = document.getElementById("diaryCalRing");
  if(!ring) return;

  const circumference = 440;

  const percent =
    Math.min(foodCalories / calorieGoal, 1);

  const offset =
    circumference - (circumference * percent);

  ring.style.strokeDashoffset = offset;

  // 🔥 คงเหลือ
  const remaining =
    calorieGoal - foodCalories + activityCalories;

  document.getElementById("diaryCalText").innerText =
    remaining;

  // 🔥 macro
  document.getElementById("diaryCarbText").innerText =
    `${carbNow} / ${carbGoal} g`;

  document.getElementById("diaryProteinText").innerText =
    `${proteinNow} / ${proteinGoal} g`;

  document.getElementById("diaryFatText").innerText =
    `${fatNow} / ${fatGoal} g`;
}

// ===== FOOD SAVE SYSTEM =====

let currentFood = null; // เก็บอาหารล่าสุด

function openMealPopup(){
  document.getElementById("mealPopup").style.display = "flex";
}

function closeMealPopup(){
  document.getElementById("mealPopup").style.display = "none";
}

// ⭐ ตอน analyze เสร็จ ให้เซ็ตค่า
function setCurrentFood(data){
  currentFood = data;
}

// ⭐ บันทึกอาหาร
function saveMeal(type){

  if(!currentFood){
    alert("ไม่มีข้อมูลอาหาร");
    return;
  }

  const date = selectedDate;

  let meals = getFoodData(date);

  // ⭐ กัน type เพี้ยน
  if(!meals[type]){
    meals[type] = [];
  }

  meals[type].push(currentFood);

  localStorage.setItem(
    "meals_" + date,
    JSON.stringify(meals)
  );

  alert("บันทึกแล้ว!");

  recordFood();

  closeMealPopup();
  updateFoodSummary();

  // ⭐ แก้ตรงนี้
  location.reload();
}

function logout(){

  if(!confirm("ต้องการออกจากระบบและล้างข้อมูลทั้งหมดใช่ไหม?")){
    return;
  }

  // ลบข้อมูลทั้งหมด
  localStorage.clear();

  // รีหน้า
  location.reload();
}

if(foodCalories > calorieGoal){
  document.getElementById("foodCalText").style.color = "red";
}

const remain = calorieGoal - foodCalories + activityCalories;

function logout(){

  if(!confirm("ต้องการออกจากระบบใช่ไหม?")) return;

  // ⭐ ลบข้อมูลทั้งหมด (เหมือน reset)
  localStorage.clear();

  alert("ออกจากระบบสำเร็จ!");

  // ⭐ รีโหลดหน้า
  location.reload();
}

localStorage.removeItem("user");

function getAverageWater(){

  let total = 0;
  let days = 0;

  for(let key in localStorage){
    if(key.startsWith("water_")){
      total += Number(localStorage.getItem(key)) || 0;
      days++;
    }
  }

  if(days === 0) return 0;

  return Math.round(total / days);
}

document.getElementById("avgWaterText").innerText =
  getAverageWater() + " มล.";