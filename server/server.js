const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = 4000;

// DHL Sandbox API-Endpunkte
const DHL_AUTH_URL = 'https://api-sandbox.dhl.com/parcel/de/account/auth/ropc/v1/token';
const DHL_SHIP_URL = 'https://api-sandbox.dhl.com/parcel/de/shipping/v2/orders';

// Credentials – entweder aus .env oder Defaults
const DHL_CLIENT_ID = process.env.DHL_CLIENT_ID || 'j6s3AxrHZ8iUcqEI1C20C9HQb5JWAOhK';
const DHL_CLIENT_SECRET = process.env.DHL_CLIENT_SECRET || '8zecG2tp386wJ26i';
const DHL_USERNAME = process.env.DHL_GKP_USERNAME || 'user-valid';
const DHL_PASSWORD = process.env.DHL_GKP_PASSWORD || 'SandboxPasswort2023!';

// CORS – Erlaube alle lokalen Ports für Entwicklung
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // z.B. Postman
    if (
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:')
    ) return callback(null, true);
    callback(new Error('CORS blockiert: ' + origin));
  }
}));

app.use(express.json());

// Holt ein Auth-Token von DHL (entspricht curl)
async function fetchDHLToken() {
  const params = new URLSearchParams({
    grant_type: 'password',
    username: DHL_USERNAME,
    password: DHL_PASSWORD,
    client_id: DHL_CLIENT_ID,
    client_secret: DHL_CLIENT_SECRET
  });

  const headers = {
    'accept': 'application/json',
    'content-type': 'application/x-www-form-urlencoded'
  };

  const response = await axios.post(DHL_AUTH_URL, params, { headers });

  if (!response.data?.access_token) {
    throw new Error('Kein Token erhalten: ' + JSON.stringify(response.data));
  }

  return response.data.access_token;
}

// POST /api/dhl/shipment – Leitet Versandauftrag an DHL weiter
app.post('/api/dhl/shipment', async (req, res) => {
  try {
    const token = await fetchDHLToken();
    const dhlPayload = req.body;

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept-Language': 'de-DE'
    };

    const response = await axios.post(DHL_SHIP_URL, dhlPayload, {
      headers,
      timeout: 30000
    });

    res.json({
      success: true,
      data: response.data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const status = error.response?.status || 500;
    const errData = error.response?.data || error.message || 'Unbekannter Fehler';

    console.error('❌ DHL-Fehler:', errData);

    res.status(status).json({
      error: 'DHL Fehler',
      message: errData,
      status
    });
  }
});

// GET /health – Statusprüfung für Monitoring
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serverstart
app.listen(PORT, () => {
  console.log(`🚀 DHL Backend läuft auf http://localhost:${PORT}`);
});
