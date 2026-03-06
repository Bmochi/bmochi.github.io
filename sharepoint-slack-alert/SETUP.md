# SharePoint → Slack Alert — Setup Guide

## What it does

Runs a Node.js script that:
1. Reads the **usedRange** of an Excel sheet stored on SharePoint.
2. Compares the current row count to the last known count (stored in `state.json`).
3. Sends a **Slack message** for every new row it finds.

---

## 1. Create an Azure App Registration

1. Go to **Azure Portal → Azure Active Directory → App registrations → New registration**.
2. Give it a name (e.g. `sharepoint-slack-alert`) and click **Register**.
3. Under **Certificates & secrets**, create a **New client secret** — copy the value immediately.
4. Under **API permissions**, add:
   - `Microsoft Graph → Application permissions → Sites.Read.All`
   - `Microsoft Graph → Application permissions → Files.Read.All`
5. Click **Grant admin consent**.
6. Copy your **Tenant ID**, **Client ID**, and **Client Secret** into `.env`.

---

## 2. Find your Drive ID and File ID

With your token in hand, call the Graph API (use the [Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer) or `curl`):

```bash
# List sites — find your SharePoint site ID
GET https://graph.microsoft.com/v1.0/sites?search=yourcompany

# List drives in the site
GET https://graph.microsoft.com/v1.0/sites/{site-id}/drives

# List files in the drive root
GET https://graph.microsoft.com/v1.0/drives/{drive-id}/root/children
```

Copy `SHAREPOINT_DRIVE_ID` and `EXCEL_FILE_ID` into `.env`.

---

## 3. Create a Slack Incoming Webhook

1. Go to your Slack workspace → **Apps → Incoming Webhooks**.
2. Click **Add to Slack**, pick the channel you want alerts in.
3. Copy the **Webhook URL** into `SLACK_WEBHOOK_URL` in `.env`.

---

## 4. Install and run

```bash
cd sharepoint-slack-alert
cp .env.example .env
# Fill in all values in .env

npm install
node index.js
```

The first run sets the baseline (no alerts sent). Every subsequent run alerts on **new rows only**.

---

## 5. Schedule it (cron)

To poll every 5 minutes, add this to your crontab (`crontab -e`):

```cron
*/5 * * * * cd /absolute/path/to/sharepoint-slack-alert && node index.js >> alert.log 2>&1
```

---

## Slack message example

```
📋 New Input Request
───────────────────
*Requester*        *Date*
Jane Doe           2026-03-06

*Request Type*     *Details*
Access Request     Need access to the Q1 budget file

Detected at 3/6/2026, 10:05:00 AM
```
