const express = require('express');
const bodyparser = require('body-parser');
const { Server } = require('socket.io');

const io = new Server({
    cors: true
});
const app = express();

app.use(bodyparser.json());

const emailToSocketMap = new Map();
const socketToEmailMap = new Map();


io.on('connection', (socket) => {
    console.log('New Connection');
    socket.on('joinroom', data => {
        const { roomId, email } = data;
        console.log("user", email, 'join room', roomId);
        emailToSocketMap.set(email, socket.id);
        socketToEmailMap.set(socket.id, email);
        socket.join(roomId);
        socket.emit('joinedroom', { roomId });
        socket.broadcast.to(roomId).emit('userjoined', { email });

    })

    socket.on('calluser', (data) => {
        const { email, offer } = data;
        const fromEmail = socketToEmailMap.get(socket.id);
        const socketId = emailToSocketMap.get(email);
        socket.to(socketId).emit('incomingcall', {
            from: fromEmail,
            offer
        })
    })

    socket.on('callaccepted', (data) => {
        const { email, ans } = data;
        const socketId = emailToSocketMap.get(email);
        socket.to(socketId).emit('callaccepted', { ans });
    })
})

app.listen(8000, () => {
    console.log('Http is run on PORT 8000');
})

io.listen(8001);
