console.log("🚀 PSC Pro v1: Full Engine Loaded!");

// ========================================================
// 1. INJECT STYLES FOR THE FLOATING WIDGET
// ========================================================
if (!document.getElementById("psc-styles")) {
  const style = document.createElement('style');
  style.id = "psc-styles";
  style.textContent = `
    #psc-toggle {
      position: fixed;
      top: 80px;
      right: 20px;
      z-index: 1000000;
      border: 1px solid #363A45;
      border-radius: 8px;
      padding: 10px 14px;
      background: #131722;
      color: #fff;
      font: bold 12px -apple-system, BlinkMacSystemFont, sans-serif;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(0,0,0,0.4);
    }
    #psc-toggle:hover, #psc-toggle:focus-visible { background: #2962FF; }
    #psc-widget[hidden] { display: none !important; }
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

  const toggle = document.createElement("button");
  toggle.id = "psc-toggle";
  toggle.type = "button";
  toggle.textContent = "⚡ PSC Pro";
  toggle.setAttribute("aria-controls", "psc-widget");
  toggle.setAttribute("aria-expanded", "false");
  document.body.appendChild(toggle);

  const widget = document.createElement("div");
  widget.id = "psc-widget";
  widget.hidden = true;
  widget.innerHTML = `
    <div class="psc-header" id="psc-header-drag">
      <span class="psc-title">⚡ PSC PRO v1</span>
      <span class="psc-badge" id="psc-sym">PAIR</span>
      <button type="button" id="psc-close" aria-label="Close calculator" style="background:none;border:0;color:#D1D4DC;font-size:18px;cursor:pointer">×</button>
    </div>
    <div class="psc-body">
      <div class="psc-row">
        <label class="psc-label" for="psc-symbol-input">Symbol (edit if needed)</label>
        <input type="text" id="psc-symbol-input" class="psc-input" placeholder="e.g. EURUSD or XAUUSD">
      </div>
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

      <div class="psc-sync-status" id="psc-status"></div>
      <div style="font-size:10px;color:#aaa;margin-top:8px">Estimates only. Verify contract size, currency conversion and lot limits with your broker.</div>
    </div>
  `;
  document.body.appendChild(widget);

  const setOpen = (open) => {
    widget.hidden = !open;
    toggle.hidden = open;
    toggle.setAttribute("aria-expanded", String(open));
    if (open) document.getElementById("psc-close").focus();
    else toggle.focus();
  };
  toggle.addEventListener("click", () => setOpen(true));
  document.getElementById("psc-close").addEventListener("click", () => setOpen(false));
  document.getElementById("psc-symbol-input").addEventListener("input", (event) => {
    event.target.dataset.edited = event.target.value.trim() ? "true" : "";
    const symbol = event.target.value.trim().toUpperCase();
    document.getElementById("psc-sym").textContent = symbol || "PAIR";
    calculate();
  });
  const isTradingView = location.hostname === "tradingview.com" || location.hostname.endsWith(".tradingview.com");
  document.getElementById("psc-status").textContent = isTradingView
    ? "Open TradingView position tool to sync"
    : "Exness: open Long/Short Position settings to attempt sync; enter symbol manually";

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
    if (e.target.closest("button")) return;
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
  // Exness index CFDs such as US500 have broker-specific contract specifications.
  // Never treat them as ordinary forex pairs.
  if (location.hostname.endsWith(".exness.com") || location.hostname === "exness.com") {
    if (!/^(?:(?:EUR|GBP|AUD|NZD)USD|USDJPY|XAUUSD)$/.test(rawSymbol.replace(/[^A-Z]/g, ""))) {
      document.getElementById("psc-lots").textContent = "NOT AVAILABLE";
      document.getElementById("psc-pips-info").textContent = "Symbol needs broker-specific calculation";
      return;
    }
  }

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
    const contracts = Math.max(0, Math.floor(rawContracts));

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

    const pips = stopDistance / pipSize;
    let lotSize = 0;

    if (rawSymbol.includes("JPY")) {
      lotSize = (riskUSD / (pips * 6.8));
    } else if (rawSymbol.includes("XAU") || rawSymbol.includes("GOLD")) {
      lotSize = (riskUSD / (stopDistance * 100));
    } else {
      lotSize = (riskUSD / (pips * 10));
    }

    // Round down so the suggested size does not exceed the risk budget.
    lotSize = (Math.floor(Number(lotSize) * 100) / 100).toFixed(2);

    document.getElementById("psc-lots").textContent = `${lotSize} LOTS`;
    document.getElementById("psc-pips-info").textContent = `${pips.toFixed(1)} Pips Risk | Risk: $${riskUSD}`;
  }
}

// Read only explicitly labelled fields in a Long/Short Position settings dialog.
// Profit and stop both have a "Price" field, so track the section heading.
function syncExnessPosition() {
  const candidates = new Set();
  document.querySelectorAll("input").forEach(input => {
    if (input.closest("#psc-widget")) return;
    for (let node = input.parentElement; node && node !== document.body; node = node.parentElement) {
      const text = (node.textContent || "").toLowerCase();
      if (/\b(?:long|short) position\b/.test(text) && text.includes("account size") &&
          text.includes("entry price") && text.includes("stop level") &&
          node.querySelectorAll("input").length >= 4) {
        candidates.add(node);
        break;
      }
    }
  });
  // Do not guess when more than one dialog is present.
  if (candidates.size !== 1) return;
  const dialog = [...candidates][0];
  if (!dialog.getClientRects().length) return;
  const walker = document.createTreeWalker(dialog, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  let section = "", label = "";
  const found = {};
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.nodeValue.trim().toLowerCase().replace(/\s+/g, " ");
      if (text === "profit level" || text === "stop level") section = text;
      else if (["account size", "risk", "entry price", "price", "ticks"].includes(text)) label = text;
      continue;
    }
    if (node.tagName !== "INPUT") continue;
    const value = Number(node.value.replace(/,/g, "").trim());
    if (!node.value.trim() || !Number.isFinite(value) || value <= 0) { label = ""; continue; }
    if (label === "account size") found.balance = value;
    else if (label === "entry price") found.entry = value;
    else if (label === "price" && section === "stop level") found.stop = value;
    else if (label === "risk") {
      // Only a percent risk can be copied into the percentage field.
      let row = node.parentElement;
      for (let i = 0; i < 3 && row && !row.querySelector("select, [role=combobox]"); i++) row = row.parentElement;
      const selector = row && row.querySelector("select, [role=combobox]");
      const unit = selector && (selector.tagName === "SELECT" ? selector.selectedOptions[0]?.textContent : selector.textContent);
      if (unit && unit.trim() === "%") found.risk = value;
    }
    label = "";
  }
  if (!found.balance || !found.risk || !found.entry || !found.stop || found.entry === found.stop) return;
  const fields = { "psc-balance": found.balance, "psc-risk-pct": found.risk, "psc-entry": found.entry, "psc-sl": found.stop };
  let changed = false;
  for (const [id, value] of Object.entries(fields)) {
    const target = document.getElementById(id);
    if (document.activeElement !== target && Number(target.value) !== value) {
      target.value = value;
      changed = true;
    }
  }
  if (changed) calculate();
  document.getElementById("psc-status").textContent = "Position settings synced; verify symbol and values";
}

// ========================================================
// 5. TRADINGVIEW TOOL AUTO-SYNC DETECTOR
// ========================================================
setInterval(() => {
  createWidget();

  // Never apply TradingView's index-based fallback to Exness dialogs.
  if (!(location.hostname === "tradingview.com" || location.hostname.endsWith(".tradingview.com"))) {
    document.getElementById("psc-status").textContent = "Open Long/Short Position settings to attempt sync; enter symbol manually";
    syncExnessPosition();
    return;
  }

  // Auto-Detect Symbol from Browser Tab Title
  const tabTitle = document.title;
  if (tabTitle && !tabTitle.startsWith("TradingView")) {
    const currentSym = tabTitle.split(" ")[0];
    const symBadge = document.getElementById("psc-sym");
    const symbolInput = document.getElementById("psc-symbol-input");
    if (symBadge && !symbolInput.dataset.edited && symBadge.textContent !== currentSym) {
      symBadge.textContent = currentSym;
      symbolInput.value = currentSym;
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