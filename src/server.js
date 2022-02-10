const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const http = require('http')
const soketio = require('socket.io')
const Filter = require('bad-words')

const {generateMessage,generateLocationMessage} = require('./utils/message')
const {addUser,removeUser,getUser,getUserInRoom} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = soketio(server)
const port = process.env.PORT|3000


const publicDirectoryPath = path.join(__dirname, '../public')
const publicDirectoryPaths = path.join(__dirname, '../public/html')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static(publicDirectoryPath))
app.use('/',express.static(publicDirectoryPaths))


io.on('connection', (socket)=> {
    // console.log(generateMessage('New user connected'))
    console.log('New user connected')

    socket.on('join',(options,callback) => {
        const {error,user} = addUser({id:socket.id,...options})
        if(error){
            return callback(error)
        }
        socket.join(user.room)
        socket.emit('message',generateMessage('admin','welcome!'))
        socket.broadcast.to(user.room).emit('message',generateMessage('admin',`${user.username} has joined!`))
        io.to(user.room).emit('roomData',{
            room : user.room,
            users : getUserInRoom(user.room)
        })
    })

    socket.on('sendMessage',(message,callback)=> {
        const user = getUser(socket.id)
        const filter = new Filter();
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed!')
        }
        io.to(user.room).emit('message',generateMessage(user.username,message))
        callback()
    })

    socket.on('sendLocation',(coords,callback)=> {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect',()=>{
        const userRemove = removeUser(socket.id)
        if(userRemove){
            io.to(userRemove.room).emit('message',generateMessage('admin',`${userRemove.username} has left`))
            io.to(userRemove.room).emit('roomData',{
                room : userRemove.room,
                users : getUserInRoom(userRemove.room)
            })
        }
    })

})

server.listen(port,() => {
    console.log('listening on port ...')
})