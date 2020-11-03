var Message = require('../models/message') //traemos el modelo
 
function send(req, res) {
    var data= req.body; // todo lo que se envia en el formulario
 
    var message= new Message(); //Una nueva instancia del modelo que tiene el mensaje
    message.de= data.de; //Le asignamos lo que llega del formulario en el modelo
    message.para = data.para;
    message.msm= data.msm;
     
    //GUARDAR EL MENSAJE
     
    message.save((err, message_save)=>{ //Guarda el mensaje que se enviara
     
        if (err) { //si hay un error
            res.status(500).send({message: 'Error en el servidor'})
        } else { 
            if (message_save) { //Si hay un mensaje guardado 
                res.status(200).send({message: message_save}); //Me lo muestre
            }
        }
    });
    
}

function data_msm(req,res){
    var data = req.body
    var de = req.params['de']; //obtengo el id de quien envio el mensaje
    var para = req.params['para']; //obtengo el id de quien recibe el mensaje

    const filtro = { // Me filtrara los mensajes como messeger y de whatsapp
        '$or': [
            {
                '$and': [
                    {
                        'para': de
                    }, {
                        'de': para
                    }
                ]
            }, {
                '$and': [
                    {
                        'para': para
                    }, {
                        'de': de
                    }
                ]
            },
        ]
    }
 //Me va a filtrar y ordenar por fecha de creacion. una funcion que recibe un error o los mensajes 
 //El método exec() ejecuta una busqueda sobre las coincidencias de una expresión regular en una cadena especifica. Devuelve el resultado como array, o null.
    Message.find(filtro).sort({createAt: 1}).exec(function(err,messages){
        if (messages) { // Si hay mensajes que me los mande todos
            res.status(200).send({message:messages}); //me envie como respuesta los mensajes de los usuarios
        } else { //sino hay mensajes
           res.status(404).send({message:'No hay ningun mensaje entre estos usuarios'}) 
        }
    })

}


module.exports = { //Exportamos la funcion
    send,
    data_msm
}
