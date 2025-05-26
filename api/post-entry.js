import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.SPREADSHEET_ID;

    const read = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'A2:F',
    });

    const existingCodes = (read.data.values || []).map(row => row[5]);

    const generateCode = () => {
      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
      let code;
      do {
        code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      } while (existingCodes.includes(code));
      return code;
    };

    const code = generateCode();
    const { type, message, paypal, allowShare } = req.body;

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'A2',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [[
          new Date().toISOString(),
          type,
          message,
          paypal || '',
          allowShare || '',
          code
        ]],
      },
    });

    res.status(200).json({ code });
  } catch (error) {
    console.error('Server Error:', error.response?.data || error.message || error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

