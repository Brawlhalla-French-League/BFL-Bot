import {
  GuildProfile,
  LobbysModule,
  TicketsModule,
  MomentsModule,
  TagsModule,
  GuildTag,
} from '@prisma/client'

export interface TagsModuleWithTags extends TagsModule {
  tags: GuildTag[]
}
export interface Guild extends GuildProfile {
  lobbysModule?: LobbysModule
  ticketsModule?: TicketsModule
  momentsModule?: MomentsModule
  tagsModule?: TagsModuleWithTags
}

export const moduleTypes = ['lobbys', 'tickets', 'moments', 'tags'] as const

export type ModuleType =
  | LobbysModule
  | TicketsModule
  | MomentsModule
  | TagsModuleWithTags
