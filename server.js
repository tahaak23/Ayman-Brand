const express = require('express');
const { google } = require('googleapis');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static('public'));

const auth = new google.auth.GoogleAuth({
  keyFile: 'credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

app.get('/api/products', async (req, res) => {
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SHEET_ID,
      range: 'Stock!A2:F100',
    });
    const rows = response.data.values || [];
    const products = rows.map((row) => ({
      id: row[0],
      name: row[1],
      price: row[2],
      sizes: row[3] ? row[3].split(',') : [],
      colors: row[4] ? row[4].split(',') : [],
      image: row[5],
    }));
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/order', async (req, res) => {
  try {
    const { name, phone, address, city, product, size, color } = req.body;
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SHEET_ID,
      range: 'Commandes!A:H',
      valueInputOption: 'RAW',
      resource: {
        values: [[
          new Date().toLocaleString('fr-MA'),
          name, phone, address, city, product, size, color
        ]],
      },
    });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Serveur demarre sur http://localhost:' + PORT);
});
