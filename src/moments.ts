import {
  Guild,
  GuildMember,
  Intents,
  Interaction,
  MessageEmbed,
} from 'discord.js'
import dayjs from 'dayjs'
import { APIAttachment, APIInteractionGuildMember } from 'discord-api-types'
import { log } from './logger'
import { ContextMenuCommandBuilder } from '@discordjs/builders'
import { getMessageLink } from './util/getMessageLink'

const { MOMENT_ROLE_ID, MOMENT_CHANNEL_ID } = process.env
if (!MOMENT_ROLE_ID) throw new Error('MOMENT_ROLE_ID is not defined')
if (!MOMENT_CHANNEL_ID) throw new Error('MOMENT_CHANNEL_ID is not defined')

const { GUILDS, GUILD_MESSAGES, GUILD_MESSAGE_REACTIONS } = Intents.FLAGS
export const intents = [GUILDS, GUILD_MESSAGES, GUILD_MESSAGE_REACTIONS]

export const commands = [
  new ContextMenuCommandBuilder()
    .setName('Funny Moment')
    .setType(3)
    .setDefaultPermission(true),
]

const getMomentChannel = (guild: Guild) =>
  guild.channels.cache.get(MOMENT_CHANNEL_ID)

const userHasMomentRole = (member: GuildMember | APIInteractionGuildMember) => {
  const roles = member.roles
  return Array.isArray(roles)
    ? roles.some((role) => role === MOMENT_ROLE_ID)
    : roles.cache.has(MOMENT_ROLE_ID)
}

export const handleMomentInteraction = async (interaction: Interaction) => {
  if (!interaction.isMessageContextMenu()) return
  const {
    commandName,
    targetMessage: message,
    user,
    member,
    guild,
  } = interaction

  if (commandName !== 'Funny Moment') return

  if (!message || !user) return

  if (user.bot) return

  if (!guild) return
  const channel = getMomentChannel(guild)
  if (!channel) return

  if (!member) return
  if (!userHasMomentRole(member as any)) {
    log(
      'Moments',
      `${user.tag} tried to use the funny moment command, but they don't have the role.`,
    )
    await interaction.reply({
      content: 'cringelord',
      ephemeral: true,
    })
    return
  }

  const momentChannel = getMomentChannel(guild)

  if (!momentChannel) return

  if (momentChannel.type !== 'GUILD_TEXT') return

  const messageDate = dayjs().format('DD/MM/YYYY HH:mm:ss')

  const firstAttachment =
    (message.attachments.entries().next().value?.[1] as APIAttachment) ?? null

  const momentEmbed = new MessageEmbed()
    .setTitle(
      `Moment de ${message.author.username}#${message.author.discriminator}`,
    )
    .setImage(firstAttachment?.url)
    .setFooter(
      `le ${messageDate} par ${user.username ?? '???'}`,
      user.avatarURL() ?? undefined,
    )
    .setURL(getMessageLink(message))
    .setColor('RANDOM')

  if (message.author.avatar)
    momentEmbed.setThumbnail(
      `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png`,
    )

  console.log(
    `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png`,
    message.author.avatar,
  )

  if (message.content) momentEmbed.addField('Message', message.content)

  if (message.author) momentEmbed.addField('Meta', `${message.author}`)

  await momentChannel.send({ embeds: [momentEmbed] })

  log('Moments', `Moment Created by ${user.tag}`)

  await interaction.reply({
    content: 'Funny moment ajouté !',
    ephemeral: true,
  })
}
