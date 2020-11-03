var express= require('express');
var app= express.Router(); //Me permite crear las rutas donde viajara la informacion

var userController= require('../controllers/userController') //Requerimos el archivo que acabamos de crear


var multiparty= require('connect-multiparty')//connect-multiparty: libería que nos permite subir ficheros con node a través de http, y se guarde en el servidor.
var path= multiparty({uploadDir: './uploads/perfiles'}) //Ruta del lugar donde se va a guardar la imagen


app.post('/registrar', userController.registrar) //Creamos la ruta que nos permitira registrar
app.post('/login', userController.login) //Creamos la ruta login
app.get('/usuario/:id', userController.get_user) //Creamos la ruta para traer la informacion de esa persona
app.get('/usuarios', userController.get_users) 
app.put('/usuario/editar/imagen/:id',path, userController.update_foto)//creamos la rutaq de fotos
app.get('/usuario/img/:img', userController.get_img); //:img traemos la ruta de la imagen
app.put('/usuario/editar/:id',path, userController.editar_config); //tambien vamos a enviar un imagen

module.exports= app;