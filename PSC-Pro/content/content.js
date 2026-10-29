console.log("🚀 PSC Pro v1: Full Engine Loaded!");

// ========================================================
// 1. INJECT STYLES FOR THE FLOATING WIDGET
// ========================================================
if (!document.getElementById("psc-styles")) {
  const style = document.createElement('style');
  style.id = "psc-styles";
  style.textContent = `
    #psc-widget {
      position: fixed;
      top: 80px;
      right: 20px;
      z-index: 999999;
      width: 270px;
      background: #1E222D;
      border: 1px solid #363A45;
      border-radius: 8px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.6);
      font-family: -apple-system, BlinkMacSystemFont, 'Trebuchet MS', Roboto, sans-serif;
      color: #D1D4DC;
      font-size: 12px;
      user-select: none;
    }
    .psc-header {
      background: #131722;
      padding: 10px 12px;
      border-bottom: 1px solid #363A45;
      border-radius: 8px 8px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: grab;
    }
    .psc-header:active {
      cursor: grabbing;
    }
    .psc-title {
      font-weight: bold;
      color: #2962FF;
      font-size: 12px;
      letter-spacing: 0.5px;
    }
    .psc-badge {
      background: #2962FF;
      color: #fff;
      font-size: 9px;
      padding: 2px 6px;
      border-radius: 3px;
      font-weight: bold;
    }
    .psc-body {
      padding: 12px;
    }
    .psc-row {
      margin-bottom: 8px;
    }
    .psc-label {
      display: block;
      font-size: 10px;
      color: #787B86;
      margin-bottom: 3px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .psc-input {
      width: 100%;
      background: #2A2E39;
      border: 1px solid #363A45;
      border-radius: 4px;
      padding: 6px 8px;
      color: #fff;
      font-size: 12px;
      font-family: 'Monaco', 'Consolas', monospace;
      outline: none;
      box-sizing: border-box;
    }
    .psc-input:focus {
      border-color: #2962FF;
    }
    .psc-result-box {
      background: #131722;
      border: 1px solid #26A69A;
      border-radius: 6px;
      padding: 10px;
      text-align: center;
      margin-top: 10px;
    }
    .psc-lot-val {
      font-size: 22px;
      font-weight: 800;
      color: #26A69A;
      font-family: 'Monaco', 'Consolas', monospace;
    }
    .psc-sync-status {
      font-size: 9px;
      color: #FF9800;
      text-align: center;
      margin-top: 8px;
    }
  `;
  document.head.appendChild(style);
}

// ========================================================
// 2. CREATE FLOATING WIDGET HTML
// ========================================================
function createWidget() {
  if (document.getElementById("psc-widget")) return;

  const widget = document.createElement("div");
  widget.id = "psc-widget";
  widget.innerHTML = `
    <div class="psc-header" id="psc-header-drag">
      <span class="psc-title">⚡ PSC PRO v1</span>
      <span class="psc-badge" id="psc-sym">PAIR</span>
    </div>
    <div class="psc-body">
      <div class="psc-row">
        <label class="psc-label">Account Balance ($)</label>
        <input type="number" id="psc-balance" class="psc-input" value="10000">
      </div>
      <div class="psc-row" style="display:flex; gap:8px;">
        <div style="flex:1">
          <label class="psc-label">Risk %</label>
          <input type="number" id="psc-risk-pct" class="psc-input" value="1" step="0.1">
        </div>
        <div style="flex:1">
          <label class="psc-label">Risk ($)</label>
          <input type="number" id="psc-risk-usd" class="psc-input" value="100" readonly>
        </div>
      </div>
      <div class="psc-row" style="display:flex; gap:8px;">
        <div style="flex:1">
          <label class="psc-label">Entry Price</label>
          <input type="number" id="psc-entry" class="psc-input" placeholder="0.00" step="any">
        </div>
        <div style="flex:1">
          <label class="psc-label">Stop Loss</label>
          <input type="number" id="psc-sl" class="psc-input" placeholder="0.00" step="any">
        </div>
      </div>
      
      <div class="psc-result-box">
        <div class="psc-label" style="color:#26A69A">Recommended Position Size</div>
        <div class="psc-lot-val" id="psc-lots">0.00 LOTS</div>
        <div style="font-size:10px; color:#787B86; margin-top:2px;" id="psc-pips-info">0 Pips Risk</div>
      </div>

      <div class="psc-sync-status" id="psc-status">🟢 Auto-Sync Active (Open Tool Box to Read)</div>
    </div>
  `;
  document.body.appendChild(widget);

  // Bind Input Change Events
  document.getElementById("psc-balance").addEventListener("input", calculate);
  document.getElementById("psc-risk-pct").addEventListener("input", calculate);
  document.getElementById("psc-entry").addEventListener("input", calculate);
  document.getElementById("psc-sl").addEventListener("input", calculate);

  // Enable Dragging
  makeDraggable();
}

// ========================================================
// 3. MAKE WIDGET DRAGGABLE
// ========================================================
function makeDraggable() {
  const widget = document.getElementById("psc-widget");
  const header = document.getElementById("psc-header-drag");

  if (!widget || !header || widget.dataset.draggable === "true") return;
  widget.dataset.draggable = "true";

  let startX = 0, startY = 0, initialLeft = 0, initialTop = 0;

  header.addEventListener("mousedown", (e) => {
    e.preventDefault();
    startX = e.clientX;
    startY = e.clientY;
    
    const rect = widget.getBoundingClientRect();
    initialLeft = rect.left;
    initialTop = rect.top;

    function onMouseMove(e) {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      widget.style.left = `${initialLeft + dx}px`;
      widget.style.top = `${initialTop + dy}px`;
      widget.style.right = "auto"; // Override right positioning
    }

    function onMouseUp() {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });
}

// ========================================================
// 4. CALCULATION ENGINE (FOREX + GOLD + FUTURES)
// ========================================================
function calculate() {
  const balance = parseFloat(document.getElementById("psc-balance").value) || 0;
  const riskPct = parseFloat(document.getElementById("psc-risk-pct").value) || 0;
  const entry = parseFloat(document.getElementById("psc-entry").value) || 0;
  const sl = parseFloat(document.getElementById("psc-sl").value) || 0;

  // Sync Risk USD Field
  const riskUSD = (balance * (riskPct / 100)).toFixed(2);
  document.getElementById("psc-risk-usd").value = riskUSD;

  if (entry <= 0 || sl <= 0 || entry === sl) {
    document.getElementById("psc-lots").textContent = "0 UNITS";
    document.getElementById("psc-pips-info").textContent = "Enter Entry & SL";
    return;
  }

  const rawSymbol = (document.getElementById("psc-sym").textContent || "FOREX").toUpperCase();
  const stopDistance = Math.abs(entry - sl);

  // ----------------------------------------------------
  // A) FUTURES CONTRACT DICTIONARY (Point Values)
  // ----------------------------------------------------
  const futuresSpecs = {
    "NQ": 20,    // E-mini Nasdaq ($20 / pt)
    "MNQ": 2,    // Micro Nasdaq ($2 / pt)
    "ES": 50,    // E-mini S&P 500 ($50 / pt)
    "MES": 5,    // Micro S&P 500 ($5 / pt)
    "YM": 5,     // E-mini Dow ($5 / pt)
    "MYM": 0.5,  // Micro Dow ($0.50 / pt)
    "CL": 1000,  // Crude Oil ($1000 / pt or $10 / tick)
    "MCL": 100,  // Micro Crude ($100 / pt)
    "GC": 100,   // Gold Futures ($100 / pt)
    "MGC": 10    // Micro Gold ($10 / pt)
  };

  // Check if current symbol is a Futures contract
  let isFutures = false;
  let pointValue = 0;
  let matchedContract = "";

  for (let code in futuresSpecs) {
    if (rawSymbol.startsWith(code)) {
      isFutures = true;
      pointValue = futuresSpecs[code];
      matchedContract = code;
      break;
    }
  }

  // ----------------------------------------------------
  // B) CALCULATION LOGIC
  // ----------------------------------------------------
  if (isFutures) {
    // FUTURES MATH: Contracts = RiskUSD / (Points * PointValue)
    // Futures contracts CANNOT be decimals. We round DOWN to protect account risk!
    const rawContracts = riskUSD / (stopDistance * pointValue);
    const contracts = Math.max(1, Math.floor(rawContracts));

    document.getElementById("psc-lots").textContent = `${contracts} CONTRACT${contracts > 1 ? 'S' : ''}`;
    document.getElementById("psc-pips-info").textContent = `${stopDistance.toFixed(2)} Pts Risk | ${matchedContract} ($${pointValue}/pt)`;
  
  } else {
    // FOREX / GOLD MATH: Measured in Lots (Decimals allowed)
    let pipSize = 0.0001;
    if (rawSymbol.includes("JPY")) {
      pipSize = 0.01;
    } else if (rawSymbol.includes("XAU") || rawSymbol.includes("GOLD")) {
      pipSize = 0.1;
    }

    const pips = (stopDistance / pipSize).toFixed(1);
    let lotSize = 0;

    if (rawSymbol.includes("JPY")) {
      lotSize = (riskUSD / (pips * 6.8)).toFixed(2);
    } else if (rawSymbol.includes("XAU") || rawSymbol.includes("GOLD")) {
      lotSize = (riskUSD / (stopDistance * 100)).toFixed(2);
    } else {
      lotSize = (riskUSD / (pips * 10)).toFixed(2);
    }

    if (lotSize < 0.01) lotSize = "0.01";

    document.getElementById("psc-lots").textContent = `${lotSize} LOTS`;
    document.getElementById("psc-pips-info").textContent = `${pips} Pips Risk | Risk: $${riskUSD}`;
  }
}

// ========================================================
// 5. TRADINGVIEW TOOL AUTO-SYNC DETECTOR
// ========================================================
setInterval(() => {
  createWidget();

  // Auto-Detect Symbol from Browser Tab Title
  const tabTitle = document.title;
  if (tabTitle && !tabTitle.startsWith("TradingView")) {
    const currentSym = tabTitle.split(" ")[0];
    const symBadge = document.getElementById("psc-sym");
    if (symBadge && symBadge.textContent !== currentSym) {
      symBadge.textContent = currentSym;
      calculate();
    }
  }

  // Scan for open TradingView Position Tool Dialog
  const dialogs = document.querySelectorAll('div[class*="dialog-"], div[data-dialog-name], .tv-dialog');
  if (dialogs.length > 0) {
    dialogs.forEach(dialog => {
      const inputs = dialog.querySelectorAll('input');
      
      let accountSize = null;
      let riskPercent = null;
      let entryPrice = null;
      let stopLossPrice = null;

      inputs.forEach(input => {
        const row = input.closest('tr') || input.closest('div[class*="row-"]') || input.parentElement?.parentElement;
        const labelText = row ? row.textContent.toLowerCase() : "";
        const val = parseFloat(input.value.replace(/,/g, ''));

        if (isNaN(val)) return;

        if (labelText.includes("account size")) accountSize = val;
        else if (labelText.includes("risk") && labelText.includes("%")) riskPercent = val;
        else if (labelText.includes("entry price") || labelText.includes("entry")) entryPrice = val;
        else if (labelText.includes("stop level") && labelText.includes("price")) stopLossPrice = val;
      });

      // Fallback: Default Array Index mapping for TV Position Tool
      if (!entryPrice || !stopLossPrice) {
        const vals = Array.from(inputs).map(i => parseFloat(i.value.replace(/,/g, ''))).filter(v => !isNaN(v) && v > 0);
        if (vals.length >= 5) {
          accountSize = vals[0] || accountSize;
          riskPercent = vals[2] || riskPercent;
          entryPrice = vals[3];
          stopLossPrice = vals[vals.length - 1]; // SL Price is at the bottom
        }
      }

      // Auto-Fill Widget Fields if detected
      if (entryPrice && stopLossPrice && entryPrice !== stopLossPrice) {
        const entryInput = document.getElementById("psc-entry");
        const slInput = document.getElementById("psc-sl");
        const balanceInput = document.getElementById("psc-balance");
        const riskInput = document.getElementById("psc-risk-pct");

        let updated = false;

        if (accountSize && balanceInput.value != accountSize) {
          balanceInput.value = accountSize;
          updated = true;
        }
        if (riskPercent && riskInput.value != riskPercent) {
          riskInput.value = riskPercent;
          updated = true;
        }
        if (entryInput.value != entryPrice) {
          entryInput.value = entryPrice;
          updated = true;
        }
        if (slInput.value != stopLossPrice) {
          slInput.value = stopLossPrice;
          updated = true;
        }

        if (updated) {
          calculate();
          const status = document.getElementById("psc-status");
          if (status) status.textContent = "⚡ Auto-Synced from TradingView Tool!";
        }
      }
    });
  }
}, 1000);