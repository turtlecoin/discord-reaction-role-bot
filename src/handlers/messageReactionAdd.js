const getEmojiKey = require('../util/getEmojiKey');
const removeDuplicates = require('../util/removeDuplicates');
const { rules } = require('../config');

module.exports = async (messageReaction, user) => {
    await handleReaction(messageReaction, user);
    messageReaction.message.reactions.removeAll();
}

async function handleReaction(messageReaction, user) {
    /* Bots not welcome! */
    if (user.bot) {
        return;
    }

    /* Get the rules to apply to the message reacted to */
    const rule = rules[messageReaction.message.id];

    /* No rules to apply for this message, we're done. */
    if (!rule) {
        return;
    }

    /* Get the corresponding roles to apply for the reaction clicked */
    const roleIds = rule.emojiRoleMap[getEmojiKey(messageReaction.emoji)];

    /* No roles to apply for the reaction clicked. */
    if (!roleIds) {
        return;
    }

    /* Get the channel the user is reacting in */
    const channel = await user.client.channels.fetch(rule.channelId);

    /* Get the user info from that channel */
    const member = await channel.guild.members.fetch(user);

    /* Member doesn't exist. Maybe they left the server, or something. */
    if (!member) {
        return;
    }

    /* User already has the roles, don't do anything. */
    if (roleIds.every((roleId) => member.roles.get(roleId))) {
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
};
