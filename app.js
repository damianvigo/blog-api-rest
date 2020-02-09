'use strict'

// Cargar modulos de node para crear servidor
  var express = require('express');
  var bodyParser = require('body-parser');

// Ejecutar express (http)
  var app = express();

// Cargar ficheros rutas 
  var article_routes = require('./routes/article');

// Middlewares // Se ejecuta antes de cargar una ruta o una url de la aplicacion
  app.use(bodyParser.urlencoded({extended:false}));
  app.use(bodyParser.json()); // convertir cualquier peticion a json para poder usarlo

// CORS peticiones desde el frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
  next();
});


// Añadir prefijos a rutas / Cargar rutas
app.use('/api', article_routes)

// Ruta o metodo de prueba para el API REST
/* app.get('/datos-curso', (req, res) => {
  
  return res.status(200).send({
    curso: 'Master en Frameworks JS',
    autor: 'Damian Vigo',
    url: 'damianvigo.com'
  });
}); */

// Exportar modulo (fichero actual)
module.exports = app;