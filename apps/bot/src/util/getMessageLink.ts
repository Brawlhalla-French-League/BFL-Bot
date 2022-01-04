import { APIMessage } from 'discord-api-types'
import { Message } from 'discord.js'

export const getMessageLink = (message: APIMessage | Message) =>
  message instanceof Message
    ? `https://discordapp.com/channels/${message.guild?.id}/${message.channel.id}/${message.id}`
    : `https://discordapp.com/channels/${message.guild_id}/${message.channel_id}/${message.id}`
