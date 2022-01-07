import { TagsModuleWithTags } from 'db/types'

interface Props {
  tagsModule: TagsModuleWithTags
  updateTagsModule: (newModule: Partial<TagsModuleWithTags>) => void
}

export const TagsModuleEditor = ({ tagsModule, updateTagsModule }: Props) => {
  const handleCreateTag = () => {
    updateTagsModule({
      tags: [
        ...tagsModule.tags,
        {
          name: '',
          content: '',
          createdAt: new Date(),
          updatedAt: new Date(),
          guildId: tagsModule.guildId,
        },
      ],
    })
  }

  const updateTag = (
    index: number,
    newTag: Partial<TagsModuleWithTags['tags'][number]>,
  ) => {
    updateTagsModule({
      tags: [
        ...tagsModule.tags.slice(0, index),
        {
          ...tagsModule.tags[index],
          ...newTag,
        },
        ...tagsModule.tags.slice(index + 1),
      ],
    })
  }

  return (
    <>
      <h3 className="text-3xl uppercase font-bold text-gray-200">Tickets</h3>
      <label>
        Activate Module
        <input
          type="checkbox"
          checked={tagsModule.enabled}
          onChange={(e) => updateTagsModule({ enabled: e.target.checked })}
        />
      </label>
      <div>
        <button
          onClick={handleCreateTag}
          className="px-2 py-1 bg-indigo-500 rounded-sm"
        >
          Create new Tag
        </button>
      </div>
      {tagsModule.enabled &&
        tagsModule.tags.map((tag, i) => (
          <div key={i}>
            <div className="mt-4">
              <label>
                <span className="uppercase text-gray-200 text-sm">Tag</span>
                <input
                  className="max-w-md w-full ml-2 mb-2 py-2 pl-3 pr-10 text-left bg-gray-900 font-medium rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-blue-300 focus-visible:ring-offset-2 focus-visible:border-indigo-500 sm:text-sm"
                  value={tag.name}
                  onChange={(e) => updateTag(i, { name: e.target.value })}
                />
              </label>
            </div>
            <div>
              <label>
                <span className="uppercase text-gray-200 text-sm">Content</span>
                <textarea
                  className="max-w-md w-full ml-2 mb-2 py-2 pl-3 pr-10 text-left bg-gray-900 font-medium rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-blue-300 focus-visible:ring-offset-2 focus-visible:border-indigo-500 sm:text-sm"
                  value={tag.content}
                  onChange={(e) => updateTag(i, { content: e.target.value })}
                />
              </label>
              <p className="flex items-center mb-2">
                Preview{' '}
                <span className="ml-2 bg-gray-700 px-2 py-1 rounded-md inline-flex items-center text-gray-300 font-medium">
                  <pre>{tag.content || '...'}</pre>
                </span>
              </p>
            </div>
          </div>
        ))}
    </>
  )
}
