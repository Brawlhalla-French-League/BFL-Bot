import { LobbysModule } from '@prisma/client'
import { Select } from './Select'
import { VolumeUpIcon } from '@heroicons/react/solid'
import { APIChannel } from 'discord-api-types'

interface Props {
  lobbysModule: LobbysModule
  updateLobbysModule: (newModule: Partial<LobbysModule>) => void
  guildCategories: APIChannel[]
}

export const LobbysModuleEditor = ({
  lobbysModule,
  updateLobbysModule,
  guildCategories,
}: Props) => {
  return (
    <>
      <h3 className="text-3xl uppercase font-bold text-gray-200">Lobbys</h3>
      <label>
        Activate Module
        <input
          type="checkbox"
          checked={lobbysModule.enabled}
          onChange={(e) => updateLobbysModule({ enabled: e.target.checked })}
        />
      </label>
      {lobbysModule.enabled && (
        <>
          <div className="mt-4">
            <span className="uppercase text-gray-200 text-sm">
              Generator Channels Category
            </span>
            <Select
              options={guildCategories.map((category) => ({
                label: category.name,
                value: category.id,
              }))}
              selected={lobbysModule.generatorCategoryId}
              onSelect={(value) =>
                updateLobbysModule({ generatorCategoryId: value })
              }
              noSelectionMessage="No Category Selected"
            />
          </div>
          <div className="mt-4">
            <label>
              <span className="uppercase text-gray-200 text-sm">
                Generator Channel Prefix
              </span>
              <input
                className="block max-w-md w-full mb-2 py-2 pl-3 pr-10 text-left bg-gray-900 font-medium rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-blue-300 focus-visible:ring-offset-2 focus-visible:border-indigo-500 sm:text-sm"
                value={lobbysModule.generatorPrefix}
                onChange={(e) =>
                  updateLobbysModule({ generatorPrefix: e.target.value })
                }
              />
            </label>
            <p className="flex items-center mb-2">
              Example{' '}
              <span className="ml-2 bg-gray-700 px-2 py-1 rounded-md inline-flex items-center text-gray-300 font-medium">
                <VolumeUpIcon
                  className="w-5 h-5 inline-block mr-1"
                  aria-hidden="true"
                />
                {lobbysModule.generatorPrefix}Lobby 1v1
              </span>
            </p>
          </div>
          <div className="mt-4">
            <span className="uppercase text-gray-200 text-sm">
              Temporary Channels Category
            </span>
            <Select
              options={guildCategories.map((category) => ({
                label: category.name,
                value: category.id,
              }))}
              selected={lobbysModule.categoryId}
              onSelect={(value) => updateLobbysModule({ categoryId: value })}
              noSelectionMessage="No Category Selected"
            />
          </div>
          <div className="mt-4">
            <label>
              <span className="uppercase text-gray-200 text-sm">
                Temporary Channel Prefix
              </span>
              <input
                className="block max-w-md w-full mb-2 py-2 pl-3 pr-10 text-left bg-gray-900 font-medium rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-blue-300 focus-visible:ring-offset-2 focus-visible:border-indigo-500 sm:text-sm"
                value={lobbysModule.prefix}
                onChange={(e) => updateLobbysModule({ prefix: e.target.value })}
              />
            </label>
            <p className="flex items-center mb-2">
              Example{' '}
              <span className="ml-2 bg-gray-700 px-2 py-1 rounded-md inline-flex items-center text-gray-300 font-medium">
                <VolumeUpIcon
                  className="w-5 h-5 inline-block mr-1"
                  aria-hidden="true"
                />
                {lobbysModule.prefix}Lobby 1v1
              </span>
            </p>
          </div>
        </>
      )}
    </>
  )
}
