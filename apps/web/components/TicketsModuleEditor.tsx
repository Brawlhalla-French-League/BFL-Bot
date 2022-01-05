import { TicketsModule } from '@prisma/client'
import { Select } from './Select'
import { APIChannel, APIRole } from 'discord-api-types'

interface Props {
  ticketsModule: TicketsModule
  updateTicketsModule: (newModule: Partial<TicketsModule>) => void
  guildCategories: APIChannel[]
  guildRoles: APIRole[]
}

export const TicketsModuleEditor = ({
  ticketsModule,
  updateTicketsModule,
  guildCategories,
  guildRoles,
}: Props) => {
  return (
    <>
      <h3 className="text-3xl uppercase font-bold text-gray-200">Tickets</h3>
      <label>
        Activate Module
        <input
          type="checkbox"
          checked={ticketsModule.enabled}
          onChange={(e) => updateTicketsModule({ enabled: e.target.checked })}
        />
      </label>
      {ticketsModule.enabled && (
        <>
          <div className="mt-4">
            <label>
              <span className="uppercase text-gray-200 text-sm">
                Ticket Channel Prefix
              </span>
              <input
                className="block max-w-md w-full mb-2 py-2 pl-3 pr-10 text-left bg-gray-900 font-medium rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-blue-300 focus-visible:ring-offset-2 focus-visible:border-indigo-500 sm:text-sm"
                value={ticketsModule.prefix}
                onChange={(e) =>
                  updateTicketsModule({ prefix: e.target.value })
                }
              />
            </label>
            <p className="flex items-center mb-2">
              Example{' '}
              <span className="ml-2 bg-gray-700 px-2 py-1 rounded-md inline-flex items-center text-gray-300 font-medium">
                #{ticketsModule.prefix}DA7F1E
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
                value={ticketsModule.closedPrefix}
                onChange={(e) =>
                  updateTicketsModule({ closedPrefix: e.target.value })
                }
              />
            </label>
            <p className="flex items-center mb-2">
              Example{' '}
              <span className="ml-2 bg-gray-700 px-2 py-1 rounded-md inline-flex items-center text-gray-300 font-medium">
                #{ticketsModule.closedPrefix}DA7F1E
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
              selected={ticketsModule.categoryId}
              onSelect={(value) => updateTicketsModule({ categoryId: value })}
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
              selected={ticketsModule.roleId}
              onSelect={(value) => updateTicketsModule({ roleId: value })}
              noSelectionMessage="No role selected"
            />
          </div>
        </>
      )}
    </>
  )
}
