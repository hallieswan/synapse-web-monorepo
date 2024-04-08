import { Box, Button, Typography } from '@mui/material'
import React from 'react'
import { MarkdownSynapse } from '..'
import { AccessRequirement } from '@sage-bionetworks/synapse-types'
import {
  useGetAccessRequirementWikiPageKey,
  useWikiPage,
} from '../../synapse-queries'

type AccessRequirementWikiInstructionsProps = {
  accessRequirement: AccessRequirement
}

export const AccessRequirementWikiInstructions: React.FunctionComponent<
  AccessRequirementWikiInstructionsProps
> = (props: AccessRequirementWikiInstructionsProps) => {
  const { accessRequirement } = props

  const { data: wikiPageKey } = useGetAccessRequirementWikiPageKey(
    accessRequirement.id.toString(),
  )

  const { data: wikiPage } = useWikiPage(
    wikiPageKey?.ownerObjectId,
    wikiPageKey?.wikiPageId,
    wikiPageKey?.ownerObjectType,
    {
      enabled: Boolean(wikiPageKey),
    },
  )

  return (
    <Box mb={2}>
      <Typography variant="body1" fontWeight={700}>
        {'Instructions (wiki)'}
      </Typography>
      {wikiPage && wikiPage.markdown !== '' ? (
        <MarkdownSynapse markdown={wikiPage.markdown} />
      ) : (
        <Typography variant="body1Italic" mb={1}>
          There is no content.
        </Typography>
      )}
      <Button
        variant="contained"
        onClick={() => {
          // TODO - open WikiMarkdownEditor
          // TODO - if accessRequirement changes, notify parent?
        }}
      >
        Edit Instructions
      </Button>
    </Box>
  )
}
