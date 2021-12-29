import {
  Guild,
  GuildMember,
  Intents,
  MessageEmbed,
  MessageReaction,
  PartialMessageReaction,
  PartialUser,
  User,
} from 'discord.js'
import dayjs from 'dayjs'
import { APIAttachment } from 'discord-api-types'
import { log } from './logger'

const { GUILDS, GUILD_MESSAGES, GUILD_MESSAGE_REACTIONS } = Intents.FLAGS

export const intents = [GUILDS, GUILD_MESSAGES, GUILD_MESSAGE_REACTIONS]

const { MOMENT_ROLE_ID, MOMENT_CHANNEL_ID } = process.env

if (!MOMENT_ROLE_ID) throw new Error('MOMENT_ROLE_ID is not defined')
if (!MOMENT_CHANNEL_ID) throw new Error('MOMENT_CHANNEL_ID is not defined')

const getMomentChannel = (guild: Guild) =>
  guild.channels.cache.get(MOMENT_CHANNEL_ID)

const userHasMomentRole = (member: GuildMember) =>
  member.roles.cache.has(MOMENT_ROLE_ID)

export const handleMoment = async (
  reaction: MessageReaction | PartialMessageReaction,
  user: User | PartialUser,
) => {
  if (user.bot) return

  const { message } = reaction

  if (!message.guild) return
  const channel = getMomentChannel(message.guild)
  if (!channel) return

  const member = message.guild.members.cache.get(user.id)

  if (!member) return
  if (!userHasMomentRole(member)) return

  if (reaction.emoji.name !== '⭐') return

  if (
    reaction.message.reactions.cache.filter(
      (react) => react.emoji.name === '⭐',
    ).size !== 1
  )
    return

  const momentChannel = getMomentChannel(message.guild)

  if (!momentChannel) return

  if (momentChannel.type !== 'GUILD_TEXT') return

  const messageDate = dayjs(reaction.message.createdAt).format(
    'DD/MM/YYYY HH:mm:ss',
  )

  const firstAttachment =
    (message.attachments.entries().next().value?.[1] as APIAttachment) ?? null

  const momentEmbed = new MessageEmbed()
    .setTitle(`Moment de ${message.member?.displayName ?? '???'}`)
    .setImage(firstAttachment?.url)
    .setFooter(
      `le ${messageDate} par ${member.displayName ?? '???'}`,
      message.member?.user.avatarURL() ?? undefined,
    )

  if (reaction.message.content)
    momentEmbed.addField('Message', reaction.message.content)

  if (reaction.message.author)
    momentEmbed.addField('Auteur', reaction.message.author.toString())

  await momentChannel.send({ embeds: [momentEmbed] })

  log('Moments', `Moment Created by ${member.displayName}`)
}
