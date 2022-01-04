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
  GuildMember,
  ButtonInteraction,
} from 'discord.js'
import { log } from '../logger'
import { v4 as uuidv4 } from 'uuid'
import { APIInteractionGuildMember } from 'discord-api-types'
import { createModule } from '../module'
import { CronJob } from 'cron'
import { fetchGuild } from 'db/prisma/client'
import { TicketsModule } from '@prisma/client'

const { GUILDS, GUILD_MESSAGES } = Intents.FLAGS
const intents = [GUILDS, GUILD_MESSAGES]

const tickerMembedPermissions: PermissionString[] = [
  'VIEW_CHANNEL',
  'READ_MESSAGE_HISTORY',
  'SEND_MESSAGES',
  'ATTACH_FILES',
  'EMBED_LINKS',
  'ADD_REACTIONS',
  'USE_EXTERNAL_EMOJIS',
]

const commands = [
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

const fetchTicketsModule = async (guildId: string) => {
  const { ticketsModule } = await fetchGuild(guildId, { ticketsModule: true })

  if (!ticketsModule || !ticketsModule.enabled) return null

  return ticketsModule
}

const isInTicketsCategory = (
  { categoryId }: TicketsModule,
  channel: TextChannel,
) => channel.parent?.id === categoryId

const isTicketClosed = (
  { closedPrefix }: TicketsModule,
  channel: TextChannel,
) => channel.name.startsWith(closedPrefix ?? '')

const isTicketChannel = (
  ticketsModule: TicketsModule,
  channel: TextChannel,
) => {
  if (!isInTicketsCategory(ticketsModule, channel)) return false

  return (
    channel.name.startsWith(ticketsModule.prefix ?? '') ||
    channel.name.startsWith(ticketsModule.closedPrefix ?? '')
  )
}

const userIsAdmin = (
  { roleId }: TicketsModule,
  member: GuildMember | APIInteractionGuildMember,
) => {
  const roles = member.roles

  if (!roleId) return false

  return Array.isArray(roles)
    ? roles.some((role) => role === roleId)
    : roles.cache.has(roleId)
}

const handleTicketCreation = async (
  ticketsModule: TicketsModule,
  interaction: CommandInteraction | ButtonInteraction,
) => {
  const member = interaction.guild?.members.cache.get(interaction.user.id)

  if (!member || !ticketsModule.categoryId || !ticketsModule.roleId) {
    await interaction.reply({
      content: 'Un problème est survenu durant la création du ticket.',
      ephemeral: true,
    })
    return
  }

  let topic = ''

  if (interaction.isCommand())
    topic = interaction.options.getString('topic') ?? ''

  const ticketName = `${ticketsModule.prefix ?? ''}${uuidv4().slice(0, 6)}`

  const channel = await interaction.guild?.channels?.create(ticketName, {
    type: 'GUILD_TEXT',
    parent: ticketsModule.categoryId,
    topic,
    permissionOverwrites: [
      {
        id: ticketsModule.roleId,
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
    .setDescription('Un modérateur va prendre contact avec vous.')
    .addField('Sujet', topic || 'Ticket sans sujet, utilisez `--topic <sujet>`')
    .addField('Créateur', `${member.user}`)
    .setColor('GREEN')

  const closeTicketButton = new MessageButton()
    .setCustomId('ticket-close')
    .setLabel('Fermer le ticket')
    .setEmoji('🔒')
    .setStyle('SECONDARY')

  const actionRow = new MessageActionRow().addComponents(closeTicketButton)

  await channel.send({
    content: `Bienvenue ${member}, voici votre ticket.`,
    embeds: [ticketEmbed],
    components: [actionRow],
  })

  if (topic) await channel.send(`<@&${ticketsModule.roleId}>`)

  log(
    'Tickets',
    `Ticket ${channel?.name} created by ${member.displayName} with topic ${topic}`,
  )
}

const handleTicket = async (interaction: Interaction) => {
  const { guild } = interaction

  if (!guild) return

  const ticketsModule = await fetchTicketsModule(guild.id)

  if (!ticketsModule) return

  if (interaction.isButton()) {
    if (interaction.customId === 'ticket-close') {
      const channel = interaction.channel as TextChannel
      if (!interaction.channel || !isTicketChannel(ticketsModule, channel)) {
        await interaction.reply({
          content: "Ce n'est pas un ticket.",
          ephemeral: true,
        })
        return
      }

      if (isTicketClosed(ticketsModule, channel)) {
        await interaction.reply({
          content: 'Ce ticket est déjà fermé.',
          ephemeral: true,
        })
        return
      }

      const ticketClosedEmbed = new MessageEmbed()
        .setTitle(channel.name)
        .setDescription('Le ticket a été fermé.')
        .addField('Sujet', channel.topic ?? 'Aucun sujet')
        .addField('Fermé par', `${interaction.member?.user ?? 'unknown'}`)
        .setColor('RED')

      const deleteTicketButton = new MessageButton()
        .setCustomId('ticket-delete')
        .setLabel('Supprimer le ticket')
        .setEmoji('❌')
        .setStyle('SECONDARY')

      const actionRow = new MessageActionRow().addComponents(deleteTicketButton)

      await interaction.update({
        components: [actionRow],
      })

      await channel.edit({
        name: `${ticketsModule.closedPrefix ?? ''}${channel.name.slice(
          (ticketsModule.closedPrefix ?? '').length,
        )}`,
        position: 9999,
      })

      await channel.send({
        embeds: [ticketClosedEmbed],
        components: [actionRow],
      })

      log(
        'Tickets',
        `Ticket ${channel.name} closed by ${interaction.user.username}.`,
      )
    }

    if (interaction.customId === 'ticket-delete') {
      const channel = interaction.channel as TextChannel
      if (!interaction.channel || !isTicketChannel(ticketsModule, channel)) {
        await interaction.reply({
          content: "Ce n'est pas un ticket.",
          ephemeral: true,
        })
        return
      }

      if (!interaction.member) return

      if (!userIsAdmin(ticketsModule, interaction.member)) {
        await interaction.reply({
          content: "Vous n'avez pas les permissions pour supprimer ce ticket.",
          ephemeral: true,
        })
        return
      }

      await channel.delete()

      log(
        'Tickets',
        `Ticket ${channel.name} deleted by ${interaction.user.username}.`,
      )
    }

    if (interaction.customId === 'ticket-create') {
      await handleTicketCreation(ticketsModule, interaction)
    }
  }

  if (interaction.isCommand()) {
    if (interaction.commandName === 'ticket') {
      handleTicketCreation(ticketsModule, interaction)
      return
    }
  }
}

export const ticketsModule = createModule(
  'Tickets',
  intents,
  commands,
  (client) => {
    const ticketDeletionCron = new CronJob('0 0 * * * *', async () => {
      log('Tickets', 'Checking stale tickets...')

      const guilds = client.guilds.cache

      guilds.forEach(async (guild) => {
        const channels = guild.client.channels.cache

        const ticketsModule = await fetchTicketsModule(guild.id)

        if (!ticketsModule) return

        channels
          .filter(
            (channel) =>
              channel.type === 'GUILD_TEXT' &&
              isTicketChannel(ticketsModule, channel),
          )
          .forEach(async (channel) => {
            if (channel.type !== 'GUILD_TEXT') return

            channel.messages.fetch({ limit: 1 }).then((messages) => {
              const lastMessage = messages.first()

              if (!lastMessage) return

              if (
                lastMessage.createdTimestamp + ticketsModule.duration >
                Date.now()
              )
                return

              log(
                'Tickets',
                `Ticket ${channel.name} is stale and will be deleted.`,
              )

              channel.delete()
            })
          })
      })
    })
    ticketDeletionCron.start()

    client.on('interactionCreate', handleTicket)

    client.on('messageCreate', async (message) => {
      const { content } = message
      const [command, ...args] = content.split(' ')

      const { guild } = message

      if (!guild) return

      const ticketsModule = await fetchTicketsModule(guild.id)

      if (!ticketsModule) return

      if (message.channel.type !== 'GUILD_TEXT') return
      if (!isTicketChannel(ticketsModule, message.channel)) return

      if (command !== '--topic') return

      const topic = args.join(' ')

      if (!topic) return

      await message.channel.setTopic(topic)
      await message.channel.send(`Le sujet a été changé pour: ${topic}`)
    })

    client.on('messageCreate', async (message) => {
      const { content, member, channel, guild } = message
      if (content !== '--ticket+' || !guild) return

      const ticketsModule = await fetchTicketsModule(guild.id)

      if (!ticketsModule || !ticketsModule.roleId) return

      if (!member?.roles.cache.has(ticketsModule.roleId)) return

      const ticketEmbed = new MessageEmbed()
        .setTitle('Créer un ticket')
        .setDescription(
          'Pour créer un ticket, cliquez sur le bouton ci-dessous, ou tapez la commande `/ticket`.',
        )
        .setColor('DARK_GREEN')

      const createTicketButton = new MessageButton()
        .setCustomId('ticket-create')
        .setLabel('Créer un ticket')
        .setEmoji('📩')
        .setStyle('SECONDARY')

      const actionRow = new MessageActionRow().addComponents(createTicketButton)

      await message.delete()

      await channel.send({
        embeds: [ticketEmbed],
        components: [actionRow],
      })
    })
  },
)
