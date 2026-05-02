const express = require('express');
const bodyparser = require('body-parser');
const { Server } = require('socket.io');

const http = require('http');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // In production, replace with your frontend URL
        methods: ["GET", "POST"]
    }
});

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

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
