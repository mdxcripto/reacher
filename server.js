const express = require('express');
const fs = require('fs');
const path = require('path');
const https = require('https');
const cors = require('cors');

const app = express();
const PORT = 443;

// Habilitar CORS
app.use(cors());

// Configurar HTTPS
const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/blackholesol.site/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/blackholesol.site/fullchain.pem'),
};

// Ruta al archivo JSON
const contenidoPath = path.join(__dirname, 'contenido.json');

// Crear archivo si no existe
if (!fs.existsSync(contenidoPath)) {
    fs.writeFileSync(contenidoPath, JSON.stringify({ claveAcceso: 'defaultKey' }, null, 2));
}

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Rutas

// Ruta principal
app.get('/', (req, res) => {
    res.send('Bienvenido a la página principal de BlackHoleSol!');
});

app.get('/contenido', (req, res) => {
    fs.readFile(contenidoPath, 'utf8', (err, data) => {
        if (err) return res.status(500).send({ error: 'Error al leer el archivo.' });
        try {
            const contenido = JSON.parse(data);
            res.json(contenido);
        } catch {
            res.status(500).send({ error: 'Archivo JSON corrupto.' });
        }
    });
});

app.post('/contenido', (req, res) => {
    const { clave, moneda, ultimaActualizacion, fondo, contadorFin } = req.body;

    fs.readFile(contenidoPath, 'utf8', (err, data) => {
        if (err) return res.status(500).send({ error: 'Error al leer el archivo.' });

        try {
            const contenido = JSON.parse(data);

            if (clave !== contenido.claveAcceso) {
                return res.status(403).send({ error: 'Clave de acceso incorrecta.' });
            }

            if (moneda) contenido.moneda = moneda;
            if (ultimaActualizacion) contenido.ultimaActualizacion = ultimaActualizacion;
            if (fondo) contenido.fondo = fondo;
            if (contadorFin) contenido.contadorFin = contadorFin;

            fs.writeFile(contenidoPath, JSON.stringify(contenido, null, 2), (err) => {
                if (err) return res.status(500).send({ error: 'Error al guardar los cambios.' });
                res.send({ mensaje: 'Contenido actualizado con éxito.', contenido });
            });
        } catch {
            res.status(500).send({ error: 'Archivo JSON corrupto.' });
        }
    });
});

// Iniciar servidor HTTPS
https.createServer(options, app).listen(PORT, () => {
    console.log(`Servidor HTTPS corriendo en https://blackholesol.site`);
});
