require('dotenv').config()
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import { Client } from 'discord.js'
// @ts-ignore
import MessageReactionAdd from 'discord.js/src/client/actions/MessageReactionAdd'
import {
  intents as lobbyIntents,
  commands as lobbyCommands,
  handleSetRoomNumber,
  handleLobby,
} from './lobby'
import { intents as momentsIntents, handleMoment } from './moments'

const { DISCORD_CLIENT_ID, GUILD_ID, DISCORD_TOKEN } = process.env

const intents = [...new Set([...lobbyIntents, ...momentsIntents])]
const commands = [...lobbyCommands]

const rest = new REST({ version: '9' }).setToken(DISCORD_TOKEN ?? '')

const initializeSlashCommands = async () => {
  try {
    console.log('Started refreshing application (/) commands.')

    await rest.put(
      Routes.applicationGuildCommands(DISCORD_CLIENT_ID ?? '', GUILD_ID ?? ''),
      { body: commands },
    )

    console.log('Successfully reloaded application (/) commands.')
  } catch (error) {
    console.error(error)
  }
}

initializeSlashCommands()

const client = new Client({ intents })

client.on('ready', () => {
  console.log(`Logged in as ${client.user?.tag}!`)
})

client.on('voiceStateUpdate', (oldState, newState) => {
  handleLobby(oldState, newState)
})

// client.on('messageReactionAdd', (reaction, user) => {
// 	handleMoment(reaction, user);
// });

client.on('interactionCreate', (interaction) => {
  handleSetRoomNumber(interaction)
})

client.on('raw', async (event) => {
  if (event?.t !== 'MESSAGE_REACTION_ADD') return

  // Add the message to the cache.
  const channel = client.channels.cache.get(event.d.channel_id)
  if (!channel) return
  if (channel.type !== 'GUILD_TEXT') return

  await channel?.messages.fetch(event.d.message_id)
  const msgReactionAdd = new MessageReactionAdd(client, true)

  const { reaction, user } = msgReactionAdd.handle(event.d)

  handleMoment(reaction, user)
})

client.login(DISCORD_TOKEN)
