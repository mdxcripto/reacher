const express = require('express');
const fs = require('fs');
const path = require('path'); // Importa el módulo 'path'
const app = express();
const PORT = 3000;

// Middleware para procesar JSON
app.use(express.json());

// Rutas y lógica aquí...

// Ruta al archivo JSON donde guardamos la información
const contenidoPath = path.join(__dirname, 'contenido.json');

// Middleware para parsear JSON
app.use(express.json());
app.use(express.static('public')); // Sirve archivos estáticos desde la carpeta public

// Ruta GET para obtener el contenido (nombre, descripción, imagen de la moneda, etc.)
app.get('/contenido', (req, res) => {
  fs.readFile(contenidoPath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send({ error: 'Error al leer el archivo de contenido.' });
    }
    res.json(JSON.parse(data));
  });
});

// Ruta POST para actualizar el contenido
app.post('/contenido', (req, res) => {
  const { clave, moneda, ultimaActualizacion, fondo, contadorFin } = req.body;

  // Lee el archivo contenido.json
  fs.readFile(contenidoPath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send({ error: 'Error al leer el archivo de contenido.' });
    }

    const contenido = JSON.parse(data);

    // Verifica la clave de acceso
    if (clave !== contenido.claveAcceso) {
      return res.status(403).send({ error: 'Clave de acceso incorrecta.' });
    }

    // Actualiza los datos solo si están presentes en la solicitud
    if (moneda) contenido.moneda = moneda;
    if (ultimaActualizacion) contenido.ultimaActualizacion = ultimaActualizacion;
    if (fondo) contenido.fondo = fondo;
    if (contadorFin) contenido.contadorFin = contadorFin;

    // Escribe los cambios en el archivo
    fs.writeFile(contenidoPath, JSON.stringify(contenido, null, 2), (err) => {
      if (err) {
        return res.status(500).send({ error: 'Error al guardar los cambios.' });
      }
      res.send({ mensaje: 'Contenido actualizado con éxito.', contenido });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
