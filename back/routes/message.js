var express= require('express');
var messageController= require('../controllers/MessageController') //el controlador que acabamos de crear
 
var api = express.Router(); //Para usar el enrutado de express
 
api.post('/message/enviar', messageController.send) //creamos la ruta con la funcion
api.get('/message/:de/:para', messageController.data_msm) //creamos la ruta con la funcion
// /:de/:para quien envie el mensaje y quien recepciona el mensaj
 
module.exports=api; //exportamos las rutas