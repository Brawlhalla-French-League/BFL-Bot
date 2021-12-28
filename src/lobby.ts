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

const { GUILDS, GUILD_MESSAGES, GUILD_VOICE_STATES } = Intents.FLAGS

export const intents = [GUILDS, GUILD_MESSAGES, GUILD_VOICE_STATES]

const { LOBBY_CATEGORY_ID } = process.env

const generatorChannelPrefix = '➕ '
const lobbyChannelPrefix = '⚔ '

export const commands = [
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

const isInLobbyCategory = (channel: VoiceBasedChannel) =>
  typeof LOBBY_CATEGORY_ID !== 'undefined' &&
  channel.parent?.id === LOBBY_CATEGORY_ID

const isGeneratorChannel = (channel: VoiceBasedChannel) =>
  isInLobbyCategory(channel) && channel.name.startsWith(generatorChannelPrefix)

const isLobbyChannel = (channel: VoiceBasedChannel) =>
  isInLobbyCategory(channel) && channel.name.startsWith(lobbyChannelPrefix)

const handleTempChannelDeletion = async (channel: VoiceBasedChannel) => {
  if (!isLobbyChannel(channel)) return

  if (channel.members.size > 0) return

  await channel.delete()
  console.log(`Deleted channel ${channel.name}`)
}

const handleTempChannelCreation = async (
  channel: VoiceBasedChannel,
  member: GuildMember,
) => {
  if (!isGeneratorChannel(channel)) return

  const createdChannel = await channel.clone({
    name:
      lobbyChannelPrefix +
      channel.name.substring(generatorChannelPrefix.length),
    position: 9999,
  })

  member.voice.setChannel(createdChannel)
  console.log(`Created channel ${createdChannel.name} (${member.user.tag})`)
}

export const handleLobby = (oldState: VoiceState, newState: VoiceState) => {
  if (oldState.channel?.id === newState.channel?.id) return

  if (oldState.channel?.isVoice) handleTempChannelDeletion(oldState.channel)
  if (newState.channel?.isVoice && newState.member)
    handleTempChannelCreation(newState.channel, newState.member)
}

const validateRoomNumber = (roomNumber: string | null): roomNumber is string =>
  Boolean(roomNumber) && roomNumber?.length === 6 && !isNaN(Number(roomNumber))

export const handleSetRoomNumber = async (
  interaction: Interaction<CacheType>,
) => {
  if (!interaction.isCommand()) return

  if (interaction.commandName !== 'room') return

  const member = interaction.guild?.members.cache.get(interaction.user.id)

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

  if (!isLobbyChannel(voiceChannel)) {
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

    const newLobbyChannelName = `${
      oldRoomNumberIndex > 0
        ? voiceChannel.name.slice(0, oldRoomNumberIndex)
        : voiceChannel.name
    } #${roomNumber.toUpperCase()}`

    await voiceChannel.setName(newLobbyChannelName)

    await interaction.reply({
      content: `La room Brawlhalla est maintenant #${roomNumber}`,
      ephemeral: true,
    })
    return
  }

  await interaction.reply({
    content: 'Un problème est survenu.',
    ephemeral: true,
  })
}
