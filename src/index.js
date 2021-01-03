const { count } = require('console');
const express = require('express')
const http = require('http');
const path = require('path')
const socketio = require('socket.io')
const Filters = require('bad-words')
const { generateMessage, generateLocMessage, currDate } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const PORT = process.env.PORT || 3003
const HOST = process.env.HOST || '127.0.0.1'
const app = express();
const server = http.createServer(app)
const io = socketio(server)

// app.get('/', (req, res) => {
//         res.sendFile(path.join(__dirname, '../public/index.html'))
//     })
app.use(express.static(path.join(__dirname, '../public')))
let cou = 0
io.on('connection', (socket) => {
    console.log("New Web Socket Connection.")
    socket.emit('todaysDate', currDate())

    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options })

        if (error) {
            return callback(error)
        }


        socket.join(user.room)

        socket.emit('message', generateMessage('Admin', 'Welcome !'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', user.username + " Joined The Room."))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()

    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        const filter = new Filters()
        if (filter.isProfane(message)) {
            return callback('Profinity Not Allowed !')
        }
        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage(user.username + " Left The Room."))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })

    socket.on('sendLocation', (info, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocMessage(user.username, "https://google.com/maps?q=" + info.latitude + "," + info.longitude))
        callback()
    })
})

server.listen(PORT, HOST, (err) => {
    if (err) {
        console.log(err.message)
    }
    console.log("Server is on " + HOST + ":" + PORT);
})