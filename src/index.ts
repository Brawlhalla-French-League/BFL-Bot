require('dotenv').config();

import { Client, GuildMember, Intents, VoiceBasedChannel } from 'discord.js';

const { GUILDS, GUILD_MESSAGES, GUILD_VOICE_STATES } = Intents.FLAGS;

const client = new Client({
	intents: [GUILDS, GUILD_MESSAGES, GUILD_VOICE_STATES],
});

const { DISCORD_TOKEN, CATEGORY_ID } = process.env;

const generatorChannelPrefix = '➕ ';
const lobbyChannelPrefix = '⚔ ';

client.on('ready', () => {
	console.log(`Logged in as ${client.user?.tag}!`);
});

const isGeneratorChannel = (channel: VoiceBasedChannel) =>
	channel.name.startsWith(generatorChannelPrefix);

const isLobbyChannel = (channel: VoiceBasedChannel) =>
	channel.name.startsWith(lobbyChannelPrefix);

const isInLobbyCategory = (channel: VoiceBasedChannel) =>
	typeof CATEGORY_ID !== 'undefined' && channel.parent?.id === CATEGORY_ID;

const handleLeaveChannel = async (channel: VoiceBasedChannel) => {
	if (!isInLobbyCategory(channel)) return;

	if (!isLobbyChannel(channel)) return;

	if (channel.members.size > 0) return;

	await channel.delete();
	console.log(`Deleted channel ${channel.name}`);
};

const handleJoinChannel = async (
	channel: VoiceBasedChannel,
	member: GuildMember
) => {
	if (!isInLobbyCategory(channel)) return;

	if (!isGeneratorChannel(channel)) return;

	const createdChannel = await channel.clone({
		name:
			lobbyChannelPrefix +
			channel.name.substring(generatorChannelPrefix.length),
		position: channel.parent?.children.size ?? 9999,
	});

	member.voice.setChannel(createdChannel);
	console.log(`Created channel ${createdChannel.name} (${member.user.tag})`);
};

client.on('voiceStateUpdate', (oldState, newState) => {
	if (oldState.channel?.id === newState.channel?.id) return;

	if (oldState.channel?.isVoice) handleLeaveChannel(oldState.channel);
	if (newState.channel?.isVoice && newState.member)
		handleJoinChannel(newState.channel, newState.member);
});

client.login(DISCORD_TOKEN);
