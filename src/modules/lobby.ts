import {
  CacheType,
  GuildMember,
  Intents,
  Interaction,
  VoiceBasedChannel,
  VoiceState,
} from 'discord.js'
import {
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
} from '@discordjs/builders'
import { log } from '../logger'
import { createModule } from '../module'
import { fetchGuild } from '../prisma'
import { LobbysModule } from '@prisma/client'

const { GUILDS, GUILD_MESSAGES, GUILD_VOICE_STATES } = Intents.FLAGS
const intents = [GUILDS, GUILD_MESSAGES, GUILD_VOICE_STATES]

const commands = [
  new SlashCommandBuilder()
    .setName('room')
    .setDescription(
      'Afficher le numéro de la room / Changer le numéro de la room.',
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName('get')
        .setDescription('Afficher le numéro de la room.'),
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName('set')
        .setDescription('Ajouter la room Brawlhalla au salon vocal.')
        .addStringOption((option) =>
          option
            .setName('room')
            .setDescription('Numéro de la room.')
            .setRequired(true),
        ),
    ),
]

const isInLobbyGeneratorCategory = (
  { generatorCategoryId }: LobbysModule,
  channel: VoiceBasedChannel,
): boolean => {
  if (!generatorCategoryId) return false
  return channel.parent?.id === generatorCategoryId
}

const isInLobbyCategory = (
  { categoryId }: LobbysModule,
  channel: VoiceBasedChannel,
): boolean => {
  if (!categoryId) return false
  return channel.parent?.id === categoryId
}

const isGeneratorChannel = (
  lobbysModule: LobbysModule,
  channel: VoiceBasedChannel,
): boolean =>
  isInLobbyGeneratorCategory(lobbysModule, channel) &&
  channel.name.startsWith(lobbysModule.generatorPrefix ?? '')

const isLobbyChannel = (
  lobbysModule: LobbysModule,
  channel: VoiceBasedChannel,
): boolean =>
  isInLobbyCategory(lobbysModule, channel) &&
  channel.name.startsWith(lobbysModule.prefix ?? '')

const handleTempChannelDeletion = async (
  lobbysModule: LobbysModule,
  channel: VoiceBasedChannel,
) => {
  if (!isLobbyChannel(lobbysModule, channel)) return

  if (channel.members.size > 0) return

  await channel.delete()
  log('Lobby', `Deleted channel ${channel.name}`)
}

const handleTempChannelCreation = async (
  lobbysModule: LobbysModule,
  channel: VoiceBasedChannel,
  member: GuildMember,
) => {
  if (!isGeneratorChannel(lobbysModule, channel)) return

  if (!lobbysModule.categoryId) {
    log('Lobby', `CategoryId is not defined`)
    member.voice.disconnect('CategoryId is not defined')
    return
  }

  const createdChannel = await channel.clone({
    name:
      (lobbysModule.prefix ?? '') +
      channel.name.substring((lobbysModule.generatorPrefix ?? '').length),
    parent: lobbysModule.categoryId,
    position: 9999,
  })

  member.voice.setChannel(createdChannel)
  log('Lobby', `Created channel ${createdChannel.name} (${member.user.tag})`)
}

const handleLobby = async (oldState: VoiceState, newState: VoiceState) => {
  if (oldState.channel?.id === newState.channel?.id) return

  const guildId = newState.guild.id ?? oldState.guild.id

  if (!guildId) return

  const dbGuild = await fetchGuild(guildId, {
    lobbysModule: true,
  })

  if (!dbGuild.lobbysModule || !dbGuild.lobbysModule.enabled) return

  if (oldState.channel?.isVoice)
    handleTempChannelDeletion(dbGuild.lobbysModule, oldState.channel)

  if (newState.channel?.isVoice && newState.member)
    handleTempChannelCreation(
      dbGuild.lobbysModule,
      newState.channel,
      newState.member,
    )
}

const validateRoomNumber = (roomNumber: string | null): roomNumber is string =>
  Boolean(roomNumber) && roomNumber?.length === 6 && !isNaN(Number(roomNumber))

const handleSetRoomNumber = async (interaction: Interaction<CacheType>) => {
  if (!interaction.isCommand()) return

  if (interaction.commandName !== 'room') return

  const { guild } = interaction

  if (!guild) return

  const dbGuild = await fetchGuild(guild.id, {
    lobbysModule: true,
  })

  if (!dbGuild.lobbysModule || !dbGuild.lobbysModule.enabled) return

  const member = guild.members.cache.get(interaction.user.id)

  if (!member) {
    await interaction.reply({
      content: 'Un problème est survenu.',
      ephemeral: true,
    })
    return
  }

  const voiceChannel = member.voice.channel

  if (!voiceChannel) {
    await interaction.reply({
      content: "Vous n'êtes pas dans un salon vocal.",
      ephemeral: true,
    })
    return
  }

  if (!isLobbyChannel(dbGuild.lobbysModule, voiceChannel)) {
    await interaction.reply({
      content: "Vous n'êtes pas dans un Lobby.",
      ephemeral: true,
    })
    return
  }

  const oldRoomNumberIndex = voiceChannel.name.lastIndexOf(' #')

  if (interaction.options.getSubcommand() === 'get') {
    if (oldRoomNumberIndex < 0) {
      await interaction.reply({
        content: "La room de ce Lobby n'a pas été renseignée.",
        ephemeral: true,
      })
      return
    }

    await interaction.reply({
      content: `La room est #${voiceChannel.name.substring(
        oldRoomNumberIndex + 2,
      )}`,
      ephemeral: true,
    })
    return
  }

  if (interaction.options.getSubcommand() === 'set') {
    const roomNumber = interaction.options.getString('room')

    if (!validateRoomNumber(roomNumber)) {
      await interaction.reply({
        content: 'La room entrée est invalide.',
        ephemeral: true,
      })
      return
    }

    const strippedChannelName =
      oldRoomNumberIndex > 0
        ? voiceChannel.name.slice(0, oldRoomNumberIndex)
        : voiceChannel.name

    const newLobbyChannelName = `${strippedChannelName} #${roomNumber}`

    await voiceChannel.setName(newLobbyChannelName)

    await interaction.reply({
      content: `La room Brawlhalla est maintenant #${roomNumber}`,
      ephemeral: true,
    })
    log(
      'Lobby',
      `Set room for channel ${strippedChannelName} to #${roomNumber}`,
    )
    return
  }

  await interaction.reply({
    content: 'Un problème est survenu.',
    ephemeral: true,
  })
}

export const lobbyModule = createModule(
  'Lobby',
  intents,
  commands,
  (client) => {
    client.on('voiceStateUpdate', handleLobby)
    client.on('interactionCreate', handleSetRoomNumber)
  },
)
