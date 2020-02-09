'use strict'

var express = require('express');
var ArticleController = require('../controllers/article');

var router = express.Router(); // rutas de express

var multipart = require('connect-multiparty');
var md_upload = multipart({ uploadDir: './upload/articles'}); // md_upload / Middlewares

// Rutas de prueba
router.post('/datos-curso', ArticleController.datosCurso);
router.get('/test-de-controlador', ArticleController.test); // ArticleController es un objeto y usa el metodo test

// Rutas útiles
router.post('/save', ArticleController.save);
router.get('/articles/:last?', ArticleController.getArticles); // parametro last con "?" es opcional
router.get('/article/:id', ArticleController.getArticle);
router.put('/article/:id', ArticleController.update);
router.delete('/article/:id', ArticleController.delete);
router.post('/upload-image/:id?', md_upload, ArticleController.upload);
router.get('/get-image/:image', ArticleController.getImage);
router.get('/search/:search', ArticleController.search);

module.exports = router;