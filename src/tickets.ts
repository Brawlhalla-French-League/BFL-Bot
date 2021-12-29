import { SlashCommandBuilder } from '@discordjs/builders'
import {
  Interaction,
  Intents,
  PermissionString,
  CommandInteraction,
  MessageEmbed,
  MessageActionRow,
  MessageButton,
  TextChannel,
} from 'discord.js'
import { log } from './logger'
import { v4 as uuidv4 } from 'uuid'

const { TICKETS_CATEGORY_ID, TICKETS_ROLE_ID } = process.env
if (!TICKETS_CATEGORY_ID) throw new Error('TICKETS_CATEGORY_ID is not defined')
if (!TICKETS_ROLE_ID) throw new Error('TICKETS_ROLE_ID is not defined')

const TICKETS_CHANNEL_PREFIX = '📄-ticket-'

const { GUILDS, GUILD_MESSAGES } = Intents.FLAGS
export const intents = [GUILDS, GUILD_MESSAGES]

const tickerMembedPermissions: PermissionString[] = [
  'VIEW_CHANNEL',
  'READ_MESSAGE_HISTORY',
  'SEND_MESSAGES',
  'ATTACH_FILES',
  'EMBED_LINKS',
  'ADD_REACTIONS',
  'USE_EXTERNAL_EMOJIS',
]

export const commands = [
  new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Créer un ticket.')
    .addStringOption((option) =>
      option
        .setName('topic')
        .setDescription('Sujet du ticket.')
        .setRequired(true),
    ),
]

const isInTicketsCategory = (channel: TextChannel) =>
  channel.parent?.id === TICKETS_CATEGORY_ID

const isTicketChannel = (channel: TextChannel) =>
  isInTicketsCategory(channel) &&
  channel.name.startsWith(TICKETS_CHANNEL_PREFIX)

const handleTicketCreation = async (interaction: CommandInteraction) => {
  const member = interaction.guild?.members.cache.get(interaction.user.id)

  if (!member) {
    await interaction.reply({
      content: 'Un problème est survenu durant la création du ticket.',
      ephemeral: true,
    })
    return
  }

  const topic = interaction.options.getString('topic')

  if (!topic) {
    await interaction.reply({
      content: 'Vous devez entrer un sujet.',
      ephemeral: true,
    })
    return
  }

  const ticketName = `${TICKETS_CHANNEL_PREFIX}${uuidv4().slice(0, 6)}`

  const channel = await interaction.guild?.channels?.create(ticketName, {
    type: 'GUILD_TEXT',
    parent: TICKETS_CATEGORY_ID,
    topic,
    permissionOverwrites: [
      {
        id: TICKETS_ROLE_ID,
        allow: tickerMembedPermissions,
        type: 'role',
      },
      {
        id: member.id,
        allow: tickerMembedPermissions,
        type: 'member',
      },
    ],
  })

  if (!channel) {
    await interaction.reply({
      content: 'Un problème est survenu durant la création du ticket.',
      ephemeral: true,
    })
    return
  }

  await interaction.reply({
    content: `Votre ticket a été créé: ${channel}`,
    ephemeral: true,
  })

  const ticketEmbed = new MessageEmbed()
    .setTitle(ticketName)
    .addField('Sujet', topic)
    .addField('Créateur', `${member.user}`)

  const closeButton = new MessageButton()
    .setCustomId('ticket-close')
    .setLabel('Fermer le ticket')
    .setEmoji('❌')
    .setStyle('DANGER')

  const actionRow = new MessageActionRow().addComponents(closeButton)

  await channel.send({ embeds: [ticketEmbed], components: [actionRow] })

  log(
    'Tickets',
    `Ticket ${channel?.name} created by ${member.displayName} with topic ${topic}`,
  )
}

export const handleTicket = async (interaction: Interaction) => {
  if (interaction.isButton()) {
    if (interaction.customId === 'ticket-close') {
      const channel = interaction.channel as TextChannel
      if (!interaction.channel || !isTicketChannel(channel)) {
        await interaction.reply({
          content: "Ce n'est pas un ticket.",
          ephemeral: true,
        })
        return
      }

      await channel.delete()
      log(
        'Tickets',
        `Ticket ${channel.name} closed by ${interaction.user.username}.`,
      )
    }
  }

  if (interaction.isCommand()) {
    if (interaction.commandName === 'ticket') {
      handleTicketCreation(interaction)
      return
    }
  }
}
