// === Config prezzi ===
const PRICE = {
  bionda_05: 6,
  bionda_1: 11,
  rossa_05: 7,
  rossa_1: 13,
  nf_05: 7,
  nf_1: 13,
  cola: 4,
  nat: 2,
  frizz: 2,
};

// === Init Firebase ===
const firebaseConfig = window.__FIREBASE_CONFIG__;
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const ORDERS_REF = db.ref("orders");

// === Helpers ===
const € = (n) => `${n.toFixed(2).replace(".", ",")} €`;

function computeTotal(q) {
  let sum = 0;
  sum += (q.bionda_05 || 0) * PRICE.bionda_05;
  sum += (q.bionda_1  || 0) * PRICE.bionda_1;
  sum += (q.rossa_05  || 0) * PRICE.rossa_05;
  sum += (q.rossa_1   || 0) * PRICE.rossa_1;
  sum += (q.nf_05     || 0) * PRICE.nf_05;
  sum += (q.nf_1      || 0) * PRICE.nf_1;
  sum += (q.cola      || 0) * PRICE.cola;
  sum += (q.nat       || 0) * PRICE.nat;
  sum += (q.frizz     || 0) * PRICE.frizz;
  return sum;
}

function readQuantities() {
  const fields = {
    bionda_05: +document.getElementById("q_bionda_05").value || 0,
    bionda_1:  +document.getElementById("q_bionda_1").value  || 0,
    rossa_05:  +document.getElementById("q_rossa_05").value  || 0,
    rossa_1:   +document.getElementById("q_rossa_1").value   || 0,
    nf_05:     +document.getElementById("q_nf_05").value     || 0,
    nf_1:      +document.getElementById("q_nf_1").value      || 0,
    cola:      +document.getElementById("q_cola").value      || 0,
    nat:       +document.getElementById("q_nat").value       || 0,
    frizz:     +document.getElementById("q_frizz").value     || 0,
  };
  return fields;
}

function quantitiesToList(q) {
  const labels = {
    bionda_05: "Bionda 0,5L",
    bionda_1: "Bionda 1L",
    rossa_05: "Rossa 0,5L",
    rossa_1: "Rossa 1L",
    nf_05: "Non filtrata 0,5L",
    nf_1: "Non filtrata 1L",
    cola: "Coca-Cola",
    nat: "Acqua naturale",
    frizz: "Acqua frizzante",
  };
  const out = [];
  for (const k of Object.keys(q)) {
    if (q[k] > 0) out.push(`${labels[k]} × ${q[k]}`);
  }
  return out;
}

function clearForm() {
  document.getElementById("order-form").reset();
  document.getElementById("order-total").textContent = "0 €";
}

// === UI: calcolo totale live ===
for (const id of ["q_bionda_05","q_bionda_1","q_rossa_05","q_rossa_1","q_nf_05","q_nf_1","q_cola","q_nat","q_frizz"]) {
  document.getElementById(id).addEventListener("input", () => {
    const total = computeTotal(readQuantities());
    document.getElementById("order-total").textContent = €(total);
  });
}

// === Submit ordine ===
document.getElementById("order-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const waiter = document.getElementById("waiter").value.trim();
  const table = +document.getElementById("table").value;
  const q = readQuantities();
  const total = computeTotal(q);
  const anyQty = Object.values(q).some(v => v > 0);

  if (!waiter || !table || !anyQty) {
    alert("Compila cameriere, tavolo e almeno una quantità.");
    return;
  }

  const order = {
    waiter,
    table,
    quantities: q,
    items: quantitiesToList(q),
    total,
    status: "pending", // pending -> ready -> delivered
    createdAt: Date.now()
  };
  const newRef = ORDERS_REF.push();
  newRef.set(order);
  clearForm();
});

// Azzera form
document.getElementById("reset-form").addEventListener("click", clearForm);

// === Render ordini in tempo reale ===
const ordersListEl = document.getElementById("orders-list");
const emptyEl = document.getElementById("orders-empty");
const filterEl = document.getElementById("status-filter");

function renderOrders(snapshot) {
  const data = snapshot.val() || {};
  const ids = Object.keys(data).sort((a,b) => data[a].createdAt - data[b].createdAt);
  ordersListEl.innerHTML = "";
  let visibleCount = 0;

  let totalAll = 0, active = 0, ready = 0, delivered = 0;

  for (const id of ids) {
    const o = data[id];
    // KPI
    totalAll += o.total || 0;
    if (o.status === "pending") active++;
    else if (o.status === "ready") ready++;
    else if (o.status === "delivered") delivered++;

    // Filter
    const f = filterEl.value;
    if (f !== "all" && o.status !== f) continue;
    visibleCount++;

    const card = document.createElement("div");
    card.className = "order";
    const badgeClass = `badge ${o.status}`;
    const statusLabel = o.status === "pending" ? "In attesa" : o.status === "ready" ? "Pronto" : "Consegnato";
    const time = new Date(o.createdAt).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"});

    card.innerHTML = `
      <div class="order-head">
        <div>
          <strong>Tavolo ${o.table}</strong> · <span class="muted">Cameriere: ${o.waiter}</span> · <span class="muted">${time}</span>
        </div>
        <div class="${badgeClass}">${statusLabel}</div>
      </div>
      <ul class="order-items">${(o.items||[]).map(x=>`<li>${x}</li>`).join("")}</ul>
      <div class="order-foot" style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;">
        <div><strong>Totale: ${€(o.total||0)}</strong></div>
        <div class="order-actions">
          ${o.status !== "ready" ? `<button class="btn small" data-action="ready" data-id="${id}">Segna pronto</button>` : ""}
          ${o.status !== "delivered" ? `<button class="btn small" data-action="delivered" data-id="${id}">Segna consegnato</button>` : ""}
          <button class="btn small" data-action="delete" data-id="${id}">Elimina</button>
        </div>
      </div>
    `;
    ordersListEl.appendChild(card);
  }

  emptyEl.classList.toggle("hidden", visibleCount > 0);
  emptyEl.textContent = visibleCount>0 ? "" : "Nessun ordine per questo filtro.";

  // KPI update
  document.getElementById("kpi-total").textContent = €(totalAll);
  document.getElementById("kpi-active").textContent = String(active);
  document.getElementById("kpi-ready").textContent = String(ready);
  document.getElementById("kpi-delivered").textContent = String(delivered);
}

ORDERS_REF.on("value", renderOrders);

// Filtro
filterEl.addEventListener("change", () => {
  ORDERS_REF.once("value").then(renderOrders);
});

// Azioni sugli ordini (delegation)
ordersListEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const id = btn.getAttribute("data-id");
  const action = btn.getAttribute("data-action");

  if (action === "ready") {
    ORDERS_REF.child(id).update({status: "ready"});
  } else if (action === "delivered") {
    ORDERS_REF.child(id).update({status: "delivered"});
  } else if (action === "delete") {
    if (confirm("Eliminare definitivamente l'ordine?")) {
      ORDERS_REF.child(id).remove();
    }
  }
});

// Toggle viste
const orderSection = document.getElementById("order-section");
const listSection = document.getElementById("list-section");
const dashSection = document.getElementById("dashboard-section");

document.getElementById("view-orders").addEventListener("click", () => {
  orderSection.classList.remove("hidden");
  listSection.classList.remove("hidden");
  dashSection.classList.add("hidden");
  document.getElementById("view-orders").classList.add("primary");
  document.getElementById("view-dashboard").classList.remove("primary");
});
document.getElementById("view-dashboard").addEventListener("click", () => {
  orderSection.classList.add("hidden");
  listSection.classList.add("hidden");
  dashSection.classList.remove("hidden");
  document.getElementById("view-dashboard").classList.add("primary");
  document.getElementById("view-orders").classList.remove("primary");
});
