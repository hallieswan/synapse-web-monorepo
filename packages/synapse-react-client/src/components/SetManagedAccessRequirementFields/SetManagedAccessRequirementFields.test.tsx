import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { MarkdownSynapse, SynapseClient } from '../..'
import { MOCK_ACCESS_TOKEN } from '../../mocks/MockSynapseContext'
import { mockManagedACTAccessRequirement } from '../../mocks/mockAccessRequirements'
import { mockManagedACTAccessRequirementWikiPage } from '../../mocks/mockWiki'
import { mockDucTemplateFileHandle } from '../../mocks/mock_file_handle'
import { rest, server } from '../../mocks/msw/server'
import { createWrapper } from '../../testutils/TestingLibraryUtils'
import { ACCESS_REQUIREMENT_WIKI_PAGE } from '../../utils/APIConstants'
import { DAY_IN_MS } from '../../utils/SynapseConstants'
import { BackendDestinationEnum, getEndpoint } from '../../utils/functions'
import {
  SetManagedAccessRequirementFields,
  SetManagedAccessRequirementFieldsHandle,
  SetManagedAccessRequirementFieldsProps,
  returnValidExpirationPeriodOrErrorMessage,
} from './SetManagedAccessRequirementFields'

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

const onSaveComplete = jest.fn()
const updateAccessRequirementSpy = jest.spyOn(
  SynapseClient,
  'updateAccessRequirement',
)

const defaultProps: SetManagedAccessRequirementFieldsProps = {
  accessRequirement: mockManagedACTAccessRequirement,
  onSaveComplete: onSaveComplete,
}

function renderComponent(props: SetManagedAccessRequirementFieldsProps) {
  const ref = React.createRef<SetManagedAccessRequirementFieldsHandle>()
  const component = render(
    <SetManagedAccessRequirementFields ref={ref} {...props} />,
    {
      wrapper: createWrapper(),
    },
  )
  return { ref, component }
}

function setUp(props: SetManagedAccessRequirementFieldsProps = defaultProps) {
  const user = userEvent.setup()
  const { ref, component } = renderComponent(props)

  const checkboxes = {
    isCertifiedUserRequired: screen.getByRole('checkbox', {
      name: 'Accessors must be certified.',
    }),
    isValidatedProfileRequired: screen.getByRole('checkbox', {
      name: 'Accessors must have a validated profile.',
    }),
    isTwoFaRequired: screen.getByRole('checkbox', {
      name: 'Accessors must use two-factor authentication (2FA).',
    }),
    isDUCRequired: screen.getByRole('checkbox', {
      name: 'DUC is required.',
    }),
    isIRBApprovalRequired: screen.getByRole('checkbox', {
      name: 'IRB approval is required.',
    }),
    areOtherAttachmentsRequired: screen.getByRole('checkbox', {
      name: 'Other documents are required.',
    }),
    isIDURequired: screen.getByRole('checkbox', {
      name: 'Intended Data Use statement is required.',
    }),
    isIDUPublic: screen.getByRole('checkbox', {
      name: 'Intended Data Use statements will be publicly available.',
    }),
  }

  const buttons = {
    uploadDucTemplate: screen.getByRole('button', {
      name: 'Upload Template DUC',
    }),
    editInstructions: screen.getByRole('button', { name: 'Edit Instructions' }),
  }

  const expirationPeriodInput = screen.getByRole('textbox', {
    name: 'Expiration period (days)',
  })

  return {
    ref,
    component,
    user,
    checkboxes,
    buttons,
    expirationPeriodInput,
  }
}

const findDucTemplateButton = async (fileName: string) => {
  return await screen.findByRole('button', { name: fileName })
}

describe('SetManagedAccessrequirementFields', () => {
  beforeEach(() => jest.clearAllMocks())
  beforeAll(() => server.listen())
  afterEach(() => server.restoreHandlers())
  afterAll(() => server.close())

  test('displays existing managed AR', async () => {
    const { checkboxes, buttons, expirationPeriodInput } = setUp()

    expect(buttons.editInstructions).toBeVisible()
    await confirmMarkdown(mockManagedACTAccessRequirementWikiPage.markdown)

    expect(checkboxes.isCertifiedUserRequired).toBeChecked()
    expect(checkboxes.isValidatedProfileRequired).toBeChecked()
    expect(checkboxes.isTwoFaRequired).toBeChecked()

    expect(checkboxes.isDUCRequired).toBeChecked()
    await findDucTemplateButton(mockDucTemplateFileHandle.fileName)

    expect(checkboxes.isIRBApprovalRequired).toBeChecked()
    expect(checkboxes.areOtherAttachmentsRequired).toBeChecked()

    expect(expirationPeriodInput).toHaveValue(
      (mockManagedACTAccessRequirement.expirationPeriod / DAY_IN_MS).toString(),
    )

    expect(checkboxes.isIDUPublic).toBeChecked()
    expect(checkboxes.isIDUPublic).toBeChecked()
  })

  test('displays managed AR without wiki content', () => {
    server.use(
      rest.get(
        `${getEndpoint(
          BackendDestinationEnum.REPO_ENDPOINT,
        )}${ACCESS_REQUIREMENT_WIKI_PAGE(':arId', ':wikiId')}`,
        async (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              ...mockManagedACTAccessRequirementWikiPage,
              markdown: '',
            }),
          )
        },
      ),
    )

    setUp()

    expect(mockMarkdownSynapse).not.toHaveBeenCalled()
    expect(screen.getByText('There is no content.')).toBeVisible()
  })

  test.todo('can update wiki instructions')

  test('handles updates to accessor requirements', async () => {
    const { user, checkboxes, ref } = setUp()

    expect(checkboxes.isCertifiedUserRequired).toBeChecked()
    expect(checkboxes.isValidatedProfileRequired).toBeChecked()
    expect(checkboxes.isTwoFaRequired).toBeChecked()

    await user.click(checkboxes.isCertifiedUserRequired)
    await user.click(checkboxes.isValidatedProfileRequired)
    await user.click(checkboxes.isTwoFaRequired)

    expect(checkboxes.isCertifiedUserRequired).not.toBeChecked()
    expect(checkboxes.isValidatedProfileRequired).not.toBeChecked()
    expect(checkboxes.isTwoFaRequired).not.toBeChecked()

    expect(updateAccessRequirementSpy).not.toHaveBeenCalled()

    // simulate parent clicking save
    ref.current?.save()

    await waitFor(() => {
      expect(onSaveComplete).toHaveBeenCalledTimes(1)
      expect(onSaveComplete).toHaveBeenLastCalledWith(true)
      expect(updateAccessRequirementSpy).toHaveBeenLastCalledWith(
        MOCK_ACCESS_TOKEN,
        {
          ...mockManagedACTAccessRequirement,
          isCertifiedUserRequired: false,
          isValidatedProfileRequired: false,
          isTwoFaRequired: false,
        },
      )
    })
  })

  test('handles updates to DUC section', async () => {
    const { user, checkboxes, ref } = setUp()

    expect(checkboxes.isDUCRequired).toBeChecked()
    expect(checkboxes.isIRBApprovalRequired).toBeChecked()
    expect(checkboxes.areOtherAttachmentsRequired).toBeChecked()

    await user.click(checkboxes.isDUCRequired)
    await user.click(checkboxes.isIRBApprovalRequired)
    await user.click(checkboxes.areOtherAttachmentsRequired)

    expect(checkboxes.isDUCRequired).not.toBeChecked()
    expect(checkboxes.isIRBApprovalRequired).not.toBeChecked()
    expect(checkboxes.areOtherAttachmentsRequired).not.toBeChecked()

    expect(updateAccessRequirementSpy).not.toHaveBeenCalled()

    // simulate parent clicking save
    ref.current?.save()

    await waitFor(() => {
      expect(onSaveComplete).toHaveBeenCalledTimes(1)
      expect(onSaveComplete).toHaveBeenLastCalledWith(true)
      expect(updateAccessRequirementSpy).toHaveBeenLastCalledWith(
        MOCK_ACCESS_TOKEN,
        {
          ...mockManagedACTAccessRequirement,
          isDUCRequired: false,
          isIRBApprovalRequired: false,
          areOtherAttachmentsRequired: false,
        },
      )
    })
  })

  test.todo('can update DUC template')

  test.todo('handles change to expiration period')
  test.todo('displays an error when expiration period is < 0')
  test.todo('cannot enter a non-number for expiration period')
  test.todo('correctly calculates expiration period in ms')

  test.todo(
    'when isIDURequired is toggled to false, isIDUPublic is disabled and false (even when previously checked)',
  )
  test.todo(
    'when isIDURequired is toggled to true, isIDUPublic is not disabled',
  )

  describe('returnValidExpirationPeriodOrErrorMessage', () => {
    test('empty string is converted to 0', () => {
      expect(returnValidExpirationPeriodOrErrorMessage('')).toBe(0)
    })
    test('valid expiration period days are converted ms', () => {
      expect(returnValidExpirationPeriodOrErrorMessage('1')).toBe(DAY_IN_MS)
      expect(returnValidExpirationPeriodOrErrorMessage('0')).toBe(0)
      expect(returnValidExpirationPeriodOrErrorMessage('012')).toBe(
        12 * DAY_IN_MS,
      )
      expect(returnValidExpirationPeriodOrErrorMessage('25')).toBe(
        25 * DAY_IN_MS,
      )
    })
    test('negative expiration period days return an error message', () => {
      const errorMsg =
        'Please enter a valid expiration period (in days): If expiration period is set, then it must be greater than 0.'
      expect(returnValidExpirationPeriodOrErrorMessage('-1')).toBe(errorMsg)
      expect(returnValidExpirationPeriodOrErrorMessage('-123')).toBe(errorMsg)
    })
    test('invalid input strings return an error message', () => {
      const errorMsgRegex =
        /^Please enter a valid expiration period \(in days\): For input string:.*/
      expect(returnValidExpirationPeriodOrErrorMessage('-1.23')).toMatch(
        errorMsgRegex,
      )
      expect(returnValidExpirationPeriodOrErrorMessage('0.23')).toMatch(
        errorMsgRegex,
      )
      expect(returnValidExpirationPeriodOrErrorMessage('.12')).toMatch(
        errorMsgRegex,
      )
      expect(returnValidExpirationPeriodOrErrorMessage('52a')).toMatch(
        errorMsgRegex,
      )
      expect(returnValidExpirationPeriodOrErrorMessage('a')).toMatch(
        errorMsgRegex,
      )
    })
  })
})
