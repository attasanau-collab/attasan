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

function showPage(id){

  document.querySelectorAll('.page')
    .forEach(p=>p.classList.remove('active'));

  document.getElementById(id)
    .classList.add('active');

  const titles = {
    dashboard: "แดชบอร์ด",
    diary: "ไดอารี่",
    account: "บัญชี"
  };

  document.getElementById("pageTitle").innerText =
    titles[id] || "";

  // ⭐ ไฮไลต์วันในหน้าไดอารี่
  if(id === "diary"){
    highlightDiaryToday();
  }
}


/* Progress Ring แคล */
const goal = 2000;
const current = 1952;
const percent = current/goal;
calRing.style.strokeDashoffset = 471 - (471*percent);

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
macro("carbChart",40);
macro("proteinChart",30);
macro("fatChart",20);

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
  document.getElementById("goalPopup").style.display="flex";
}

function closePopup(){
  document.getElementById("goalPopup").style.display="none";
}

function saveGoal(){
  const cal = goalCal.value;
  ringCal.innerText = cal;
  closePopup();
}

/*  */

// ===== WATER VARIABLES (บนสุด) =====
let waterGoal = 2000;
let waterNow = 0;
let waterPerCup = 250;

// ===== popup เปิด/ปิด =====
function openWaterPopup(){
  document.getElementById("waterPopup")
    .style.display = "flex";
}

function closeWaterPopup(){
  document.getElementById("waterPopup")
    .style.display = "none";
}

// ===== รีเซ็ตน้ำ =====
function resetWater(){

  waterNow = 0;

  document.getElementById("waterNow").innerText =
    "0 มล.";

  // ล้างแก้ว
  document
    .querySelectorAll("#waterCups span")
    .forEach(c=>{
      c.classList.remove("fill");
      c.innerText="＋";
    });

  updateWaterUI();
}

// ===== บันทึก popup =====
function saveWater(){

  const amountEl =
    document.getElementById("waterAmount");

  const goalEl =
    document.getElementById("waterGoalInput");

  if(!amountEl || !goalEl){
    alert("ไม่พบช่องตั้งค่า");
    return;
  }

  waterPerCup = Number(amountEl.value);
  waterGoal = Number(goalEl.value);

  document.getElementById("waterGoal").innerText =
    `เป้าหมาย ${waterGoal} มล.`;

  closeWaterPopup();
}

// ===== กดแก้ว =====
function toggleWater(el){

  const filled =
    el.classList.contains("fill");

  if(filled){
    el.classList.remove("fill");
    el.innerText="＋";
    waterNow -= waterPerCup;
  }else{
    el.classList.add("fill");
    el.innerText="🥛";
    waterNow += waterPerCup;
  }

  if(waterNow < 0) waterNow = 0;

  document.getElementById("waterNow").innerText =
    waterNow + " มล.";

  updateWaterUI();

  // ⭐ เช็คว่าดื่มครบเป้าหมายหรือยัง
  if (waterNow >= waterGoal) {
    notifyWaterGoal();
  }

  saveWaterData(); // เก็บข้อมูลรายวัน
}



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

  document.getElementById("waterRing")
    .style.strokeDashoffset = offset;

  document.getElementById("waterPercent")
    .innerText =
    Math.round(percent * 100) + "%";
}


// ===== auto reset รายวัน =====

function todayKey(){
  return new Date().toDateString();
}

function saveWaterData(){
  localStorage.setItem("waterNow", waterNow);
  localStorage.setItem("waterDate", todayKey());
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

  const carbGoal =
    Number(goalCarb.value);

  const proteinGoal =
    Number(goalProtein.value);

  const fatGoal =
    Number(goalFat.value);

  document.getElementById("carbText").innerText =
    `0 / ${carbGoal} g`;

  document.getElementById("proteinText").innerText =
    `0 / ${proteinGoal} g`;

  document.getElementById("fatText").innerText =
    `0 / ${fatGoal} g`;

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
requestNotificationPermission();

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

  const left =
    Math.max(waterGoal - waterNow, 0);

  const percent =
    Math.min(waterNow / waterGoal, 1);

  const offset =
    440 - (440 * percent);

  const ring =
    document.getElementById("diaryWaterRing");

  if(!ring) return;

  ring.style.strokeDashoffset = offset;

  document.getElementById("diaryWaterLeft").innerText =
    left;
}

document
  .querySelector(".diary-water-btn")
  ?.addEventListener("click",()=>{
    waterNow += waterPerCup;
    updateDiaryWaterRing();
    document.getElementById("waterNow").innerText =
      waterNow + " มล.";
  });
