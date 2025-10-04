document.addEventListener("DOMContentLoaded", function() {

const PRICE={
  q_bionda_05:6, q_bionda_1:11,
  q_rossa_05:7, q_rossa_1:13,
  q_nf_05:7, q_nf_1:13,
  q_cola:4, q_nat:2, q_frizz:2
};

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
  document.getElementById("order-total").textContent = total(readQ()) + " €";
}

// Pulsanti + / –
document.addEventListener("click", e=>{
  if(e.target.dataset && e.target.dataset.delta){
    const id=e.target.dataset.target;
    let v=+document.getElementById(id).textContent;
    v=Math.max(0,v+parseInt(e.target.dataset.delta));
    document.getElementById(id).textContent=v;
    updateTotal();
  }
});

});
