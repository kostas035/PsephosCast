import { CAVEATS } from "./greece-stats.js";
import { BLOCS } from "./greece-analysis-data.js";

// --- Helpers ---
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function stamp() {
  return new Date().toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function fileStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`;
}

function ce(v) {
  const s = String(v ?? "");
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function getDownloadConsent(defaultName, extension) {
  const userInput = window.prompt(
    "Ready to download!\n\nPlease enter a custom filename below. Click 'OK' to consent and download, or 'Cancel' to abort.", 
    defaultName
  );
  
  if (userInput === null) return null; 
  if (userInput.endsWith(extension)) return userInput;
  return `${userInput}${extension}`;
}

// NEW: Converts the image to Base64 so MS Word doesn't block it
async function getBase64ImageFromUrl(imageUrl) {
  try {
    const res = await fetch(imageUrl);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn("Could not encode image to Base64. Falling back to URL.", err);
    return imageUrl; 
  }
}

// --- Data Transformer ---
export function buildExportSheets(report) {
  if (!report) return {};
  const sheets = {};

  if (report.frame && report.frame.length) {
    const baseCols = ["id", "name", "region", "is_island", "is_urban", "primary_economy", "population_size", "registered_electors", "valid_votes", "turnout_pct"];
    const varCols = report.meta.vars || [];
    let subjCols = [];
    
    (report.meta.subjects || []).forEach(sub => {
      const key = Object.keys(BLOCS).includes(sub) ? sub : sub.toLowerCase();
      subjCols.push(`base_${key}`);
      if (report.meta.scenarioKey !== "none") {
        subjCols.push(`scen_${key}`, `swing_abs_${key}`, `swing_prop_${key}`);
      }
    });
    
    const allCols = [...new Set([...baseCols, ...varCols, ...subjCols])];
    
    sheets["Flat_Data_Matrix"] = report.frame.map(row => {
      const newRow = {};
      allCols.forEach(c => newRow[c] = row[c]);
      return newRow;
    });
  }

  if (report.descriptives) {
    sheets["Descriptives"] = Object.entries(report.descriptives).map(([variable, stats]) => ({
      Variable: variable.replace("base_", ""),
      Mean: stats.mean, Median: stats.median, Standard_Deviation: stats.sd,
      Min: stats.min, Max: stats.max, IQR: stats.iqr, CV_Pct: stats.cv,
      CI_95_Lower: stats.ciMean?.[0], CI_95_Upper: stats.ciMean?.[1],
      Skewness: stats.skew, Excess_Kurtosis: stats.kurt,
      Shapiro_Wilk_W: stats.shapiro?.W, Shapiro_Wilk_p: stats.shapiro?.p
    }));
  }

  if (report.bivariate && report.bivariate.pairs) {
    sheets["Bivariate_Details"] = report.bivariate.pairs.map(p => ({
      Dependent: p.y.replace("base_", ""), Independent: p.x.replace("base_", ""),
      Pearson_r: p.pearson.r, Spearman_rho: p.spearman.rho,
      Kendall_tau: p.kendall.tau, Kendall_p: p.kendall.p
    }));
  }

  if (report.group) {
    const gRows = [];
    Object.entries(report.group).forEach(([y, tests]) => {
      gRows.push({
        Dependent: y.replace("base_", ""), Split: "Island vs Mainland",
        Mean_True: tests.island.t.meanA, Mean_False: tests.island.t.meanB,
        Mean_Diff: tests.island.t.diff, Cohen_d: tests.island.t.cohenD,
        Welch_t: tests.island.t.t, t_p_value: tests.island.t.p,
        Mann_Whitney_U: tests.island.u.U, MW_p_value: tests.island.u.p
      });
      gRows.push({
        Dependent: y.replace("base_", ""), Split: "Urban vs Rural",
        Mean_True: tests.urban.t.meanA, Mean_False: tests.urban.t.meanB,
        Mean_Diff: tests.urban.t.diff, Cohen_d: tests.urban.t.cohenD,
        Welch_t: tests.urban.t.t, t_p_value: tests.urban.t.p,
        Mann_Whitney_U: tests.urban.u.U, MW_p_value: tests.urban.u.p
      });
    });
    sheets["Group_Comparisons"] = gRows;
  }

  if (report.regression) {
    const regRows = [];
    Object.entries(report.regression).forEach(([y, model]) => {
      regRows.push({
        Model_Dependent: y.replace("base_", ""), Predictor: "--- MODEL SUMMARY ---",
        Coefficient: null, SE: null, t_Stat: null, p_Value: null, VIF: null,
        Adj_R2: model.adjR2, F_Stat: model.fStat, Durbin_Watson: model.durbinWatson
      });
      const predictors = ["Intercept", ...report.meta.vars];
      predictors.forEach((pred, i) => {
        regRows.push({
          Model_Dependent: y.replace("base_", ""), Predictor: pred,
          Coefficient: model.coefficients ? model.coefficients[i] : null,
          SE: model.standardErrors ? model.standardErrors[i] : null,
          t_Stat: model.tStats ? model.tStats[i] : null,
          p_Value: model.pValues ? model.pValues[i] : null,
          VIF: i === 0 ? null : (model.vif ? model.vif[i-1] : null), 
          Adj_R2: null, F_Stat: null, Durbin_Watson: null
        });
      });
    });
    sheets["Regression_Models"] = regRows;
  }

  return sheets;
}

// --- Exports ---
export function exportCSV(report) {
  const finalName = getDownloadConsent(`psephos_analytics_${fileStamp()}`, ".csv");
  if (!finalName) return;

  const sheets = buildExportSheets(report);
  if (Object.keys(sheets).length === 0) return;

  let csvContent = "\uFEFF"; 
  const meta = report.meta || {};
  csvContent += `Generated:,${stamp()}\nUnit:,${meta.unit}\nBaseline:,${meta.baselineKey}\nScenario:,${meta.scenarioKey}\nN:,${report.frame?.length || 0}\n\n\n`;
  
  Object.entries(sheets).forEach(([sheetName, rows]) => {
    if (!rows.length) return;
    csvContent += `--- ${sheetName.toUpperCase()} ---\n`;
    const headers = Object.keys(rows[0]);
    csvContent += headers.map(ce).join(",") + "\n";
    rows.forEach(row => { csvContent += headers.map(h => ce(row[h])).join(",") + "\n"; });
    csvContent += "\n\n";
  });

  csvContent += `--- CAVEATS ---\n`;
  (CAVEATS || []).forEach((c, i) => { csvContent += `${i + 1}. ${ce(c)}\n`; });

  downloadBlob(new Blob([csvContent], { type: "text/csv;charset=utf-8;" }), finalName);
}

export function exportXLSX(report) {
  const finalName = getDownloadConsent(`psephos_analytics_${fileStamp()}`, ".xlsx");
  if (!finalName) return;

  const sheets = buildExportSheets(report);
  if (Object.keys(sheets).length === 0) return;

  if (typeof window !== "undefined" && window.XLSX) {
    const wb = window.XLSX.utils.book_new();
    const meta = report.meta || {};
    const infoData = [
      { Property: "Generated", Value: stamp() }, { Property: "Unit", Value: meta.unit },
      { Property: "Baseline", Value: meta.baselineKey }, { Property: "Scenario", Value: meta.scenarioKey },
      { Property: "N", Value: report.frame?.length || 0 }
    ];
    window.XLSX.utils.book_append_sheet(wb, window.XLSX.utils.json_to_sheet(infoData), "Run_Info");
    
    Object.entries(sheets).forEach(([sheetName, rows]) => {
      if (rows.length) {
        const ws = window.XLSX.utils.json_to_sheet(rows);
        window.XLSX.utils.book_append_sheet(wb, ws, sheetName);
      }
    });

    const caveatsData = (CAVEATS || []).map((c, i) => ({ "#": i + 1, Caveat: c }));
    window.XLSX.utils.book_append_sheet(wb, window.XLSX.utils.json_to_sheet(caveatsData), "Caveats");

    window.XLSX.writeFile(wb, finalName);
  } else {
    alert("XLSX Library not loaded. Exporting structured CSV instead.");
    exportCSV(report);
  }
}

// NOW ASYNC to allow Base64 encoding of the logo
export async function exportDoc(report) {
  if (!report) return;
  const finalName = getDownloadConsent(`psephos_report_${fileStamp()}`, ".doc");
  if (!finalName) return;

  const meta = report.meta || {};
  const sheets = buildExportSheets(report); 
  
  let tablesHtml = "";
  const flatMatrix = sheets["Flat_Data_Matrix"];
  
  Object.entries(sheets).forEach(([sheetName, rows]) => {
    if (!rows.length || sheetName === "Flat_Data_Matrix") return;
    tablesHtml += `<h2 style="color:#2563EB; font-family: Calibri, sans-serif;">${sheetName.replace(/_/g, " ")}</h2>`;
    tablesHtml += `<table style="border-collapse: collapse; width: 100%; margin-bottom: 30px; font-family: Calibri, sans-serif;"><thead><tr>`;
    const headers = Object.keys(rows[0]);
    headers.forEach(h => { tablesHtml += `<th style="background:#f3f4f6; border: 1px solid #d1d5db; text-align:left; padding:6px; font-size:10pt;">${h.replace(/_/g, " ")}</th>`; });
    tablesHtml += `</tr></thead><tbody>`;
    rows.forEach((row, i) => {
      const bg = i % 2 === 0 ? "#ffffff" : "#f9fafb";
      tablesHtml += `<tr style="background:${bg};">`;
      headers.forEach(h => {
        const val = row[h];
        const displayVal = typeof val === "number" && isFinite(val) ? val.toFixed(4) : (val || "—");
        tablesHtml += `<td style="border: 1px solid #d1d5db; padding:6px; font-size:10pt;">${displayVal}</td>`;
      });
      tablesHtml += `</tr>`;
    });
    tablesHtml += `</tbody></table>`;
  });

  const caveatsHtml = `
    <h2 style="color:#2563EB; font-family: Calibri, sans-serif;">Methodology & Caveats</h2>
    <ul style="font-family: Calibri, sans-serif; font-size: 10pt; color: #4b5563;">
      ${CAVEATS ? CAVEATS.map(c => `<li style="margin-bottom: 6px;">${c}</li>`).join("") : "<li>Ecological inference applies.</li>"}
    </ul>
  `;

  let appendixHtml = "";
  if (flatMatrix && flatMatrix.length > 0) {
    appendixHtml += `<h2 style="color:#2563EB; font-family: Calibri, sans-serif;">Appendix: Data Matrix</h2>`;
    appendixHtml += `<table style="border-collapse: collapse; width: 100%; margin-bottom: 30px; font-family: Calibri, sans-serif; font-size: 8pt;"><thead><tr>`;
    const hdrs = Object.keys(flatMatrix[0]);
    hdrs.forEach(h => { appendixHtml += `<th style="background:#f3f4f6; border: 1px solid #d1d5db; text-align:left; padding:4px;">${h.replace(/_/g, " ")}</th>`; });
    appendixHtml += `</tr></thead><tbody>`;
    flatMatrix.forEach((row, i) => {
      const bg = i % 2 === 0 ? "#ffffff" : "#f9fafb";
      appendixHtml += `<tr style="background:${bg};">`;
      hdrs.forEach(h => {
        const val = row[h];
        const displayVal = typeof val === "number" && isFinite(val) ? val.toFixed(4) : (val || "—");
        appendixHtml += `<td style="border: 1px solid #d1d5db; padding:4px;">${displayVal}</td>`;
      });
      appendixHtml += `</tr>`;
    });
    appendixHtml += `</tbody></table>`;
  }

  // Generate the Base64 Image string
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const logoUrl = `${baseUrl}/correlationslogo.png`;
  const base64Logo = await getBase64ImageFromUrl(logoUrl);

  const html = `
    <!DOCTYPE html>
    <html><head><meta charset="utf-8"></head>
    <body style="font-family: Calibri, sans-serif; color: #111827;">
      
      <!-- TOP LOGO (Now Base64 Encoded) -->
      <div style="text-align: center; margin-bottom: 30px;">
        <img src="${base64Logo}" height="80" alt="PsephosCast.gr Logo" />
      </div>

      <h1 style="font-family: Calibri, sans-serif; text-align: center;">Correlations & Trends Report</h1>
      <p style="font-family: Calibri, sans-serif; font-size: 11pt; text-align: center;">
        <b>Generated:</b> ${stamp()} | <b>Unit:</b> ${meta.unit} | <b>Baseline:</b> ${meta.baselineKey} | <b>Scenario:</b> ${meta.scenarioKey} | <b>N:</b> ${report.frame?.length || 0}
      </p>
      <hr style="border:0;border-top:1px solid #e5e7eb;margin-bottom:20px;" />
      
      ${tablesHtml}
      ${caveatsHtml}
      
      <hr style="border:0;border-top:1px solid #e5e7eb;margin-bottom:20px;" />
      ${appendixHtml}

      <!-- BOTTOM LOGO (Now Base64 Encoded) -->
      <div style="text-align: center; margin-top: 50px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <img src="${base64Logo}" height="60" alt="PsephosCast.gr Logo" />
        <p style="font-size: 8pt; color: #6b7280; font-family: Calibri, sans-serif;">Generated by the Greece Electoral Swingometer</p>
      </div>

    </body></html>
  `;
  
  const blob = new Blob(["\uFEFF" + html], { type: "application/msword;charset=utf-8" });
  downloadBlob(blob, finalName);
}

export function exportPDF(containerId) {
  window.print();
}