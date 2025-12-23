const express = require("express");
const { google } = require("googleapis");

const app = express();
app.use(express.json());

const SPREADSHEET_ID = "1VemwPdy3OmSKld_XelA2ETH4V9MEMU5Wc6PnywvHqwE";
const RANGE = "Sheet1!A:B";

const auth = new google.auth.GoogleAuth({
  credentials: require("./service-account.json"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"]
});

const sheets = google.sheets({ version: "v4", auth });

app.post("/verify", async (req, res) => {
  const userEmp = req.body.emp_code?.toString().trim();
  const userDob = req.body.dob?.toString().trim();

  if (!userEmp || !userDob) {
    return res.json({ status: "failed", message: "Missing data" });
  }

  const sheetRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: RANGE,
  });

  const rows = sheetRes.data.values;
  let matched = false;

  for (let i = 1; i < rows.length; i++) {
    const emp = rows[i][0]?.toString().trim();
    const dob = rows[i][1]?.toString().trim();

    if (emp === userEmp && dob === userDob) {
      matched = true;
      break;
    }
  }

  res.json({
    status: matched ? "success" : "failed"
  });
});

app.listen(3000, () => {
  console.log("Webhook running on port 3000");
});
