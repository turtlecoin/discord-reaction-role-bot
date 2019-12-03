module.exports = {
    token: ('TOKEN' in process.env ? process.env : require('../config')).TOKEN,
    rules: {
        '628591450153811968': {
            channelId: '628588108157288459',
            emojiRoleMap: {
                '🐢': ['628588267763138571']
            },
            response: {
                channel: '471023390954618883',
                content: (user) => `Welcome ${user} to TRTL Network!`,
            },
        },
    }
};
