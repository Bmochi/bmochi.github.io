/**
 * SharePoint Excel → Slack Alert
 *
 * Polls an Excel file on SharePoint (via Microsoft Graph API) and sends a
 * Slack Incoming Webhook message whenever a new row appears in the sheet.
 *
 * Run manually:       node index.js
 * Run on a schedule:  add to crontab, e.g. every 5 min:
 *   */5 * * * * cd /path/to/sharepoint-slack-alert && node index.js >> alert.log 2>&1
 */

require("dotenv").config();
const https = require("https");
const fs = require("fs");
const path = require("path");

// ─── Config (from .env) ──────────────────────────────────────────────────────
const {
  TENANT_ID,
  CLIENT_ID,
  CLIENT_SECRET,
  SHAREPOINT_SITE_ID,   // e.g. "yourcompany.sharepoint.com,<site-id>,<web-id>"
  SHAREPOINT_DRIVE_ID,  // Drive (document library) ID
  EXCEL_FILE_ID,        // Item ID of the .xlsx file in the drive
  EXCEL_SHEET_NAME,     // Sheet tab name, e.g. "Requests"
  EXCEL_HEADER_ROW,     // Row number of the header (1-based), default 1
  SLACK_WEBHOOK_URL,    // Full Incoming Webhook URL
  STATE_FILE,           // Path to local state JSON, default ./state.json
} = process.env;

const HEADER_ROW = parseInt(EXCEL_HEADER_ROW || "1", 10);
const STATE_PATH = STATE_FILE || path.join(__dirname, "state.json");

// ─── Helpers ─────────────────────────────────────────────────────────────────

function httpsRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch {
            resolve(data);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

// ─── Microsoft Graph Auth ─────────────────────────────────────────────────────

async function getAccessToken() {
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    scope: "https://graph.microsoft.com/.default",
  }).toString();

  const options = {
    hostname: "login.microsoftonline.com",
    path: `/${TENANT_ID}/oauth2/v2.0/token`,
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": Buffer.byteLength(body),
    },
  };

  const res = await httpsRequest(options, body);
  return res.access_token;
}

// ─── Read Excel via Graph ─────────────────────────────────────────────────────

async function getSheetRows(token) {
  // Graph endpoint: GET /drives/{drive-id}/items/{item-id}/workbook/worksheets/{sheet}/usedRange
  const sheetEncoded = encodeURIComponent(EXCEL_SHEET_NAME);
  const path =
    `/v1.0/drives/${SHAREPOINT_DRIVE_ID}/items/${EXCEL_FILE_ID}` +
    `/workbook/worksheets/${sheetEncoded}/usedRange`;

  const options = {
    hostname: "graph.microsoft.com",
    path,
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  };

  const res = await httpsRequest(options);
  // res.values is a 2-D array: [[col1, col2, ...], [val1, val2, ...], ...]
  return res.values || [];
}

// ─── State helpers ────────────────────────────────────────────────────────────

function loadState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_PATH, "utf8"));
  } catch {
    return { lastRowCount: HEADER_ROW }; // nothing seen yet beyond header
  }
}

function saveState(state) {
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

// ─── Slack notification ───────────────────────────────────────────────────────

async function sendSlackAlert(headers, row) {
  // Build a simple key:value message from headers + row data
  const fields = headers.map((h, i) => ({
    type: "mrkdwn",
    text: `*${h}*\n${row[i] !== undefined && row[i] !== "" ? row[i] : "—"}`,
  }));

  const payload = JSON.stringify({
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "📋 New Input Request",
          emoji: true,
        },
      },
      {
        type: "section",
        fields: fields.slice(0, 10), // Slack max 10 fields per section
      },
      ...(fields.length > 10
        ? [{ type: "section", fields: fields.slice(10, 20) }]
        : []),
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `Detected at ${new Date().toLocaleString()}`,
          },
        ],
      },
    ],
  });

  // Parse the webhook URL
  const url = new URL(SLACK_WEBHOOK_URL);
  const options = {
    hostname: url.hostname,
    path: url.pathname,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(payload),
    },
  };

  await httpsRequest(options, payload);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`[${new Date().toISOString()}] Checking SharePoint for new requests...`);

  // Validate required env vars
  const required = [
    "TENANT_ID", "CLIENT_ID", "CLIENT_SECRET",
    "SHAREPOINT_DRIVE_ID", "EXCEL_FILE_ID", "EXCEL_SHEET_NAME",
    "SLACK_WEBHOOK_URL",
  ];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) {
    console.error("Missing required environment variables:", missing.join(", "));
    console.error("Copy .env.example to .env and fill in the values.");
    process.exit(1);
  }

  const token = await getAccessToken();
  const allRows = await getSheetRows(token);

  if (allRows.length <= HEADER_ROW) {
    console.log("Sheet is empty (no data rows). Nothing to do.");
    return;
  }

  const headers = allRows[HEADER_ROW - 1]; // 0-indexed
  const dataRows = allRows.slice(HEADER_ROW);   // rows after the header

  const state = loadState();
  const previousCount = state.lastRowCount - HEADER_ROW; // how many data rows we've seen
  const newRows = dataRows.slice(previousCount);

  if (newRows.length === 0) {
    console.log(`No new rows (total data rows: ${dataRows.length}).`);
    return;
  }

  console.log(`Found ${newRows.length} new row(s). Sending Slack alerts...`);

  for (const row of newRows) {
    // Skip completely empty rows (can appear at the bottom of usedRange)
    if (row.every((cell) => cell === "" || cell === null)) continue;
    await sendSlackAlert(headers, row);
    console.log("  Sent alert for row:", row.join(" | "));
  }

  state.lastRowCount = HEADER_ROW + dataRows.length;
  saveState(state);
  console.log(`Done. State updated to ${state.lastRowCount} total rows.`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
