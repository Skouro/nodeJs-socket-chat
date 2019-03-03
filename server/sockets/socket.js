const {io} = require('../server');
const {Usuario} = require('../classes/usuarios');
const {crearMensaje} = require('../utils/utilidades');

const usuario = new Usuario();
io.on('connection', (client) => {
    client.on('entrarChat', (data, callback) => {
        // console.log(data);
        if (!data.nombre || !data.sala) {
            return callback({
                error: true,
                message: 'El nombre es necesario'
            })
        }
        client.join(data.sala);
        usuario.agregarPersona(client.id, data.nombre, data.sala);
        client.broadcast.to(data.sala).emit('listaPersonas', usuario.getPersonasPorSala(data.sala));
        callback(usuario.getPersonasPorSala());

    });

    client.on('crearMensaje', (data) => {
        let persona = usuario.getPerosna(client.id);
        let mensaje = crearMensaje(persona.nombre, data.mensaje);
        client.broadcast.to(persona.sala).emit('crearMensaje', mensaje);
    });
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

