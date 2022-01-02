import {
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandGroupBuilder,
  ContextMenuCommandBuilder,
} from '@discordjs/builders'
import { Client } from 'discord.js'
import { log } from './logger'

type Commands = (
  | SlashCommandBuilder
  | SlashCommandSubcommandBuilder
  | SlashCommandSubcommandsOnlyBuilder
  | SlashCommandOptionsOnlyBuilder
  | SlashCommandSubcommandGroupBuilder
  | ContextMenuCommandBuilder
  | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>
)[]

export interface BotModule {
  name: string
  intents: number[]
  commands: Commands
  setup: (client: Client) => void
}

export const createModule = (
  name: string,
  intents: number[],
  commands: Commands,
  setup: (client: Client) => void,
): BotModule => ({ name, intents, commands, setup })
