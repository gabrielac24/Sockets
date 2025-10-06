// SOCKETS/cliente/public/chat.js
console.log("chat.js cargado");

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// IMPORTA firebaseConfig desde public (ruta relativa desde chat.html)
import { firebaseConfig } from "./firebaseConfig.js";

try {
  const app = initializeApp(firebaseConfig);
  console.log("Firebase inicializado:", app?.options?.projectId || "(sin projectId visible)");
} catch (err) {
  console.error("Error inicializando Firebase:", err);
}

const db = getFirestore();

const usuario = localStorage.getItem('usuario');
const titulo = document.getElementById('tituloChat');
const mensajesDiv = document.getElementById('mensajes');
const input = document.getElementById('mensajeInput');
const btnEnviar = document.getElementById('btnEnviar');

if (!usuario) {
  console.warn("No hay usuario en localStorage. Redirigiendo a index.html");
  window.location.href = 'index.html';
} else {
  titulo.textContent = `Chat - ${usuario}`;
}

// Enviar mensaje con manejo de errores
btnEnviar?.addEventListener('click', async () => {
  const texto = input.value.trim();
  if (!texto) return;
  try {
    await addDoc(collection(db, "mensajes"), {
      usuario,
      texto,
      fecha: serverTimestamp() // mejor que new Date() para ordenar por servidor
    });
    input.value = "";
  } catch (err) {
    console.error("Error guardando mensaje:", err);
    alert("No se pudo enviar el mensaje. Revisa la consola.");
  }
});

// tecla Enter para enviar
input?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') btnEnviar.click();
});

// Botón salir (comprueba si existe)
const btnSalir = document.getElementById('btnSalir');
if (btnSalir) {
  btnSalir.addEventListener('click', () => {
    localStorage.removeItem('usuario');
    window.location.href = 'index.html';
  });
} else {
  console.warn("btnSalir no encontrado en el DOM");
}

const etiquetaUsuario = document.getElementById('etiquetaUsuario');
etiquetaUsuario.textContent = `${usuario}:`;


// Mostrar mensajes en tiempo real con manejo de errores
try {
  const q = query(collection(db, "mensajes"), orderBy("fecha", "asc"));
  onSnapshot(q,
    (snapshot) => {
      mensajesDiv.innerHTML = "";
      if (snapshot.empty) {
        mensajesDiv.innerHTML = "<div class='mensaje'>— No hay mensajes aún —</div>";
      } else {
        snapshot.forEach(doc => {
          const data = doc.data();
          const whats = document.createElement('div');
          whats.classList.add('mensaje');
          const nombre = data.usuario || 'Anónimo';
          const texto = data.texto || '';
          whats.innerHTML = `<strong>${nombre}:</strong> ${texto}`;
          mensajesDiv.appendChild(whats);
        });
      }
      mensajesDiv.scrollTop = mensajesDiv.scrollHeight;
    },
    (err) => {
      console.error("Error recibiendo mensajes (onSnapshot):", err);
    }
  );
} catch (err) {
  console.error("Error creando listener de mensajes:", err);
}
