const express = require('express');
const http = require('http');  
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);  
const io = socketIo(server,
    {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"]
        }
    
    });

app.use(cors({
    origin: 'http://localhost:3000'
}));
const PORT = process.env.PORT || 5000;

io.on('connection', socket => {
    console.log('User connected', socket.id);

    socket.on('disconnect', () => {
        console.log('User disconnected', socket.id);
    });

    socket.on('call:initiate', data => {
        const {targetUserId} = data;
        const targetSocket = io.sockets.connected[targetUserId];

        if (targetSocket) {
            targetSocket.emit('call:recieve', {
                callerUserId: socket.id
            });
        }
    })

    socket.on('call:answer', data => {
        const {callerId} = data;
        const callerSocket = io.sockets.connected[callerId];

        if(callerSocket) {
            callerSocket.emit('call:establish', {
                answererId: socket.id
            });
        }
    })

    socket.on('call:ice-candidate', data => {
        const {targetUserId, iceCandidate} = data;
        const targetSocket = io.sockets.connected[targetUserId];

        if(targetSocket) {
            targetSocket.emit('call:ice-candidate', {
                senderId: socket.id,
                iceCandidate
            });
        }
    })

    socket.on('call:send-stream', data => {
        const {targetUserId, stream} = data;
        const targetSocket = io.sockets.connected[targetUserId];

        if(targetSocket){
            targetSocket.emit('call:recieve-stream', {
                senderId: socket.id,
                stream
            });
        }
    })

})
server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});