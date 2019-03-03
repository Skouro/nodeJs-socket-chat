const {io} = require('../server');
const {Usuario} = require('../classes/usuarios');
const {crearMensaje} = require('../utils/utilidades');

const usuario = new Usuario();
io.on('connection', (client) => {
    //Cuando el cliente entra en el chat
    client.on('entrarChat', (data, callback) => {
        // console.log(data);
        if (!data.nombre || !data.sala) {
            return callback({
                error: true,
                message: 'El nombre es necesario'
            })
        }
        usuario.agregarPersona(client.id, data.nombre, data.sala);
        client.join(data.sala);
        client.broadcast.to(data.sala).emit('listaPersonas', usuario.getPersonasPorSala(data.sala));
        client.broadcast.to(data.sala).emit('crearMensaje', crearMensaje('Administrador', `${data.nombre} se unió`));
        callback(usuario.getPersonasPorSala(data.sala));

    });
        //Cliente envia un mensaje
    client.on('crearMensaje', (data, callback) => {
        let persona = usuario.getPerosna(client.id);
        let mensaje = crearMensaje(persona.nombre, data.mensaje);
        client.broadcast.to(persona.sala).emit('crearMensaje', mensaje);
        callback(mensaje);
    });
    //Cliente se desconecta
    client.on('disconnect', () => {
        // console.log('desnectado');
        let personaBorrda = usuario.borrarPersona(client.id);
        client.broadcast.to(personaBorrda.sala).emit('crearMensaje', crearMensaje('Administrador', `${personaBorrda.nombre} salio`));
        client.broadcast.to(personaBorrda.sala).emit('listaPersonas', usuario.getPersonasPorSala(personaBorrda.sala));

    });

    //Mensajes privados
    client.on('mensajePrivado', data => {
        // console.log('Mensaje para ',data);
        let persona = usuario.getPerosna(client.id);
        client.broadcast.to(data.para).emit('mensajePrivado', crearMensaje(persona.nombre, data.mensaje));
    });
});

