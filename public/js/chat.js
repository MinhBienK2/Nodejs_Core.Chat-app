// const Mustache = require('mustache');
// const {qs} = require('qs');
const socket = io()

// element 
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-geolocation')
const $messages = document.querySelector('#messages')

//template
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
// console.log(Qs.parse(location.search, {ignoreQueryPrefix: true}))
const {username,room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoCroll = ()=> {
    //new message element 
    const $newMessage = $messages.lastElementChild

    //get height of new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    //height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset +1){
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message',(message) => {
    // console.log(message)
    const html = Mustache.render(messageTemplate,{
        username : message.username,
        message : message.text,
        createdAt : message.createdAt
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoCroll()
})

socket.on('locationMessage',(url)=> {
    // console.log(url)
    const html = Mustache.render(locationTemplate,{
        username : url.username,
        url : url.text,
        createdAt : url.createdAt
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoCroll()
})


$messageForm.addEventListener('submit',(e) => {
    e.preventDefault()
    const message = e.target.elements.message.value
    $messageFormButton.setAttribute('disabled','disabled')
    socket.emit('sendMessage',message,(error)=> {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()  
        if(error){
            return console.log(error)
        }
        console.log('message delivered') 
    })
    
})

$sendLocationButton.addEventListener('click',(e)=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }
    e.preventDefault()
    $sendLocationButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition(position => {
        // console.log(position)
        socket.emit('sendLocation',{
            latitude : position.coords.latitude,
            longitude : position.coords.longitude
        },()=> {
            $sendLocationButton.removeAttribute('disabled')
            console.log('location shared')
        })
    })
})


socket.emit('join',{username,room}, (error) => {
    if(error){
        alert(error)
        location.href = "http://localhost:3000/html/index.html"
    }
})

socket.on('roomData',({room,users}) => {
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

// socket.on('countUpdated',(count) => {
//     console.log('the count has been updated! ',count)
// })

// document.querySelector('#increment').addEventListener('click',() => {
//     console.log('clicked')
//     socket.emit('increment')
// })