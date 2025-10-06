// SOCKETS/servidor/server.js
const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Servimos la carpeta del cliente (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '../cliente/public')));

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
