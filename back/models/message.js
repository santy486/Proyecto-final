var mongoose= require('mongoose'); //Requerimos el paquete de mongoose
var Schema= mongoose.Schema;
 
/* Mongoose usa un objeto Schema para definir una lista de propiedades del documento, cada una con su propio tipo y caracteristicas para forzar la estructura del documento. Despues de especificar un esquema deberas definir un Modelo constructor que usaras para crear instancias de los documentos de MongoDB. */
var messageSchema= Schema({ /* Va inicializar el nuevo esqueme de mi user */
    //ATRIBUTOS DE LA TABLA
    de: {type: Schema.ObjectId, ref:'user'},//id del usuario quien esta enviando el mensaje
    para: {type: Schema.ObjectId, ref:'user'},  //id del usuario quien recibe el mensaje
    //estado de conexion
    msm: String, //Mensaje
    createAt:{ type:Date, default:Date.now} // se guarde la hora y la fecha en que se mando el mensaje
 
});
 
module.exports= mongoose.model('message', messageSchema);
/* Exportamos este modulo y le añadimos como parametro la palabra user. Esto me permitira usar mi esquema/modelo en otras partes de la API*/
