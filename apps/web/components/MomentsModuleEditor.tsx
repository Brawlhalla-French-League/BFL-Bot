import { MomentsModule } from '@prisma/client'
import { Select } from './Select'
import { APIChannel, APIRole } from 'discord-api-types'
import { ModuleEditorBase } from './ModuleEditorBase'

interface Props {
  guildId: string
  baseModule: MomentsModule
  guildTextChannels: APIChannel[]
  guildRoles: APIRole[]
}

export const MomentsModuleEditor = ({
  guildId,
  baseModule,
  guildTextChannels,
  guildRoles,
}: Props) => {
  // TODO: Better error handling
  if (!guildTextChannels || !guildRoles) return null

  return (
    <ModuleEditorBase<MomentsModule>
      guildId={guildId}
      baseModule={baseModule}
      moduleTitle="Moments"
      moduleName="moments"
    >
      {(module, updateModule) => {
        return (
          <>
            <div className="mt-4">
              <span className="uppercase text-gray-200 text-sm">
                Moment Channel
              </span>
              <Select
                options={guildTextChannels.map((textChannel) => ({
                  label: `#${textChannel.name}`,
                  value: textChannel.id,
                }))}
                selected={module.channelId}
                onSelect={(value) => updateModule({ channelId: value })}
                noSelectionMessage="No Text Channel Selected"
              />
            </div>
            <div className="mt-4">
              <span className="uppercase text-gray-200 text-sm">
                Moment Role
              </span>
              <Select
                options={guildRoles.map((role) => ({
                  label: role.name,
                  value: role.id,
                }))}
                selected={module.roleId}
                onSelect={(value) => updateModule({ roleId: value })}
                noSelectionMessage="No role selected"
              />
            </div>
          </>
        )
      }}
    </ModuleEditorBase>
  )
}
