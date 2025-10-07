// SOCKETS/cliente/public/chat.js
console.log('Chat iniciado');

const usuario = localStorage.getItem('usuario');
const titulo = document.getElementById('tituloChat');
const mensajesDiv = document.getElementById('mensajes');
const input = document.getElementById('mensajeInput');
const btnEnviar = document.getElementById('btnEnviar');
const etiquetaUsuario = document.getElementById('etiquetaUsuario');

if (!usuario) {
  window.location.href = 'index.html';
} else {
  titulo.textContent = `Chat - ${usuario}`;
  etiquetaUsuario.textContent = `${usuario}:`;
}

// Conectar WebSocket
const ws = new WebSocket(`ws://${window.location.host}`);

ws.onopen = () => {
  console.log('Conectado al servidor WebSocket');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.tipo === 'historial') {
    // Mostrar historial al conectar
    mensajesDiv.innerHTML = '';
    data.mensajes.forEach(m => agregarMensaje(m.usuario, m.texto));
  }

  if (data.tipo === 'nuevo') {
    // Mostrar mensaje nuevo
    agregarMensaje(data.usuario, data.texto);
  }

  mensajesDiv.scrollTop = mensajesDiv.scrollHeight;
};

// Envia el mensaje y lo guarda pero en websocket
btnEnviar.addEventListener('click', () => {
  const texto = input.value.trim();
  if (!texto) return;
  ws.send(JSON.stringify({ usuario, texto }));
  input.value = '';
});

// Enter → enviar
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') btnEnviar.click();
});

// Salir
document.getElementById('btnSalir').addEventListener('click', () => {
  localStorage.removeItem('usuario');
  window.location.href = 'index.html';
});

// --- Mostrar mensajes en pantalla ---
function agregarMensaje(nombre, texto) {
  const div = document.createElement('div');
  div.classList.add('mensaje');
  if (nombre === usuario) div.classList.add('propio');
  div.innerHTML = `<strong>${nombre}:</strong> ${texto}`;
  mensajesDiv.appendChild(div);
}
