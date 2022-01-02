var axios = require('axios');
const User = require('../models/User');

const migrateExistingUsersToChatEngine = async () => {
    for await (const user of User.find()) {
            //createChatUser(user);
            console.log(user);
      }
};


/**
 * Controller to create a chat User
 */
const createChatUser = (user) => {console.log('user: ', user);
    const data = {
        'username': user?.profileName,
        'secret': `${process.env.CHAT_PRIVATE_KEY}:${user?.profileName}`
    };

    const config = {
        method: 'post',
        url: 'https://api.chatengine.io/users/',
        headers: {
            'PRIVATE-KEY': `${process.env.CHAT_PRIVATE_KEY}`
        },
        data : data
    };

    axios(config)
    .then(function (response) {
        console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
        console.log(error);
    });

};

module.exports.migrateExistingUsersToChatEngine = migrateExistingUsersToChatEngine;