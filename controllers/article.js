'use strict'

var validator = require('validator');
var fs = require('fs');
var path = require('path');

var Article = require('../models/article');

var controller = {

   /* propiedad datosCurso */ datosCurso: (req, res) => {
    var hola = req.body.hola;

    return res.status(200).send({
      curso: 'Master en Frameworks JS',
      autor: 'Damian Vigo',
      url: 'damianvigo.com'
    });

  },

  test: (req, res) => {
    return res.status(200).send({
      message: 'Soy la acción test de mi controlador de articulos'     
    });
  },

  save: (req, res) => {
    // Recoger parametros por post
    var params = req.body;

    // Validar datos (validator)
    try{
      var validate_title = !validator.isEmpty(params.title);
      var validate_content = !validator.isEmpty(params.content);
      
    }catch(err){
      return res.status(200).send({
        status: 'error',
        message: 'Faltan datos por enviar !!'
      });
    }

    if(validate_title && validate_content) {
    // Crear el objeto a guardar 
      var article = new Article();

    // Asignar valores 
      article.title = params.title;
      article.content = params.content;
      

      if(params.image) {
         article.image = params.image;
      } else {
        article.image = null;
      }

    // Guardar el articulo 
      article.save((err, articleStored) => {

        if(err || !articleStored) {
          return res.status(404).send({
            status: 'error',
            message: 'El articulo no se ha guardado!!!'
          });
        }
          // Devolver una respuesta
          return res.status(200).send({
          status: 'success',
          article: articleStored
         });

      });
  
  } else {
    return res.status(200).send({
      message: 'Los datos no son validos',
      status: 'error'
    });
  } 
},

  getArticles: (req, res) => {
    var last = req.params.last;
    var query = Article.find({});


    if(last || last != undefined) {
      query.limit(5);
    }
    
    // Find
    query.sort('-_id').exec((err, articles) => { // metodo find para sacar los datos de la base de datos. Metodo sort para ordenar de forma descendente los datos, es decir, del mas nuevo al mas viejo
      
      if(err) {
        return res.status(500).send({
          message: 'Error al devolver los articulos',
          status: 'error'
        });
      }

      if(!articles) {
        return res.status(404).send({
          message: 'No hay articulos para mostrar',
          status: 'error'
        });
      }
      
      return res.status(200).send({
        articles,
        status: 'success'
      });
    });
  },

  getArticle: (req, res) => {
    
    // Recoger el id de la url
    var articleId = req.params.id;
    // Comprobar que existe
    if(!articleId || articleId == null) {
      return res.status(404).send({
        message: 'No existe el articulo',
        status: 'error'
      });
    }
   // Buscar el articulo
   Article.findById(articleId, (err, article) => {
    
     if(err || !article) {
      return res.status(404).send({
        message: 'No existe el articulo!!',
        status: 'error'
      });
     }

     // Devolverlo en json
      return res.status(200).send({
      status: 'success',
      article
    });

   }); 

  },

  update: (req, res) => {
    // Recoger el id del articulo por la url
    var articleId = req.params.id;
    // Recoger los datos que llegan por put
    var params = req.body;
    // Validar los datos
    try{
      var validate_title = !validator.isEmpty(params.title);
      var validate_content = !validator.isEmpty(params.content);
    }catch(err) {
      return res.status(200).send({
        message: 'Faltan datos por enviar',
        status: 'error'
      });
    }

    if(validate_title && validate_content) {
      // Find and update
      Article.findOneAndUpdate({_id: articleId}, params, {new:true}, (err, articleUpdated) => {
        if(err){
          return res.status(500).send({
            message: 'Error al actualizar!!',
            status: 'error'
          });
        }

        if(!articleUpdated) {
          return res.status(404).send({
            message: 'No existe el articulo!!',
            status: 'error'
          });
        }
         // Devolver la respuesta
        return res.status(200).send({
          article: articleUpdated,
          status: 'success'
        });
      });
    }else {
      return res.status(200).send({
        message: 'La validacion no es correcta!!',
        status: 'error'
      });
    }   
  },

  delete: (req, res) => {
   // Recoger el id de la url
    var articleId = req.params.id;
   // Find and delete
    Article.findOneAndDelete({_id: articleId}, (err, articleRemoved) => {
      if(err){
        return res.status(500).send({
          message: 'Error al borrar',
          status: 'error'
        });
      }

      if(!articleRemoved){
        return res.status(404).send({
          message: 'No se ha borrado el articulo, posiblemente no exista!!',
          status: 'error'
        });
      }

      return res.status(200).send({
        status: 'success',
        article: articleRemoved
      })

    });
  
  },

  upload: (req, res) => {
    // Configurar el modulo connect multipary router/article.js (hecho)

    // Recoger el fichero de la petición
    var file_name = 'Imagen no subida...';

    if(!req.files) {
      return res.status(404).send({
        status: 'error',
        message: file_name
      });
    }

    // Conseguir el nombre y la extensión del archivo
    var file_path = req.files.file0.path;
    var file_split = file_path.split('\\');

    // En linux o Mac
    // var file_split = file_path.split('/');

    // Nombre del archivo
    var file_name = file_split[2];

    // Extension del fichero 
    var extension_split = file_name.split('\.');
    var file_ext = extension_split[1];
    
    // Comprobar la extension, solo imagenes, si es valida borrar el fichero
    if(file_ext != 'png' && file_ext != 'jpg' && file_ext != 'jpeg' && file_ext != 'gif') /* != si es diferente  */{
      // borrar el archivo subido // libereria fs (file system)
      fs.unlink(file_path, (err) => {
        return res.status(200).send({
          status: 'error',
          message: 'La extension de la imagen no es válida!!'
        });
      })

    } else {
      // Si todo es valido, sacando id de la url
      var articleId = req.params.id;

      if(articleId) {
        // Buscar el articlo, asignarle el nombre de la imagen y actualizarlo
      Article.findOneAndUpdate({_id: articleId}, {image: file_name}, {new: true}, (err, articleUpdated) => {
        
        if(err || !articleUpdated) {
          return res.status(200).send({
            status: 'error',
            message: 'Error al guardar la imagen del articulo'
          });
        }
        
        return res.status(200).send({
          status: 'success',
          article: articleUpdated
        });
      });
      } else {
        
        return res.status(200).send({
          status: 'success',
          image: file_name
        });
      }

    
  } 

  },// end upload file

  getImage: (req, res) => {
    var file = req.params.image;
    var path_file = './upload/articles/'+file;

    fs.exists(path_file, (exists) => {

      if(exists) {
        return res.sendFile(path.resolve(path_file));
      } else {
        return res.status(404).send({
          status: 'error',
          message: 'La imagen no existe!!'
        });
      }
    });
  
  },

  search: (req, res) => {
    // Sacar el string a buscar 
    var searchString = req.params.search; 

    // Find or
    Article.find({ "$or": [
      { "title": { "$regex": searchString, "$options": "i"}}, // Si el searchString esta incluido dentro del titulo O esta incluido dentro de contenido, va a sacara el articulo que coincida con eso
      { "content": { "$regex": searchString, "$options": "i"}}
    ]})
    .sort([['date', 'descending']])
    .exec((err, articles) => {
      
      if(err) {
        return res.status(500).send({
          status: 'error',
          message: 'Error en la peticion!'
        });
      }

      if(!articles || articles.length <= 0) {
        return res.status(404).send({
          status: 'error',
          message: 'No hay articulos que coincidan con tu busqueda!'
        });
      }
      
      return res.status(200).send({
        status: 'success',
        articles
      });
    })
  }

}; // end controller

module.exports = controller;