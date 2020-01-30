const getEmojiKey = require('../util/getEmojiKey');
const removeDuplicates = require('../util/removeDuplicates');
const { rules } = require('../config');

module.exports = async (messageReaction, user) => {
    /* Bots not welcome! */
    if (user.bot) {
        messageReaction.users.remove(user);
        return;
    }

    /* Get the rules to apply to the message reacted to */
    const rule = rules[messageReaction.message.id];

    /* No rules to apply for this message, we're done. */
    if (!rule) {
        messageReaction.users.remove(user);
        return;
    }

    /* Get the corresponding roles to apply for the reaction clicked */
    const roleIds = rule.emojiRoleMap[getEmojiKey(messageReaction.emoji)];

    /* No roles to apply for the reaction clicked. */
    if (!roleIds) {
        /* Remove their reaction */
        messageReaction.users.remove(user);
        return;
    }

    /* Get the channel the user is reacting in */
    const channel = await user.client.channels.fetch(rule.channelId);

    /* Get the user info from that channel */
    const member = await channel.guild.members.fetch(user);

    /* Member doesn't exist. Maybe they left the server, or something. */
    if (!member) {
        messageReaction.users.remove(user);
        return;
    }

    /* User already has the roles, don't do anything. */
    if (roleIds.every((roleId) => member.roles.get(roleId))) {
        messageReaction.users.remove(user);
        return;
    }

    /* Apply the roles we want to apply. */
    await member.roles.add(roleIds);

    /* If we should respond when the user gets the role */
    if (rule.response) {
        /* Fetch the channel to respond in */
        const msgChannel = await user.client.channels.fetch(rule.response.channel);

        if (msgChannel && msgChannel.type === 'text') {
            msgChannel.send(rule.response.content(user));
        }
    }

    messageReaction.users.remove(user);
};
