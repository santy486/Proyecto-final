/* Aqui es donde vamos a crear registros, modificaciones, eliminar */
var User= require('../models/user'); //Treamos el modelo que acabamos de crear
var bcrypt= require('bcrypt-nodejs'); //Incriptar las contraseñas
var jwt= require('../helpers/jwt'); //Requerimos el token
var path= require('path') //requerimos el modulo Path



function registrar(req , res) {
    var params= req.body; //Guarda la informacion de quien se esta registrando
    var user = new User(); //Vamos a utilizar siempre el mismo modelo

    user.nombre= params.nombre;
    user.email=params.email;
    user.imagen= null;
    user.telefono= '';
    user.bio='';
    user.curso='undefined';
    user.estado= false;
    //Si hay una contraseña en el envio de la peticion
    if (params.password) { //la vamos a encriptar
        bcrypt.hash(params.password, null, null, function(err, hash){
            user.password= hash; //Le digo que en el modelo de mongoDB se va almacenar la contraseña de una vez encriptada

            User.findOne({email: params.email}, (err, user_data)=>{
                if (!user_data) { //Si no hay un usuario registrado con ese correo, lo vamos a registrar
                    user.save((err, user)=>{
                            if (user) { //si el usuario se registra
                                //Me a devolver el objeto de usuario
                                res.status(200).send({user:user})
                            } else { //Sino se puede registrar el usuario
                                res.status(404).send({message: err})
                            }
                    })
                } else { //SI esta registrado
                    res.status(404).send({message: "El correo ya esta registrado"})
                }
            })
        });
    } else { //Si no hay una contraseña
        res.status(500).send({message: 'Ingrese su contraseña'})
    }
}

function login(req, res) {
    var data= req.body; // recibe el usuario y la contraseña para despues compararlos

    //Si el correo existe, que lo traiga de la BD
    User.findOne({email: data.email}, (err, user_data)=>{
        if (err) {
            // 500- el servidor de whatsapp se cayo
            //404- NO se encuentra la persona o el mensaje
            //200- cuando se envia el mensaje correctamente
            res.status(500).send({message: "Error en el servidor"});
        } else {
            if (!user_data) { //user_data es el email que se ingreso en el login, si no se encuentra en la BD, no se ha registrado
                res.status(404).send({message: "El correo NO esta registrado"})
            }else{ //Si se encontro el correo en la BD
                bcrypt.compare(data.password, user_data.password, function(err,check){
                    if (check) { //si son iguales las contraseñas
                        if (data.gettoken) {
 
                            res.status(200).send({
                                jwt: jwt.createToken(user_data), //llamamos el token
                                user: user_data, //Me muestre la informacion del usuario
                                message: 'Este usuario tiene un token'
                            });

                        } else {
                            res.status(200).send({

                                jwt: jwt.createToken(user_data),
                                user: user_data, //Me muestre la informacion del usuario
                                message: 'Este usuario NO tiene un token'
                            });
                        }
                    } 

                })

            }
        }

    })
}
//Vamos a buscar un usuario para chatear con él o ella
function get_user(req, res){

        User.findById(id, (err, user)=>{
            if (err) {
                res.status(500).send({message: 'Error en el servidor'})
            } else { //Si encuentra una coincidencia
                if (user) { //si coincide, o existe
                    res.status(200).send({user:user}) //muestre me los datos del usuario
                } else { //No existe esa persona
                    res.status(500).send({message: 'No existe un usuario con ese id'})
                }
            }
        })
}

function get_users(req,res){
    User.find((err, users)=>{
        if (err) {
            res.status(500).send({ message: 'Error en el servidor' });
        } else {
           if(users) { //si hay usuarios que me los muestre
            res.status(200).send({users:users});
           }else{ //sino hay users
            res.status(500).send({message: 'No existe ningun usuario'})
           }
        }
    })
}

function update_foto(req,res){
 //capturamos el id
let id= req.params['id'];
if (req.files.imagen) { //si se esta enviando una imagen
    //la va actualizar
    let imagen_path= req.files.imagen.path; //la ruta donde se esta guardando la imagen
    //separamos la ruta con 2 slash invertidos
    let name= imagen_path.split('\\');// convertimos la ruta en un array para obtener el nombre de la imagen
    let imagen_name= name[2]; //obtengo la posicion 2 donde se ubica el nombre, la ruta es algo asi uploads\\perfiles\\nombreDeLaImagen
 
    User.findByIdAndUpdate(id, {imagen: imagen_name}, function(err,user_update){
        if (err) {
            res.status(500).send({message: 'Error en el servidor'});
        } else {
            if (user_update) {// si actualizo un usuario
                res.status(200).send({user: user_update}) //enviamos el usuario que fue actualizado
            }else{
                res.status(500).send({message: 'No se encontro el usuario'});
            }
        }
 
    })
} else {
    res.status(404).send({message: 'No se cargo ninguna imagen'})
}
}

function get_img(req,res){
    var img= req.params['img'];
 
    if (img != "null") { //Si mi imagen es diferente a Null, osea SI hay una imagen
        var path_img= './uploads/perfiles/'+img; //Treamos la ruta y el nombre de la imagen
        res.status(200).sendFile(path.resolve(path_img)) //usamos el metodo sendFile el cual requiere la libreria path y su metodo resolve con la url de la imagen,Lo que estoy pidiendo es que me mande la imagen con el parametro la ruta de la imagen
    
    } else { //Sino hay una imagen le vamos a enviar una por defecto
       var path_img= './uploads/perfiles/default.png'; //Una imagen por defecto, debemos guardar esta imagen en Uploads/PERFILES OJO!!!
       res.status(200).sendFile(path.resolve(path_img)) 
    }
   
}

function editar_config(req, res) {
    let id = req.params['id'];
    var data = req.body;
    /* VAN A VER 2 TIPOS DE ACTUALIZACIONES, UNA CUANDO SE ACTUALIZA CON IMAGEN Y OTRA SIN IMAGEN */

    if (req.files.imagen) { //Si hay una imagen si hay contraseña
        //vamos a validar si manda una contraseña
        if (data.password) {
            console.log('1') //opcion 1
            //encriptamos la contraseña recibida con el metodo hash
            bcrypt.hash(data.password, null, null, function(err, hash){
                let imagen_path= req.files.imagen.path; //obtenemos la ruta de la imagen
                let name= imagen_path.split('\\'); //convertimos en un arreglo
                let imagen_name= name[2]; //llamamos la posicion 2 el nombre
                if (err) { //si hay un error
                    res.status(500).send({ message: 'Error en el servidor' });
                }else{ //si hay una contraseña encriptada
                    //se van actualizar los siguientes datos
                    User.findByIdAndUpdate(id,{nombre: data.nombre, password: hash, imagen: imagen_name, telefono: data.telefono, bio:data.bio,curso: data.curso, estado: data.estado}, (err, user_data)=>{
                        if (user_data) { // si la actualizacion es correcto me devuelva el usuario que se actualizo
                            //response = representa la respuesta a una petición.
                           res.status(200).send({user: user_data}); 
                        }
                    })
                }
            })
        } else { // Sino hay una contraseña, pero si hay imagen, copiamos orginal y le borramos la contraseña encrypt y en User.find...
            console.log('2')
            let imagen_path= req.files.imagen.path; //obtenemos la ruta de la imagen
            let name= imagen_path.split('\\'); //convertimos en un arreglo
            let imagen_name= name[2]; //llamamos la posicion 2 el nombre
            
            User.findByIdAndUpdate(id,{nombre: data.nombre, imagen: imagen_name, telefono: data.telefono, bio:data.bio,curso: data.curso, estado: data.estado }, (err, user_data)=>{
                if (user_data) { // si la actualizacion es correcto me devuelva el usuario que se actualizo
                    //response = representa la respuesta a una petición.
                   res.status(200).send({user: user_data}); 
                }
            });

        }
    } else { //Si contraseña,no hay imagen, copiamos el original y borramos la seccion de la imagen
        if (data.password) {
            console.log('3')
                //encriptamos la contraseña recibida con el metodo hash
                bcrypt.hash(data.password, null, null, function(err, hash){
                   
                    if (err) { //si hay un error
                        res.status(500).send({ message: 'Error en el servidor' });
                    }else{ //si hay una contraseña encriptada
                        //se van actualizar los siguientes datos
                        User.findByIdAndUpdate(id,{nombre: data.nombre, password: hash, telefono: data.telefono, bio:data.bio,curso: data.curso, estado: data.estado }, (err, user_data)=>{
                            if (user_data) { // si la actualizacion es correcto me devuelva el usuario que se actualizo
                                //response = representa la respuesta a una petición.
                               res.status(200).send({user: user_data}) 
                            }
                        })
                    }
                })
        } else { //cuando no hay una contraseña ni imagen
            //copio le borro la contraseña de arriba
            User.findByIdAndUpdate(id,{nombre: data.nombre, telefono: data.telefono, bio:data.bio,curso: data.curso, estado: data.estado }, (err, user_data)=>{
                if (user_data) { // si la actualizacion es correcto me devuelva el usuario que se actualizo
                    //response = representa la respuesta a una petición.
                   res.status(200).send({user: user_data}) 
                }
            }) 
        }
    }
}


module.exports={
    registrar,
    login,
    get_user,
    get_users,
    update_foto,
    get_img,
    editar_config
}
