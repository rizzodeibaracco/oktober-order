
const PRICE={q_bionda_05:6,q_bionda_1:11,q_rossa_05:7,q_rossa_1:13,q_nf_05:7,q_nf_1:13,q_cola:4,q_nat:2,q_frizz:2};
const LABELS={q_bionda_05:"Bionda 0,5L",q_bionda_1:"Bionda 1L",q_rossa_05:"Rossa 0,5L",q_rossa_1:"Rossa 1L",q_nf_05:"Non filtrata 0,5L",q_nf_1:"Non filtrata 1L",q_cola:"Coca-Cola",q_nat:"Acqua naturale",q_frizz:"Acqua frizzante"};

firebase.initializeApp({
  apiKey:"AIzaSyAZPR5tHdHgbfdhq77SERUBBsH3o3GlFro",
  authDomain:"oktoberfest-ordes.firebaseapp.com",
  projectId:"oktoberfest-ordes",
  storageBucket:"oktoberfest-ordes.firebasestorage.app",
  messagingSenderId:"836780488125",
  appId:"1:836780488125:web:a5d99be814b773c7f78ed4"
});

const db=firebase.database();
const ORDERS=db.ref("orders");

const €=n=>n.toFixed(2).replace(".",",")+" €";

function readQ(){
  let q={};
  for(let k in PRICE){
    q[k]=+document.getElementById(k).textContent||0;
  }
  return q;
}
function total(q){
  let s=0;
  for(let k in q) s+=q[k]*PRICE[k];
  return s;
}
function updateTotal(){
  document.getElementById("order-total").textContent=€(total(readQ()));
}

// Gestione pulsanti + / -
document.addEventListener("click",e=>{
  if(e.target.dataset && e.target.dataset.delta){
    const id=e.target.dataset.target;
    let v=+document.getElementById(id).textContent;
    v=Math.max(0,v+parseInt(e.target.dataset.delta));
    document.getElementById(id).textContent=v;
    updateTotal();
  }
});

// Reset form
function clearForm(){
  for(let k in PRICE) document.getElementById(k).textContent="0";
  updateTotal();
  document.getElementById("waiter").value="";
  document.getElementById("table").value="";
}

// Aggiungi ordine
document.getElementById("order-form").addEventListener("submit",e=>{
  e.preventDefault();
  const waiter=document.getElementById("waiter").value.trim();
  const table=+document.getElementById("table").value;
  const q=readQ(); const t=total(q);
  if(!waiter||!table||t<=0){alert("Compila correttamente");return;}
  const items=[];
  for(let k in q){
    if(q[k]>0) items.push(`${LABELS[k]} × ${q[k]}`);
  }
  ORDERS.push({waiter,table,quantities:q,items,total:t,status:"pending",createdAt:Date.now()});
  clearForm();
});

// Renderizza ordini
function renderOrders(snap){
  const data=snap.val()||{};
  const list=document.getElementById("orders-list");
  list.innerHTML="";
  let tot=0,active=0,ready=0,delivered=0;
  const filter=document.getElementById("status-filter").value;

  Object.entries(data).sort((a,b)=>a[1].createdAt-b[1].createdAt).forEach(([id,o])=>{
    tot+=o.total||0;
    if(o.status==="pending")active++;
    else if(o.status==="ready")ready++;
    else if(o.status==="delivered")delivered++;
    if(filter!=="all"&&o.status!==filter)return;
    const time=new Date(o.createdAt).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
    const div=document.createElement("div");div.className="order";
    div.innerHTML=`<div class="order-head"><strong>Tavolo ${o.table}</strong> - Cameriere: ${o.waiter} - ${time} <span class="badge ${o.status}">${o.status}</span></div>
      <ul class="order-items">${(o.items||[]).map(it=>"<li>"+it+"</li>").join("")}</ul>
      <div><strong>Totale: ${€(o.total)}</strong></div>
      <div class="order-actions">
        ${o.status!=="ready"?`<button class="btn primary" data-act="ready" data-id="${id}">Pronto</button>`:""}
        ${o.status!=="delivered"?`<button class="btn blue" data-act="delivered" data-id="${id}">Consegnato</button>`:""}
        <button class="btn danger" data-act="delete" data-id="${id}">Elimina</button>
      </div>`;
    list.appendChild(div);
  });
  document.getElementById("kpi-total").textContent=€(tot);
  document.getElementById("kpi-active").textContent=active;
  document.getElementById("kpi-ready").textContent=ready;
  document.getElementById("kpi-delivered").textContent=delivered;
}

ORDERS.on("value",renderOrders);

// Filtro ordini
document.getElementById("status-filter").addEventListener("change",()=>{
  ORDERS.once("value").then(renderOrders);
});

// Gestione stati
document.getElementById("orders-list").addEventListener("click",e=>{
  if(e.target.dataset && e.target.dataset.act){
    const id=e.target.dataset.id;
    const act=e.target.dataset.act;
    if(act==="ready") ORDERS.child(id).update({status:"ready"});
    else if(act==="delivered") ORDERS.child(id).update({status:"delivered"});
    else if(act==="delete"){
      if(confirm("Eliminare ordine?")) ORDERS.child(id).remove();
    }
  }
});

// Pulsante Svuota fine serata
document.getElementById("clear-all").addEventListener("click",()=>{
  if(confirm("Sei sicuro di voler svuotare tutti gli ordini?")){
    ORDERS.remove();
  }
});
