import { TicketsModule } from '@prisma/client'
import { Select } from './Select'
import { APIChannel, APIRole } from 'discord-api-types'
import { ModuleEditorBase } from './ModuleEditorBase'

interface Props {
  guildId: string
  baseModule: TicketsModule
  guildCategories: APIChannel[]
  guildRoles: APIRole[]
}

export const TicketsModuleEditor = ({
  guildId,
  baseModule,
  guildCategories,
  guildRoles,
}: Props) => {
  // TODO: Better error handling
  if (!guildCategories || !guildRoles) return null

  return (
    <ModuleEditorBase<TicketsModule>
      guildId={guildId}
      baseModule={baseModule}
      moduleTitle="Tickets"
      moduleName="tickets"
    >
      {(module, updateModule) => {
        return (
          <>
            <div className="mt-4">
              <label>
                <span className="uppercase text-gray-200 text-sm">
                  Ticket Channel Prefix
                </span>
                <input
                  className="block max-w-md w-full mb-2 py-2 pl-3 pr-10 text-left bg-gray-900 font-medium rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-blue-300 focus-visible:ring-offset-2 focus-visible:border-indigo-500 sm:text-sm"
                  value={module.prefix}
                  onChange={(e) => updateModule({ prefix: e.target.value })}
                />
              </label>
              <p className="flex items-center mb-2">
                Preview{' '}
                <span className="ml-2 bg-gray-700 px-2 py-1 rounded-md inline-flex items-center text-gray-300 font-medium">
                  #{module.prefix}DA7F1E
                </span>
              </p>
            </div>
            <div className="mt-4">
              <label>
                <span className="uppercase text-gray-200 text-sm">
                  Closed Ticket Channel Prefix
                </span>
                <input
                  className="block max-w-md w-full mb-2 py-2 pl-3 pr-10 text-left bg-gray-900 font-medium rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-blue-300 focus-visible:ring-offset-2 focus-visible:border-indigo-500 sm:text-sm"
                  value={module.closedPrefix}
                  onChange={(e) =>
                    updateModule({ closedPrefix: e.target.value })
                  }
                />
              </label>
              <p className="flex items-center mb-2">
                Preview{' '}
                <span className="ml-2 bg-gray-700 px-2 py-1 rounded-md inline-flex items-center text-gray-300 font-medium">
                  #{module.closedPrefix}DA7F1E
                </span>
              </p>
            </div>
            <div className="mt-4">
              <span className="uppercase text-gray-200 text-sm">
                Tickets Category
              </span>
              <Select
                options={guildCategories.map((category) => ({
                  label: category.name,
                  value: category.id,
                }))}
                selected={module.categoryId}
                onSelect={(value) => updateModule({ categoryId: value })}
                noSelectionMessage="No Category Selected"
              />
            </div>
            <div className="mt-4">
              <span className="uppercase text-gray-200 text-sm">
                Tickets Role
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
