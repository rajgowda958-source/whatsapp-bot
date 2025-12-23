const express = require("express");
const { google } = require("googleapis");

const app = express();
app.use(express.json());

// ===== CONFIG =====
const SPREADSHEET_ID = "1VemwPdy3OmSKld_XelA2ETH4V9MEMU5Wc6PnywvHqwE";
const RANGE = "Sheet1!A:B";

// Google auth using Render Environment Variable
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT),
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"]
});

const sheets = google.sheets({ version: "v4", auth });

// ===== VERIFY ENDPOINT =====
app.post("/verify", async (req, res) => {
  try {
    const userEmp = req.body.emp_code?.toString().trim();
    const userDob = req.body.dob?.toString().trim(); // DDMMYYYY

    if (!userEmp || !userDob) {
      return res.json({
        status: "failed",
        message: "Missing emp_code or dob"
      });
    }

    // Fetch sheet data
    const sheetRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE
    });

    const rows = sheetRes.data.values;
    let matched = false;

    // Start from row 1 (skip header)
    for (let i = 1; i < rows.length; i++) {
      const emp = rows[i][0]?.toString().trim();
      const dob = rows[i][1]?.toString().trim(); // DDMMYYYY

      if (emp === userEmp && dob === userDob) {
        matched = true;
        break;
      }
    }

    return res.json({
      status: matched ? "success" : "failed"
    });

  } catch (err) {
    console.error("Verification error:", err);
    return res.json({
      status: "error",
      message: "Server error"
    });
  }
});

// ===== START SERVER =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Webhook running on port ${PORT}`);
});
