const net = require("net");
const readline = require('readline-sync')
const server = {
    port: 3000,
    host: 'localhost'
}

const client = net.createConnection(server);

client.on("connect", ()=> {
    console.log('Cliente conectado al servidor');
    client.readline = readline.question('Escribe un mensaje: ')
    client.write(client.readline)
})

client.on('data',(data)=> {
    console.log('El servidor dice', data.toString())
})

client.on('error',(err)=> {
    console.log("error: ", err)
})