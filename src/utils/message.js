const moment = require('moment');
const generateMessage = (username,text) =>{
    return {
        username,
        text,
        createdAt : moment(new Date().getTime()).format('h:mm a')
    }
}
const generateLocationMessage = (username,text) =>{
    return {
        username,
        text,
        createdAt : moment(new Date().getTime()).format('h:mm a')
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}