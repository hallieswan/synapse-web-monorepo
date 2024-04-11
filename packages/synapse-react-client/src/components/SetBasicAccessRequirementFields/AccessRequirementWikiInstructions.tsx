import { Box, Button, Typography } from '@mui/material'
import {
  AccessRequirement,
  ObjectType,
  WikiPageKey,
} from '@sage-bionetworks/synapse-types'
import React, { useMemo, useState } from 'react'
import { MarkdownSynapse } from '..'
import { useGetRootWikiPageKey, useGetWikiPage } from '../../synapse-queries'
import WikiMarkdownEditor from '../WikiMarkdownEditor'

export const NO_WIKI_CONTENT = 'There is no content.'

export type AccessRequirementWikiInstructionsProps = {
  accessRequirement: AccessRequirement
}

export const AccessRequirementWikiInstructions: React.FunctionComponent<
  AccessRequirementWikiInstructionsProps
> = (props: AccessRequirementWikiInstructionsProps) => {
  const { accessRequirement } = props

  const [openWikiEditor, setOpenWikiEditor] = useState<boolean>(false)

  const ownerObjectType = ObjectType.ACCESS_REQUIREMENT
  const ownerObjectId = accessRequirement.id.toString()

  const { data: rootWikiPageKey } = useGetRootWikiPageKey(
    ownerObjectType,
    ownerObjectId,
  )

  const wikiPageKey = useMemo(() => {
    const wikiPageKey: WikiPageKey = {
      ownerObjectType,
      ownerObjectId,
      wikiPageId: rootWikiPageKey?.wikiPageId || '',
    }
    return wikiPageKey
  }, [rootWikiPageKey, ownerObjectId, ownerObjectType])

  const { data: wikiPage } = useGetWikiPage(wikiPageKey, {
    enabled: wikiPageKey.wikiPageId !== '',
  })

  return (
    <Box mb={2}>
      <Typography variant="body1" fontWeight={700}>
        {'Instructions (wiki)'}
      </Typography>
      {wikiPage && wikiPage.markdown !== '' ? (
        <MarkdownSynapse key={wikiPage.markdown} markdown={wikiPage.markdown} />
      ) : (
        <Typography variant="body1Italic" mb={1}>
          {NO_WIKI_CONTENT}
        </Typography>
      )}
      <Button variant="contained" onClick={() => setOpenWikiEditor(true)}>
        Edit Instructions
      </Button>
      {openWikiEditor && (
        <WikiMarkdownEditor
          ownerObjectType={ownerObjectType}
          ownerObjectId={ownerObjectId}
        />
      )}
    </Box>
  )
}
