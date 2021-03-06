require('dotenv').config()
import { REST } from '@discordjs/rest'
import { prisma } from 'db/prisma/client'
import { Routes } from 'discord-api-types/v9'
import { Client } from 'discord.js'
import { log } from './logger'

// Modules
import { lobbyModule } from './modules/lobby'
import { momentsModule } from './modules/moments'
import { ticketsModule } from './modules/tickets'

const { DISCORD_CLIENT_ID, GUILD_ID, DISCORD_TOKEN } = process.env
if (!DISCORD_CLIENT_ID) throw new Error('DISCORD_CLIENT_ID is not defined')
if (!GUILD_ID) throw new Error('GUILD_ID is not defined')
if (!DISCORD_TOKEN) throw new Error('DISCORD_TOKEN is not defined')

const intents = [
  ...new Set([
    ...lobbyModule.intents,
    ...momentsModule.intents,
    ...ticketsModule.intents,
  ]),
]

const commands = [
  ...lobbyModule.commands,
  ...momentsModule.commands,
  ...ticketsModule.commands,
]

const rest = new REST({ version: '9' }).setToken(DISCORD_TOKEN ?? '')

const initializeSlashCommands = async () => {
  try {
    log('Main', 'Refreshing application commands.')

    await rest.put(
      Routes.applicationGuildCommands(DISCORD_CLIENT_ID ?? '', GUILD_ID ?? ''),
      { body: commands },
    )

    log('Main', 'Reloaded application commands.')
  } catch (error) {
    console.error(error)
  }
}

initializeSlashCommands()

const client = new Client({ intents })

client.on('ready', async () => {
  log('Main', `Logged in as ${client.user?.tag}!`)

  const guilds = client.guilds.cache.map((guild) => ({ id: guild.id }))

  await prisma.guildProfile.createMany({
    data: guilds,
    skipDuplicates: true,
  })

  log('Main', 'Guilds added to database.')
})

lobbyModule.setup(client)
momentsModule.setup(client)
ticketsModule.setup(client)

client.login(DISCORD_TOKEN)
