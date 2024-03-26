import { HelpOutlineTwoTone } from '@mui/icons-material'
import {
  Alert,
  Stack,
  TextField,
  Tooltip,
  Typography,
  TypographyProps,
} from '@mui/material'
import {
  ACCESS_REQUIREMENT_CONCRETE_TYPE,
  ACCESS_TYPE,
  AccessRequirement,
  MANAGED_ACT_ACCESS_REQUIREMENT_CONCRETE_TYPE_VALUE,
  RestrictableObjectDescriptor,
  RestrictableObjectType,
  SELF_SIGN_ACCESS_REQUIREMENT_CONCRETE_TYPE_VALUE,
} from '@sage-bionetworks/synapse-types'
import pluralize from 'pluralize'
import React, { useEffect, useImperativeHandle, useMemo, useState } from 'react'
import {
  useCreateAccessRequirement,
  useGetAccessRequirements,
  useUpdateAccessRequirement,
} from '../../synapse-queries'
import { SynapseClientError } from '../../utils/SynapseClientError'
import EntitySubjectsSelector from '../EntitySubjectsSelector'
import TeamSubjectsSelector from '../TeamSubjectsSelector'
import { RadioGroup } from '../widgets/RadioGroup'

export const EMPTY_SUBJECT_LIST_ERROR_MESSAGE =
  'Please select at least one resource for this Access Requirement to be associated with.'
export const UNSAVED_SUBJECTS_ERROR_MESSAGE = (
  subjectsType: RestrictableObjectType,
) => {
  const idsText =
    subjectsType === RestrictableObjectType.ENTITY ? 'Synapse' : 'Team'
  const typeText =
    subjectsType[0].toUpperCase() + subjectsType.slice(1).toLowerCase()
  return `${idsText} IDs were specified but not added to the subjects list. Please either clear out the Add ${idsText} IDs textbox or click the Add ${pluralize(
    typeText,
  )} button.`
}
export const MISSING_NAME_ERROR_MESSAGE =
  'Please enter a name for this Access Requirement.'
const NAME_HELP_TEXT =
  "Enter access requirement name. This will also be used when sending notifications for expiring or revoked approval. For example, 'The approval for the name access requirement was revoked...'"

const headerProps: Partial<TypographyProps> = {
  variant: 'body1',
  fontWeight: 700,
}

function getAccessType(subject: RestrictableObjectDescriptor) {
  switch (subject.type) {
    case RestrictableObjectType.ENTITY:
      return ACCESS_TYPE.DOWNLOAD
    case RestrictableObjectType.TEAM:
      return ACCESS_TYPE.PARTICIPATE
    default:
      throw new Error(
        `RestrictableObjectType ${subject.type} does not have an access type specified.`,
      )
  }
}

export type SetAccessRequirementCommonFieldsHandle = {
  /* Allow the parent component to trigger saving the AR, so this may be embedded in an arbitrary modal. */
  save: () => void
}

export type SetAccessRequirementCommonFieldsProps = {
  /* Provided when creating a new AR */
  subject?: RestrictableObjectDescriptor
  /* Provided when editing an existing AR */
  accessRequirementId?: string
  /* Called when AR has been saved or an error has been returned */
  onSaveComplete: (saveSuccessful: boolean) => void
}

export const SetAccessRequirementCommonFields = React.forwardRef(
  function SetAccessRequirementCommonFields(
    props: SetAccessRequirementCommonFieldsProps,
    ref: React.ForwardedRef<SetAccessRequirementCommonFieldsHandle>,
  ) {
    const { subject, accessRequirementId, onSaveComplete } = props

    const [subjects, setSubjects] = useState<RestrictableObjectDescriptor[]>(
      subject ? [subject] : [],
    )
    const [hasPendingSubjects, setHasPendingSubjects] = useState<boolean>(false)
    const [subjectsError, setSubjectsError] = useState<string | null>(null)
    const [name, setName] = useState<string>('')
    const [nameError, setNameError] = useState<string | null>(null)
    const [arType, setArType] = useState<ACCESS_REQUIREMENT_CONCRETE_TYPE>(
      MANAGED_ACT_ACCESS_REQUIREMENT_CONCRETE_TYPE_VALUE,
    )
    const [clientError, setClientError] = useState<string | null>(null)

    const isEditing = !subject

    const onMutationSuccess = () => {
      setClientError(null)
      onSaveComplete(true)
    }

    const onMutationError = (error: SynapseClientError) => {
      setClientError(error.reason)
      onSaveComplete(false)
    }

    const { mutate: createAccessRequirement } = useCreateAccessRequirement({
      onSuccess: () => onMutationSuccess(),
      onError: error => onMutationError(error),
    })

    const { mutate: updateAccessRequirement } = useUpdateAccessRequirement({
      onSuccess: () => onMutationSuccess(),
      onError: error => onMutationError(error),
    })

    const { data: accessRequirement } = useGetAccessRequirements(
      accessRequirementId!,
      { enabled: Boolean(accessRequirementId) },
    )

    useEffect(() => {
      if (accessRequirement) {
        setArType(accessRequirement.concreteType)
        setName(accessRequirement.name)
        setSubjects(accessRequirement.subjectIds)
      }
    }, [accessRequirement])

    const subjectsType = useMemo(() => {
      if (subject) {
        return subject.type
      }
      if (accessRequirement) {
        const initialSubjects = accessRequirement.subjectIds
        if (initialSubjects.length > 0) {
          return initialSubjects[0].type
        }
      }
      return RestrictableObjectType.TEAM
    }, [subject, accessRequirement])

    const selectorContent = useMemo(() => {
      switch (subjectsType) {
        case RestrictableObjectType.TEAM:
          return (
            <TeamSubjectsSelector
              subjects={subjects}
              onUpdate={subjects => {
                setSubjectsError(null)
                setSubjects(subjects)
              }}
              onUpdateTeamIDsTextbox={value => {
                setSubjectsError(null)
                setHasPendingSubjects(value !== '')
              }}
            />
          )
        case RestrictableObjectType.ENTITY:
          return (
            <EntitySubjectsSelector
              subjects={subjects}
              onUpdate={subjects => {
                setSubjectsError(null)
                setSubjects(subjects)
              }}
              onUpdateEntityIDsTextbox={value => {
                setSubjectsError(null)
                setHasPendingSubjects(value !== '')
              }}
            />
          )
        default:
          console.error(
            `RestrictableObjectType ${subjectsType} does not have a selector implemented.`,
          )
          return <></>
      }
    }, [subjectsType, subjects])

    useImperativeHandle(
      ref,
      () => {
        return {
          save() {
            const hasFormErrors =
              hasPendingSubjects || subjects.length === 0 || name === ''
            if (hasFormErrors) {
              if (hasPendingSubjects) {
                setSubjectsError(UNSAVED_SUBJECTS_ERROR_MESSAGE(subjectsType))
              } else if (subjects.length === 0) {
                setSubjectsError(EMPTY_SUBJECT_LIST_ERROR_MESSAGE)
              }
              if (name === '') {
                setNameError(MISSING_NAME_ERROR_MESSAGE)
              }
              onSaveComplete(false)
            } else {
              if (isEditing) {
                updateAccessRequirement({
                  ...accessRequirement!,
                  subjectIds: subjects,
                  name: name,
                  accessType: getAccessType(subjects[0]),
                })
              } else {
                const newAr: Partial<AccessRequirement> = {
                  concreteType: arType,
                  subjectIds: subjects,
                  name: name,
                  accessType: getAccessType(subjects[0]),
                }
                createAccessRequirement(newAr)
              }
            }
          },
        }
      },
      [
        hasPendingSubjects,
        subjectsType,
        subjects,
        name,
        arType,
        accessRequirement,
        isEditing,
        onSaveComplete,
        createAccessRequirement,
        updateAccessRequirement,
      ],
    )

    return (
      <>
        <Typography {...headerProps}>Resources</Typography>
        {selectorContent}
        {subjectsError && <Alert severity="error">{subjectsError}</Alert>}
        <Stack direction="row" gap={1} alignItems="center" mb={1} mt={2}>
          <Typography component="label" htmlFor="arName" {...headerProps}>
            Name
          </Typography>
          <Tooltip title={NAME_HELP_TEXT} placement="right">
            <HelpOutlineTwoTone sx={{ color: 'grey.600' }} />
          </Tooltip>
        </Stack>
        <TextField
          id="arName"
          name="arName"
          value={name}
          placeholder="Access requirement name"
          fullWidth
          onChange={event => {
            setNameError(null)
            setName(event.target.value)
          }}
        />
        {nameError && (
          <Alert severity="error" sx={{ marginTop: 1 }}>
            {nameError}
          </Alert>
        )}
        {!isEditing && (
          <>
            <Typography {...headerProps} mt={2}>
              Access requirement type
            </Typography>
            <RadioGroup
              value={arType}
              options={[
                {
                  label: 'Controlled - requests are in Synapse',
                  value: MANAGED_ACT_ACCESS_REQUIREMENT_CONCRETE_TYPE_VALUE,
                },
                {
                  label: 'Click wrap',
                  value: SELF_SIGN_ACCESS_REQUIREMENT_CONCRETE_TYPE_VALUE,
                },
              ]}
              onChange={(value: string) =>
                setArType(value as ACCESS_REQUIREMENT_CONCRETE_TYPE)
              }
            />
          </>
        )}
        {clientError && (
          <Alert severity="error" sx={{ marginTop: 2 }}>
            {clientError}
          </Alert>
        )}
      </>
    )
  },
)
