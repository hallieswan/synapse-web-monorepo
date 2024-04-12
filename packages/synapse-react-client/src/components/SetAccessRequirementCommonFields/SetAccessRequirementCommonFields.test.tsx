import {
  ACCESS_TYPE,
  MANAGED_ACT_ACCESS_REQUIREMENT_CONCRETE_TYPE_VALUE,
  ManagedACTAccessRequirement,
  RestrictableObjectDescriptor,
  RestrictableObjectType,
  SELF_SIGN_ACCESS_REQUIREMENT_CONCRETE_TYPE_VALUE,
  SelfSignAccessRequirement,
} from '@sage-bionetworks/synapse-types'
import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import SetAccessRequirementCommonFields, {
  SetAccessRequirementCommonFieldsHandle,
  SetAccessRequirementCommonFieldsProps,
} from '.'
import { MOCK_ACCESS_TOKEN } from '../../mocks/MockSynapseContext'
import {
  MOCK_FILE_ENTITY_ID,
  MOCK_FILE_NAME,
} from '../../mocks/entity/mockFileEntity'
import {
  MOCK_ETAG,
  MOCK_NEWLY_CREATED_AR_ID,
  mockACTAccessRequirement,
  mockManagedACTAccessRequirement,
  mockSelfSignAccessRequirement,
  mockTeamManagedACTAccessRequirement,
  mockToUAccessRequirement,
} from '../../mocks/mockAccessRequirements'
import { server } from '../../mocks/msw/server'
import { MOCK_TEAM_ID, mockTeamData } from '../../mocks/team/mockTeam'
import SynapseClient from '../../synapse-client'
import { createWrapper } from '../../testutils/TestingLibraryUtils'
import { REMOVE_TEXT } from '../TeamSubjectsSelector/TeamSubjectsSelector'
import {
  EMPTY_SUBJECT_LIST_ERROR_MESSAGE,
  MISSING_NAME_ERROR_MESSAGE,
  UNSAVED_SUBJECTS_ERROR_MESSAGE,
} from './SetAccessRequirementCommonFields'

const onSaveComplete = jest.fn()
const createAccessRequirementSpy = jest.spyOn(
  SynapseClient,
  'createAccessRequirement',
)
const updateAccessRequirementSpy = jest.spyOn(
  SynapseClient,
  'updateAccessRequirement',
)

const entitySubject: RestrictableObjectDescriptor = {
  id: MOCK_FILE_ENTITY_ID,
  type: RestrictableObjectType.ENTITY,
}
const teamSubject: RestrictableObjectDescriptor = {
  id: MOCK_TEAM_ID.toString(),
  type: RestrictableObjectType.TEAM,
}

function renderComponent(props: SetAccessRequirementCommonFieldsProps) {
  const ref = React.createRef<SetAccessRequirementCommonFieldsHandle>()
  const component = render(
    <SetAccessRequirementCommonFields ref={ref} {...props} />,
    {
      wrapper: createWrapper(),
    },
  )
  return { ref, component }
}

function setUp(props: SetAccessRequirementCommonFieldsProps) {
  const user = userEvent.setup()
  const { ref, component } = renderComponent(props)

  const nameInput = screen.getByRole('textbox', { name: 'Name' })

  return { ref, component, user, nameInput }
}

function getRadioButtons() {
  const radioGroup = screen.getByRole('radiogroup')
  return {
    managed: within(radioGroup).getByRole('radio', {
      name: 'Controlled - requests are in Synapse',
    }),
    selfSign: within(radioGroup).getByRole('radio', { name: 'Click wrap' }),
  }
}

describe('SetAccessRequirementCommonFields', () => {
  beforeEach(() => jest.clearAllMocks())
  beforeAll(() => server.listen())
  afterEach(() => server.restoreHandlers())
  afterAll(() => server.close())

  test('creates a new managed entity AR', async () => {
    const props: SetAccessRequirementCommonFieldsProps = {
      subject: entitySubject,
      onSaveComplete,
    }
    const { ref, user, nameInput } = setUp(props)

    await waitFor(() => {
      expect(screen.getByText(MOCK_FILE_NAME)).toBeVisible()
      expect(nameInput).toHaveValue('')
    })

    const radioButtons = getRadioButtons()
    expect(radioButtons.managed).toBeChecked()
    expect(radioButtons.selfSign).not.toBeChecked()

    const name = 'some name'
    await user.type(nameInput, name)
    expect(nameInput).toHaveValue(name)
    expect(onSaveComplete).not.toHaveBeenCalled()

    // parent calls save
    ref.current?.save()

    await waitFor(() => {
      const managedAr: Pick<
        ManagedACTAccessRequirement,
        'concreteType' | 'name' | 'subjectIds' | 'accessType'
      > = {
        concreteType: MANAGED_ACT_ACCESS_REQUIREMENT_CONCRETE_TYPE_VALUE,
        name: name,
        subjectIds: [entitySubject],
        accessType: ACCESS_TYPE.DOWNLOAD,
      }

      expect(createAccessRequirementSpy).toHaveBeenCalledWith(
        MOCK_ACCESS_TOKEN,
        managedAr,
      )
      expect(updateAccessRequirementSpy).not.toHaveBeenCalled()

      expect(onSaveComplete).toHaveBeenCalledTimes(1)
      expect(onSaveComplete).toHaveBeenLastCalledWith({
        ...managedAr,
        id: MOCK_NEWLY_CREATED_AR_ID,
        etag: MOCK_ETAG,
      })
    })
  })

  test('creates a new self-sign entity AR', async () => {
    const props: SetAccessRequirementCommonFieldsProps = {
      subject: entitySubject,
      onSaveComplete,
    }
    const { ref, user, nameInput } = setUp(props)

    await waitFor(() => {
      expect(screen.getByText(MOCK_FILE_NAME)).toBeVisible()
      expect(nameInput).toHaveValue('')
    })

    const name = 'some name'
    await user.type(nameInput, name)

    const radioButtons = getRadioButtons()
    await user.click(radioButtons.selfSign)
    expect(radioButtons.managed).not.toBeChecked()
    expect(radioButtons.selfSign).toBeChecked()

    expect(onSaveComplete).not.toHaveBeenCalled()

    // parent calls save
    ref.current?.save()

    await waitFor(() => {
      const selfSignAr: Pick<
        SelfSignAccessRequirement,
        'concreteType' | 'name' | 'subjectIds' | 'accessType'
      > = {
        concreteType: SELF_SIGN_ACCESS_REQUIREMENT_CONCRETE_TYPE_VALUE,
        name: name,
        subjectIds: [entitySubject],
        accessType: ACCESS_TYPE.DOWNLOAD,
      }

      expect(createAccessRequirementSpy).toHaveBeenCalledWith(
        MOCK_ACCESS_TOKEN,
        selfSignAr,
      )
      expect(updateAccessRequirementSpy).not.toHaveBeenCalled()

      expect(onSaveComplete).toHaveBeenCalledTimes(1)
      expect(onSaveComplete).toHaveBeenLastCalledWith({
        ...selfSignAr,
        id: MOCK_NEWLY_CREATED_AR_ID,
        etag: MOCK_ETAG,
      })
    })
  })

  test('creates a new managed team AR', async () => {
    const props: SetAccessRequirementCommonFieldsProps = {
      subject: teamSubject,
      onSaveComplete,
    }
    const { ref, user, nameInput } = setUp(props)

    await waitFor(() => {
      expect(
        screen.getByRole('link', { name: mockTeamData.name }),
      ).toBeVisible()
      expect(nameInput).toHaveValue('')
    })

    const name = 'some name'
    await user.type(nameInput, name)

    const radioButtons = getRadioButtons()
    expect(radioButtons.managed).toBeChecked()
    expect(radioButtons.selfSign).not.toBeChecked()

    expect(onSaveComplete).not.toHaveBeenCalled()

    // parent calls save
    ref.current?.save()

    await waitFor(() => {
      const managedAr: Pick<
        ManagedACTAccessRequirement,
        'concreteType' | 'name' | 'subjectIds' | 'accessType'
      > = {
        concreteType: MANAGED_ACT_ACCESS_REQUIREMENT_CONCRETE_TYPE_VALUE,
        name: name,
        subjectIds: [teamSubject],
        accessType: ACCESS_TYPE.PARTICIPATE,
      }

      expect(createAccessRequirementSpy).toHaveBeenCalledWith(
        MOCK_ACCESS_TOKEN,
        managedAr,
      )
      expect(updateAccessRequirementSpy).not.toHaveBeenCalled()

      expect(onSaveComplete).toHaveBeenCalledTimes(1)
      expect(onSaveComplete).toHaveBeenLastCalledWith({
        ...managedAr,
        id: MOCK_NEWLY_CREATED_AR_ID,
        etag: MOCK_ETAG,
      })
    })
  })

  test('updates an existing managed team AR', async () => {
    const accessRequirementId =
      mockTeamManagedACTAccessRequirement.id.toString()
    const props: SetAccessRequirementCommonFieldsProps = {
      onSaveComplete,
      accessRequirementId,
    }
    const { ref, user, nameInput } = setUp(props)

    await waitFor(() => {
      expect(
        screen.getByRole('link', { name: mockTeamData.name }),
      ).toBeVisible()
      expect(nameInput).toHaveValue(mockTeamManagedACTAccessRequirement.name)
      // cannot select access type for existing AR
      expect(screen.queryByRole('radiogroup')).toBeNull()
    })

    const updatedName = 'a new name'
    await user.clear(nameInput)
    await user.type(nameInput, updatedName)

    expect(nameInput).toHaveValue(updatedName)
    expect(onSaveComplete).not.toHaveBeenCalled()

    // parent calls save
    ref.current?.save()

    await waitFor(() => {
      const updatedAr: ManagedACTAccessRequirement = {
        ...mockTeamManagedACTAccessRequirement,
        name: updatedName,
      }
      expect(onSaveComplete).toHaveBeenCalledTimes(1)
      expect(onSaveComplete).toHaveBeenLastCalledWith(updatedAr)
      expect(createAccessRequirementSpy).not.toHaveBeenCalled()
      expect(updateAccessRequirementSpy).toHaveBeenCalledWith(
        MOCK_ACCESS_TOKEN,
        updatedAr,
      )
    })
  })

  const existingEntityArs = [
    // Lock ARs can only be deleted by ACT, so will not be managed with this component
    // ...so will not be included in this test.
    // mockLockAccessRequirement,
    mockSelfSignAccessRequirement,
    mockManagedACTAccessRequirement,
    mockToUAccessRequirement,
    mockACTAccessRequirement,
  ]
  for (const ar of existingEntityArs) {
    test(`updates an existing entity AR - ${ar.name}`, async () => {
      const props: SetAccessRequirementCommonFieldsProps = {
        onSaveComplete,
        accessRequirementId: ar.id.toString(),
      }
      const { ref, user, nameInput } = setUp(props)

      await waitFor(() => {
        expect(
          screen.getByRole('link', { name: ar.subjectIds[0].id }),
        ).toBeVisible()
        expect(nameInput).toHaveValue(ar.name)
        // cannot select access type for existing AR
        expect(screen.queryByRole('radiogroup')).toBeNull()
      })

      const updatedName = 'a new name'
      await user.clear(nameInput)
      await user.type(nameInput, updatedName)

      expect(nameInput).toHaveValue(updatedName)
      expect(onSaveComplete).not.toHaveBeenCalled()

      // parent calls save
      ref.current?.save()

      await waitFor(() => {
        const updatedAr = { ...ar, name: updatedName }
        expect(onSaveComplete).toHaveBeenCalledTimes(1)
        expect(onSaveComplete).toHaveBeenLastCalledWith(updatedAr)
        expect(createAccessRequirementSpy).not.toHaveBeenCalled()
        expect(updateAccessRequirementSpy).toHaveBeenCalledWith(
          MOCK_ACCESS_TOKEN,
          updatedAr,
        )
      })
    })
  }

  test('displays error when name is not provided', async () => {
    const props: SetAccessRequirementCommonFieldsProps = {
      subject: entitySubject,
      onSaveComplete,
    }
    const { ref, nameInput } = setUp(props)

    await waitFor(() => {
      expect(screen.getByText(MOCK_FILE_NAME)).toBeVisible()
      expect(nameInput).toHaveValue('')
    })

    // parent calls save
    act(() => ref.current?.save())

    await waitFor(() => {
      expect(onSaveComplete).toHaveBeenCalledTimes(1)
      expect(onSaveComplete).toHaveBeenLastCalledWith(null)
      expect(createAccessRequirementSpy).not.toHaveBeenCalled()
      expect(updateAccessRequirementSpy).not.toHaveBeenCalled()
    })

    expect(screen.getByRole('alert')).toHaveTextContent(
      MISSING_NAME_ERROR_MESSAGE,
    )
  })

  test('displays error when there are pending subjects', async () => {
    const props: SetAccessRequirementCommonFieldsProps = {
      accessRequirementId: mockTeamManagedACTAccessRequirement.id.toString(),
      onSaveComplete,
    }
    const { ref, user } = setUp(props)

    await waitFor(() => {
      expect(
        screen.getByRole('link', { name: mockTeamData.name }),
      ).toBeVisible()
    })

    const teamInput = screen.getByRole('textbox', { name: 'Add Team IDs' })
    expect(teamInput).toHaveValue('')
    await user.type(teamInput, '123, 456')

    // parent calls save
    act(() => ref.current?.save())

    await waitFor(() => {
      expect(onSaveComplete).toHaveBeenCalledTimes(1)
      expect(onSaveComplete).toHaveBeenLastCalledWith(null)
      expect(createAccessRequirementSpy).not.toHaveBeenCalled()
      expect(updateAccessRequirementSpy).not.toHaveBeenCalled()
    })

    expect(screen.getByRole('alert')).toHaveTextContent(
      UNSAVED_SUBJECTS_ERROR_MESSAGE(RestrictableObjectType.TEAM),
    )
  })

  test('displays error when there are no subjects', async () => {
    const props: SetAccessRequirementCommonFieldsProps = {
      accessRequirementId: mockTeamManagedACTAccessRequirement.id.toString(),
      onSaveComplete,
    }
    const { ref, user } = setUp(props)

    const link = await screen.findByRole('link', { name: mockTeamData.name })

    const removeButton = screen.getByRole('button', {
      name: REMOVE_TEXT,
    })
    await user.click(removeButton)
    expect(link).not.toBeVisible()

    // parent calls save
    act(() => ref.current?.save())

    await waitFor(() => {
      expect(onSaveComplete).toHaveBeenCalledTimes(1)
      expect(onSaveComplete).toHaveBeenLastCalledWith(null)
      expect(createAccessRequirementSpy).not.toHaveBeenCalled()
      expect(updateAccessRequirementSpy).not.toHaveBeenCalled()
    })

    expect(screen.getByRole('alert')).toHaveTextContent(
      EMPTY_SUBJECT_LIST_ERROR_MESSAGE,
    )
  })
})
