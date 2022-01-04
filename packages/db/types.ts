import {
  GuildProfile,
  LobbysModule,
  TicketsModule,
  MomentsModule,
} from '@prisma/client'

export interface Guild extends GuildProfile {
  lobbysModule?: LobbysModule
  ticketsModule?: TicketsModule
  momentsModule?: MomentsModule
}
