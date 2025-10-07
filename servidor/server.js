// SOCKETS/servidor/server.js
const express = require('express');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');
const admin = require('firebase-admin');

const app = express();
const server = http.createServer(app);
// permite la conexion en el mismo puerto o sea bidireccional
const wss = new WebSocket.Server({ server });

const PORT = 3000;

// Inicializar Firebase Admin
const serviceAccount = require('./firebase-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// Servir cliente
app.use(express.static(path.join(__dirname, '../cliente/public')));

// --- WebSocket ---
wss.on('connection', async (ws) => {
  console.log('Cliente conectado');

  // conectarse, mandamos historial desde Firestore
  try {
    const snapshot = await db.collection('mensajes').orderBy('fecha', 'asc').get();
    const historial = snapshot.docs.map(doc => ({
      usuario: doc.data().usuario,
      texto: doc.data().texto,
      fecha: doc.data().fecha?.toDate().toISOString() || new Date().toISOString()
    }));

    ws.send(JSON.stringify({ tipo: 'historial', mensajes: historial }));
  } catch (error) {
    console.error('Error obteniendo historial:', error);
  }

  // Al recibir mensaje nuevo
  ws.on('message', async (msg) => {
    try {
      const data = JSON.parse(msg);
      const { usuario, texto } = data;

      // Guarda en Firebase y lo manda a todos
      await db.collection('mensajes').add({
        usuario,
        texto,
        fecha: admin.firestore.FieldValue.serverTimestamp()
      });

      // Reenviar mensaje a todos los clientes conectados
      const broadcast = JSON.stringify({
        tipo: 'nuevo',
        usuario,
        texto,
        fecha: new Date().toISOString()
      });

      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(broadcast);
        }
      });
    } catch (error) {
      console.error('Error al procesar mensaje:', error);
    }
  });

  ws.on('close', () => console.log('Cliente desconectado'));
});

server.listen(PORT, () => {
  console.log(`Servidor WebSocket en http://localhost:${PORT}`);
});
