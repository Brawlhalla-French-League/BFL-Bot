import { LobbysModule } from '@prisma/client'
import { Select } from './Select'
import { VolumeUpIcon } from '@heroicons/react/solid'
import { APIChannel } from 'discord-api-types'
import { ModuleEditorBase } from './ModuleEditorBase'

interface Props {
  baseModule: LobbysModule
  guildId: string
  guildCategories: APIChannel[]
}

export const LobbysModuleEditor = ({
  baseModule,
  guildId,
  guildCategories,
}: Props) => {
  // TODO: Better error handling
  if (!guildCategories) return null

  return (
    <ModuleEditorBase<LobbysModule>
      guildId={guildId}
      baseModule={baseModule}
      moduleTitle="Lobbys"
      moduleName="lobbys"
    >
      {(module, updateModule) => {
        return (
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
                selected={module.generatorCategoryId}
                onSelect={(value) =>
                  updateModule({ generatorCategoryId: value })
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
                  value={module.generatorPrefix}
                  onChange={(e) =>
                    updateModule({ generatorPrefix: e.target.value })
                  }
                />
              </label>
              <p className="flex items-center mb-2">
                Preview{' '}
                <span className="ml-2 bg-gray-700 px-2 py-1 rounded-md inline-flex items-center text-gray-300 font-medium">
                  <VolumeUpIcon
                    className="w-5 h-5 inline-block mr-1"
                    aria-hidden="true"
                  />
                  {module.generatorPrefix}Lobby 1v1
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
                selected={module.categoryId}
                onSelect={(value) => updateModule({ categoryId: value })}
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
                  value={module.prefix}
                  onChange={(e) => updateModule({ prefix: e.target.value })}
                />
              </label>
              <p className="flex items-center mb-2">
                Preview{' '}
                <span className="ml-2 bg-gray-700 px-2 py-1 rounded-md inline-flex items-center text-gray-300 font-medium">
                  <VolumeUpIcon
                    className="w-5 h-5 inline-block mr-1"
                    aria-hidden="true"
                  />
                  {module.prefix}Lobby 1v1
                </span>
              </p>
            </div>
          </>
        )
      }}
    </ModuleEditorBase>
  )
}
