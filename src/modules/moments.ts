import {
  Guild,
  GuildMember,
  Intents,
  Interaction,
  MessageEmbed,
} from 'discord.js'
import dayjs from 'dayjs'
import { APIAttachment, APIInteractionGuildMember } from 'discord-api-types'
import { log } from '../logger'
import { ContextMenuCommandBuilder } from '@discordjs/builders'
import { getMessageLink } from '../util/getMessageLink'
import { createModule } from '../module'
import { fetchGuild } from '../prisma'
import { MomentsModule } from '@prisma/client'

const { GUILDS, GUILD_MESSAGES, GUILD_MESSAGE_REACTIONS } = Intents.FLAGS
const intents = [GUILDS, GUILD_MESSAGES, GUILD_MESSAGE_REACTIONS]

const commands = [
  new ContextMenuCommandBuilder()
    .setName('Funny Moment')
    .setType(3)
    .setDefaultPermission(true),
]

const fetchMomentsModule = async (guildId: string) => {
  const { momentsModule } = await fetchGuild(guildId, { momentsModule: true })

  if (!momentsModule || !momentsModule.enabled) return null

  return momentsModule
}

const getMomentChannel = ({ channelId }: MomentsModule, guild: Guild) => {
  if (!channelId) return null
  return guild.channels.cache.get(channelId)
}

const userHasMomentRole = (
  { roleId }: MomentsModule,
  member: GuildMember | APIInteractionGuildMember,
) => {
  const roles = member.roles

  if (!roleId) return false
  return Array.isArray(roles)
    ? roles.some((role) => role === roleId)
    : roles.cache.has(roleId)
}

const handleMomentInteraction = async (interaction: Interaction) => {
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

  const momentsModule = await fetchMomentsModule(guild.id)

  if (!momentsModule) return

  const momentChannel = getMomentChannel(momentsModule, guild)

  console.log(momentChannel?.id)

  if (!momentChannel) return

  if (!member) return
  if (!userHasMomentRole(momentsModule, member as any)) {
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

export const momentsModule = createModule(
  'Moments',
  intents,
  commands,
  (client) => {
    client.on('interactionCreate', handleMomentInteraction)
  },
)
