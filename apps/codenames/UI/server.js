import express from 'express';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 443;
const SSL_KEY_PATH = process.env.SSL_KEY_PATH;
const SSL_CERT_PATH = process.env.SSL_CERT_PATH;
const SSL_CA_PATH = process.env.SSL_CA_PATH; // Optional: CA bundle path

app.use(express.static(path.join(__dirname, 'dist')));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
try {
  const httpsOptions = {
    key: fs.readFileSync(SSL_KEY_PATH),
    cert: fs.readFileSync(SSL_CERT_PATH)
  };
  
  // Add CA bundle if provided
  if (SSL_CA_PATH) {
    httpsOptions.ca = fs.readFileSync(SSL_CA_PATH);
  }
  
  https.createServer(httpsOptions, app).listen(PORT, () => {
    console.log(`✓ HTTPS Server is running on https://mainframe.iguanodon-matrix.ts.net:${PORT}`);
  });
} catch (error) {
  console.error('Failed to start HTTPS server:', error.message);
  process.exit(1);
}
