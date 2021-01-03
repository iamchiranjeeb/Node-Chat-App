const generateMessage = (username, text) => {
    return {
        username: username,
        text: text,
        createdAt: new Date().getTime(),
    }
}

const generateLocMessage = (username, url) => {
    return {
        username: username,
        url: url,
        createdAt: new Date().getTime()
    }
}

const currDate = () => {
    return {
        todaysDay: new Date().getDate()
    }
}

module.exports = {
    generateMessage,
    generateLocMessage,
    currDate,
}