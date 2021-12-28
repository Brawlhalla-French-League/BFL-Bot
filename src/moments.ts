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

const { GUILDS, GUILD_MESSAGES, GUILD_MESSAGE_REACTIONS } = Intents.FLAGS

export const intents = [GUILDS, GUILD_MESSAGES, GUILD_MESSAGE_REACTIONS]

const { MOMENT_ROLE_ID, MOMENT_CHANNEL_ID } = process.env

const getMomentChannel = (guild: Guild) => {
  if (typeof MOMENT_CHANNEL_ID === 'undefined') return
  return guild.channels.cache.get(MOMENT_CHANNEL_ID)
}

const userHasMomentRole = (member: GuildMember) => {
  if (typeof MOMENT_ROLE_ID === 'undefined') return
  return member.roles.cache.has(MOMENT_ROLE_ID)
}

export const handleMoment = (
  reaction: MessageReaction | PartialMessageReaction,
  user: User | PartialUser,
) => {
  console.log('reaction')
  if (user.bot) return

  const { message } = reaction

  if (!message.guild) return
  const channel = getMomentChannel(message.guild)
  if (!channel) return

  const member = message.guild.members.cache.get(user.id)

  if (!member) return
  console.log('asdlaskdjsalkdj')
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

  console.log(message.member)

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

  console.log(momentEmbed)

  momentChannel.send({ embeds: [momentEmbed] })
}
