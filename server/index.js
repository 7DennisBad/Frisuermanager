const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = 4000;

// Middleware
app.use(cors());
app.use(express.json());

// DHL OAuth2 Token holen (z. B. für Tracking oder andere APIs)
async function getDHLToken() {
  try {
    console.log('🔑 OAuth2 Token-Anfrage wird gesendet...');

    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', process.env.DHL_API_KEY);
    params.append('client_secret', process.env.DHL_API_SECRET);

    const response = await axios.post(
      'https://api-sandbox.dhl.com/auth/v1/token',
      params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        timeout: 10000
      }
    );

    console.log('✅ OAuth2 Token erfolgreich erhalten');
    return response.data.access_token;
  } catch (error) {
    console.error('❌ OAuth2 Token-Fehler:', error.response?.data || error.message);
    throw error;
  }
}

// DHL Basic Auth Header (für Versenden API)
function getBasicAuthHeader() {
  const username = process.env.DHL_GKP_USERNAME || 'user-valid';
  const password = process.env.DHL_GKP_PASSWORD || 'SandboxPasswort2023!';
  const credentials = Buffer.from(`${username}:${password}`).toString('base64');
  return `Basic ${credentials}`;
}

// Token testen
app.get('/api/dhl/token', async (req, res) => {
  try {
    const token = await getDHLToken();
    res.json({ access_token: token });
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: 'Token-Abruf fehlgeschlagen',
      message: error.response?.data || error.message
    });
  }
});

// Versandauftrag mit Basic Auth senden (Standard für DHL Versand API V2)
app.post('/api/dhl/shipment', async (req, res) => {
  try {
    console.log('📦 Versandauftrag wird vorbereitet...');

    const headers = {
      'Authorization': getBasicAuthHeader(),
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Accept-Language': 'de-DE'
    };


    const response = await axios.post(
      'https://api-sandbox.dhl.com/parcel/de/shipping/v2/shipments?validate=true',
      req.body,
      { headers, timeout: 30000 }
    );

    res.json({
      success: true,
      data: response.data,
      method: 'Basic Auth',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ DHL Fehler:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'DHL Shipment Fehler',
      message: error.response?.data || error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 DHL-API Server läuft auf http://localhost:${PORT}`);
});
