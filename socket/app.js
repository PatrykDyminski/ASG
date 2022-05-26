let app = require('express')();
let http = require('http').Server(app)
const io = require('socket.io')(http, {cors: {
    methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS']
}});

    io.on('connection', socket => {
        console.log("user connected");
        socket.on('disconnect', () => console.log('disconnected'));
        socket.on('getEvents', (data) => {
            console.log(data);
            socket.emit("getEvents", {text:'null'});
        })
        socket.on('joinFraction', (data) => {
            console.log(data)
            socket.emit('joinFraction', {text: 'done join'})
        })
        socket.on('leaveFraction', (data) => {
            console.log(data)
            socket.emit('leaveFraction', {text: 'done leave'})
        })
        socket.on('postEvent', (data) => {
            console.log(data)
            socket.emit('postEvent', {text: 'done post'})
        })
        socket.on('updateEvent', (data) => {
            console.log(data)
            socket.emit('updateEvent', {text: 'done upadte'})
        })
        socket.on('deleteEvent', (data) => {
            console.log(data)
            socket.emit('deleteEvent', {text: 'done delete'})
        })
    });

    http.listen(3300, () => {
        console.log('started on port 3300');
    })
