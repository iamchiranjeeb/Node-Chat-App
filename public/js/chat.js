const socket = io()

//Elements
const $messageForm = document.querySelector('#msg-form')
const $messageFormInput = document.querySelector('#input-msg')
const $messageFormButton = $messageForm.querySelector('#btn1')
const $locationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
const $currentLocation = document.querySelector('#current-location')
const $logOutButton = document.querySelector('#logOut')
    //Template
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sideBarTemplate = document.querySelector('#sidebar-template').innerHTML
    //Options
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
})

const autoScroll = () => {
    //New Message Element
    const $newMessage = $messages.lastElementChild

    // Height Of The New Message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    console.log(newMessageHeight)
        //Visible Height
    const visibleHeight = $messages.offsetHeight
        // height of msg container
    const containerHeight = $messages.scrollHeight
        // How far have i scrolled ?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('todaysDate', (res) => {
    thisisRes = moment(res.createdAt).format('dddd, MMMM Do YYYY')
    console.log(thisisRes);
    document.querySelector('#date').innerHTML = thisisRes;
})

socket.on('message', (msg) => {
    console.log(msg)
    const html = Mustache.render(messageTemplate, {
        username: msg.username,
        message: msg.text,
        time: moment(msg.createdAt).format('h : mm a'),
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll();
})

socket.on('locationMessage', (message) => {
    console.log(message)
    const loc = Mustache.render(locationTemplate, {
        username: message.username,
        url: message.url,
        time: moment(message.createdAt).format('h : mm a')
    })
    $currentLocation.insertAdjacentHTML('beforeend', loc)
    autoScroll();
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sideBarTemplate, {
        room: room,
        users: users
    })
    document.querySelector('#sidebar').innerHTML = html
})

//Send Message
$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')

    //const message = document.querySelector('#input-msg').value
    const message = e.target.elements.inputMsg.value

    socket.emit('sendMessage', message, (err) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ""
        $messageFormInput.focus()
        if (err) {
            return console.log(err)
        }
        console.log('Message Delivered !')
    })
})

//Sending Location
$locationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('not supported')
    }
    $locationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        //console.log(position)
        $locationButton.removeAttribute('disabled')
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            console.log('Location Shared.')
        })
    })
})

$logOutButton.addEventListener('click', () => {
    location.href = '/'
})

socket.emit('join', { username, room }, (err) => {
    if (err) {
        alert(err)
        location.href = '/'
    }
})