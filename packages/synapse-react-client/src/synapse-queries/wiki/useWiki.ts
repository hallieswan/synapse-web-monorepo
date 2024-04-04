import { ObjectType, WikiPage } from '@sage-bionetworks/synapse-types'
import { UseQueryOptions, useQuery } from '@tanstack/react-query'
import { SynapseClient, SynapseClientError, useSynapseContext } from '../..'

export function useWikiPage(
  ownerId: string | undefined,
  wikiId: string | undefined = '',
  objectType: ObjectType = ObjectType.ENTITY,
  options?: Partial<UseQueryOptions<WikiPage, SynapseClientError>>,
) {
  const { accessToken, keyFactory } = useSynapseContext()

  return useQuery({
    ...options,
    queryKey: keyFactory.getWikiPageKey(ownerId, wikiId, objectType),

    queryFn: () =>
      SynapseClient.getEntityWiki(accessToken, ownerId, wikiId, objectType),
  })
}
