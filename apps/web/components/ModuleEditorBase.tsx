import axios from 'axios'
import { supabase } from 'db/supabase/client'
import { ModuleType } from 'db/types'
import { useCallback, useEffect, useState } from 'react'

interface Props<CurrentModule extends ModuleType> {
  guildId: string
  moduleName: string
  moduleTitle: string
  baseModule: CurrentModule
  children: (
    module: CurrentModule,
    updateModule: (module: Partial<CurrentModule>) => void,
  ) => JSX.Element
}

export const ModuleEditorBase = <CurrentModule extends ModuleType>({
  guildId,
  baseModule,
  moduleName,
  moduleTitle,
  children,
}: Props<CurrentModule>) => {
  const [module, setModule] = useState<CurrentModule>(baseModule)
  const [hasChanges, setHasChanges] = useState(false)

  const updateModule = (module: Partial<CurrentModule>) => {
    setHasChanges(true)
    setModule((prev) => ({ ...prev, ...module }))
  }

  // const fetchModule = useCallback(() => {
  //   const session = supabase.auth.session()
  //   if (!session || !session.provider_token) return

  //   axios
  //     .get<{ module: CurrentModule }>(
  //       `/api/guild/${guildId}/module/${moduleName}`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${session.provider_token}`,
  //         },
  //       },
  //     )
  //     .then((res) => res.data)
  //     .then(({ module }) => setModule(module))
  //     .catch((err) => console.error(err))
  //     .finally(() => setLoading(false))
  // }, [guildId, moduleName])

  const handleSubmit = async () => {
    if (!hasChanges) return
    setHasChanges(false)

    const session = supabase.auth.session()
    if (!session || !session.provider_token) return

    await axios
      .post(
        `/api/guild/${guildId}/module/${moduleName}`,
        { module },
        {
          headers: {
            Authorization: `Bearer ${session.provider_token}`,
          },
        },
      )
      .then((data) => console.log(data))
      .catch((err) => {
        console.error(err)
        setHasChanges(true)
      })
  }

  return (
    <>
      <h3 className="text-3xl uppercase font-bold text-gray-200">
        {moduleTitle}
      </h3>
      <label>
        Activate Module
        <input
          type="checkbox"
          checked={module.enabled}
          onChange={(e) => updateModule({ enabled: e.target.checked } as any)}
        />
      </label>
      {module.enabled && children(module, updateModule)}
      <button
        className="mt-8 block px-2 py-1 rounded-sm bg-blue-600 hover:bg-blue-500 disabled:bg-gray-400 disabled:text-gray-900"
        onClick={handleSubmit}
        disabled={!hasChanges}
      >
        Submit changes
      </button>
    </>
  )
}
