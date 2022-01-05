import { MomentsModule } from '@prisma/client'
import { Select } from './Select'
import { APIChannel, APIRole } from 'discord-api-types'

interface Props {
  momentsModule: MomentsModule
  updateMomentsModule: (newModule: Partial<MomentsModule>) => void
  guildChannels: APIChannel[]
  guildRoles: APIRole[]
}

export const MomentsModuleEditor = ({
  momentsModule,
  updateMomentsModule,
  guildChannels,
  guildRoles,
}: Props) => {
  const textChannels = guildChannels.filter((channel) => channel.type === 0)

  return (
    <>
      <h3 className="text-3xl uppercase font-bold text-gray-200">Moments</h3>
      <label>
        Activate Module
        <input
          type="checkbox"
          checked={momentsModule.enabled}
          onChange={(e) => updateMomentsModule({ enabled: e.target.checked })}
        />
      </label>
      {momentsModule.enabled && (
        <>
          <div className="mt-4">
            <span className="uppercase text-gray-200 text-sm">
              Moment Channel
            </span>
            <Select
              options={textChannels.map((category) => ({
                label: `#${category.name}`,
                value: category.id,
              }))}
              selected={momentsModule.channelId}
              onSelect={(value) => updateMomentsModule({ channelId: value })}
              noSelectionMessage="No Text Channel Selected"
            />
          </div>
          <div className="mt-4">
            <span className="uppercase text-gray-200 text-sm">Moment Role</span>
            <Select
              options={guildRoles.map((role) => ({
                label: role.name,
                value: role.id,
              }))}
              selected={momentsModule.roleId}
              onSelect={(value) => updateMomentsModule({ roleId: value })}
              noSelectionMessage="No role selected"
            />
          </div>
        </>
      )}
    </>
  )
}
