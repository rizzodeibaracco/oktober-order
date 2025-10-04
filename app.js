
const PRICE = { q_bionda_05:6, q_bionda_1:11 };

firebase.initializeApp({
  apiKey: "AIzaSyAZPR5tHdHgbfdhq77SERUBBsH3o3GlFro",
  authDomain: "oktoberfest-ordes.firebaseapp.com",
  projectId: "oktoberfest-ordes",
  storageBucket: "oktoberfest-ordes.firebasestorage.app",
  messagingSenderId: "836780488125",
  appId: "1:836780488125:web:a5d99be814b773c7f78ed4"
});
const db = firebase.database();
const ORDERS = db.ref("orders");

const € = n => n.toFixed(2).replace(".", ",")+" €";

function readQ(){ let q={}; for(let k in PRICE){ q[k]=+document.getElementById(k).textContent||0;} return q; }
function total(q){ let s=0; for(let k in q) s+=q[k]*PRICE[k]; return s; }
function updateTotal(){ document.getElementById("order-total").textContent=€(total(readQ())); }

document.querySelectorAll("[data-delta]").forEach(b=>{
  b.addEventListener("click",()=>{ const id=b.dataset.target; let v=+document.getElementById(id).textContent; v=Math.max(0,v+parseInt(b.dataset.delta)); document.getElementById(id).textContent=v; updateTotal(); });
});

document.getElementById("order-form").addEventListener("submit",e=>{
  e.preventDefault();
  const waiter=document.getElementById("waiter").value.trim();
  const table=+document.getElementById("table").value;
  const q=readQ(); const t=total(q);
  if(!waiter||!table||t<=0){ alert("Compila correttamente"); return; }
  ORDERS.push({waiter,table,quantities:q,total:t,status:"pending",createdAt:Date.now()});
});

ORDERS.on("value",snap=>{
  const data=snap.val()||{}; const list=document.getElementById("orders-list"); list.innerHTML="";
  let tot=0;
  Object.values(data).forEach(o=>{ tot+=o.total; const div=document.createElement("div"); div.className="order"; div.textContent=`Tavolo ${o.table} - Cameriere ${o.waiter} - Totale ${€(o.total)}`; list.appendChild(div); });
  document.getElementById("kpi-total").textContent=€(tot);
});
