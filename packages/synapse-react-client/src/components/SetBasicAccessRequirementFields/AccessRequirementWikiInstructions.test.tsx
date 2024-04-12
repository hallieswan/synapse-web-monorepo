import { ObjectType, WikiPage } from '@sage-bionetworks/synapse-types'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { MOCK_ACCESS_TOKEN } from '../../mocks/MockSynapseContext'
import {
  mockACTAccessRequirement,
  mockACTAccessRequirementWithWiki,
  mockACTAccessRequirementWithWikiPageKey,
} from '../../mocks/mockAccessRequirements'
import { mockACTAccessRequirementWikiPage } from '../../mocks/mockWiki'
import { server } from '../../mocks/msw/server'
import SynapseClient from '../../synapse-client'
import { createWrapper } from '../../testutils/TestingLibraryUtils'
import { MarkdownSynapse } from '../Markdown'
import {
  AccessRequirementWikiInstructions,
  AccessRequirementWikiInstructionsProps,
  NO_WIKI_CONTENT,
} from './AccessRequirementWikiInstructions'

const ownerObjectType = ObjectType.ACCESS_REQUIREMENT

const getWikiPageSpy = jest.spyOn(SynapseClient, 'getWikiPage')
const getRootWikiPageKeySpy = jest.spyOn(SynapseClient, 'getRootWikiPageKey')
const createWikiPageSpy = jest.spyOn(SynapseClient, 'createWikiPage')
const updateWikiPageSpy = jest.spyOn(SynapseClient, 'updateWikiPage')

const MARKDOWN_SYNAPSE_TEST_ID = 'MarkdownSynapseContent'
jest.mock('../Markdown/MarkdownSynapse', () => ({
  __esModule: true,
  default: jest.fn(),
}))
const mockMarkdownSynapse = jest.mocked(MarkdownSynapse)
mockMarkdownSynapse.mockImplementation(
  () => (<div data-testid={MARKDOWN_SYNAPSE_TEST_ID} />) as any,
)
async function confirmMarkdown(markdown: string) {
  await screen.findByTestId(MARKDOWN_SYNAPSE_TEST_ID)
  expect(mockMarkdownSynapse).toHaveBeenCalledWith(
    expect.objectContaining({
      markdown: markdown,
    }),
    expect.anything(),
  )
}

function renderComponent(props: AccessRequirementWikiInstructionsProps) {
  return render(<AccessRequirementWikiInstructions {...props} />, {
    wrapper: createWrapper(),
  })
}

function setUp(props: AccessRequirementWikiInstructionsProps) {
  const user = userEvent.setup()
  const component = renderComponent(props)

  const editBtn = screen.getByRole('button', { name: 'Edit Instructions' })

  return { component, user, editBtn }
}

describe('AccessRequirementWikiInstructions', () => {
  beforeEach(() => jest.clearAllMocks())
  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  test('creates and edits new wiki when there is not an existing wiki', async () => {
    const ownerObjectId = mockACTAccessRequirement.id.toString()
    const props: AccessRequirementWikiInstructionsProps = {
      accessRequirement: mockACTAccessRequirement,
    }
    const { user, editBtn } = setUp(props)

    expect(getRootWikiPageKeySpy).toHaveBeenCalledTimes(1)
    expect(getRootWikiPageKeySpy).toHaveBeenLastCalledWith(
      MOCK_ACCESS_TOKEN,
      ownerObjectType,
      ownerObjectId,
    )
    expect(await getRootWikiPageKeySpy.mock.results[0].value).toBe(null)
    expect(getWikiPageSpy).not.toHaveBeenCalled()
    expect(createWikiPageSpy).not.toHaveBeenCalled()

    expect(mockMarkdownSynapse).not.toHaveBeenCalled()
    expect(screen.getByText(NO_WIKI_CONTENT)).toBeVisible()

    await user.click(editBtn)

    const editDialog = await screen.findByRole('dialog', {
      name: 'Edit Wiki Markdown',
    })
    await waitFor(() => {
      expect(getRootWikiPageKeySpy).toHaveBeenCalledTimes(1)
      expect(createWikiPageSpy).toHaveBeenCalledTimes(1)
      expect(createWikiPageSpy).toHaveBeenLastCalledWith(
        MOCK_ACCESS_TOKEN,
        ownerObjectType,
        ownerObjectId,
        {
          attachmentFileHandleIds: [],
          markdown: '',
          parentWikId: undefined,
          title: '',
        },
      )
      expect(getWikiPageSpy).not.toHaveBeenCalled()
    })

    const newWikiPage = (await createWikiPageSpy.mock.results[0]
      .value) as WikiPage

    const markdownField = await screen.findByRole('textbox', {
      name: 'markdown',
    })
    expect(markdownField).toHaveValue('')

    const newMarkdown = 'Some new markdown AR instructions'
    await user.type(markdownField, newMarkdown)
    expect(markdownField).toHaveValue(newMarkdown)

    const saveBtn = within(editDialog).getByRole('button', { name: 'Save' })
    await user.click(saveBtn)

    await waitFor(() => {
      expect(updateWikiPageSpy).toHaveBeenCalledTimes(1)
      expect(updateWikiPageSpy).toHaveBeenLastCalledWith(
        MOCK_ACCESS_TOKEN,
        ownerObjectType,
        ownerObjectId,
        {
          ...newWikiPage,
          markdown: newMarkdown,
        },
      )
      expect(editDialog).not.toBeInTheDocument()
    })

    expect(mockMarkdownSynapse).toHaveBeenCalledTimes(1)
    await confirmMarkdown(newMarkdown)
    expect(screen.queryByText(NO_WIKI_CONTENT)).toBeNull()

    expect(getWikiPageSpy).not.toHaveBeenCalled()
    expect(getRootWikiPageKeySpy).toHaveBeenCalledTimes(1)
    expect(createWikiPageSpy).toHaveBeenCalledTimes(1)
    expect(updateWikiPageSpy).toHaveBeenCalledTimes(1)
  })

  test('edits an existing wiki', async () => {
    const ownerObjectId = mockACTAccessRequirementWithWiki.id.toString()
    const props: AccessRequirementWikiInstructionsProps = {
      accessRequirement: mockACTAccessRequirementWithWiki,
    }
    const { user, editBtn } = setUp(props)

    await waitFor(() => {
      expect(getRootWikiPageKeySpy).toHaveBeenCalledTimes(1)
      expect(getRootWikiPageKeySpy).toHaveBeenLastCalledWith(
        MOCK_ACCESS_TOKEN,
        ownerObjectType,
        ownerObjectId,
      )
    })
    expect(await getRootWikiPageKeySpy.mock.results[0].value).toStrictEqual(
      mockACTAccessRequirementWithWikiPageKey,
    )

    await waitFor(() => {
      expect(getWikiPageSpy).toHaveBeenCalledTimes(1)
      expect(getWikiPageSpy).toHaveBeenLastCalledWith(
        MOCK_ACCESS_TOKEN,
        mockACTAccessRequirementWithWikiPageKey,
      )
    })
    expect(await getWikiPageSpy.mock.results[0].value).toStrictEqual(
      mockACTAccessRequirementWikiPage,
    )

    expect(mockMarkdownSynapse).toHaveBeenCalledTimes(1)
    await confirmMarkdown(mockACTAccessRequirementWikiPage.markdown)
    expect(screen.queryByText(NO_WIKI_CONTENT)).toBeNull()

    await user.click(editBtn)

    const editDialog = await screen.findByRole('dialog', {
      name: 'Edit Wiki Markdown',
    })

    const markdownField = await screen.findByRole('textbox', {
      name: 'markdown',
    })
    expect(markdownField).toHaveValue(mockACTAccessRequirementWikiPage.markdown)

    expect(getRootWikiPageKeySpy).toHaveBeenCalledTimes(1)
    expect(getWikiPageSpy).toHaveBeenCalledTimes(1)
    expect(createWikiPageSpy).not.toHaveBeenCalled()

    const newMarkdown = 'Some new markdown AR instructions'
    await user.clear(markdownField)
    await user.type(markdownField, newMarkdown)
    expect(markdownField).toHaveValue(newMarkdown)

    const saveBtn = within(editDialog).getByRole('button', { name: 'Save' })
    await user.click(saveBtn)

    await waitFor(() => {
      expect(updateWikiPageSpy).toHaveBeenCalledTimes(1)
      expect(updateWikiPageSpy).toHaveBeenLastCalledWith(
        MOCK_ACCESS_TOKEN,
        ownerObjectType,
        ownerObjectId,
        {
          ...mockACTAccessRequirementWikiPage,
          markdown: newMarkdown,
        },
      )
      expect(editDialog).not.toBeInTheDocument()
    })

    await confirmMarkdown(newMarkdown)

    expect(getWikiPageSpy).toHaveBeenCalledTimes(1)
    expect(getRootWikiPageKeySpy).toHaveBeenCalledTimes(1)
    expect(createWikiPageSpy).toHaveBeenCalledTimes(0)
    expect(updateWikiPageSpy).toHaveBeenCalledTimes(1)
  })
})
