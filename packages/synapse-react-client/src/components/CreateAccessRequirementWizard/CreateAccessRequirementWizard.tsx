import {
  AccessRequirement,
  MANAGED_ACT_ACCESS_REQUIREMENT_CONCRETE_TYPE_VALUE,
  ManagedACTAccessRequirement,
} from '@sage-bionetworks/synapse-types'
import React, { useMemo, useRef, useState } from 'react'
import {
  AccessRequirementAclEditor,
  AccessRequirementAclEditorHandle,
} from '../AccessRequirementAclEditor/AccessRequirementAclEditor'
import ConfirmationDialog from '../ConfirmationDialog'
import {
  SetAccessRequirementCommonFields,
  SetAccessRequirementCommonFieldsHandle,
  SetAccessRequirementCommonFieldsProps,
} from '../SetAccessRequirementCommonFields'
import SetBasicAccessRequirementFields, {
  BasicAccessRequirement,
  SetBasicAccessRequirementFieldsHandle,
} from '../SetBasicAccessRequirementFields'
import SetManagedAccessRequirementFields, {
  SetManagedAccessRequirementFieldsHandle,
} from '../SetManagedAccessRequirementFields'
import {
  CreateAccessRequirementWizardStep,
  getModalTitle,
  isLastStep,
} from './CreateAccessRequirementWizardUtils'

export type CreateAccessRequirementWizardProps = {
  open: boolean
  onCancel: () => void
  onComplete: () => void
} & Pick<
  SetAccessRequirementCommonFieldsProps,
  'subject' | 'accessRequirementId'
>

export const CreateAccessRequirementWizard: React.FunctionComponent<
  CreateAccessRequirementWizardProps
> = (props: CreateAccessRequirementWizardProps) => {
  const { open, onCancel, onComplete } = props

  const [step, setStep] = useState<CreateAccessRequirementWizardStep>(
    'SET_AR_COMMON_FIELDS',
  )
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [accessRequirement, setAccessRequirement] = useState<
    AccessRequirement | undefined
  >(undefined)

  const setArCommonFieldsRef =
    useRef<SetAccessRequirementCommonFieldsHandle>(null)
  const setManagedArFieldsRef =
    useRef<SetManagedAccessRequirementFieldsHandle>(null)
  const editArAclRef = useRef<AccessRequirementAclEditorHandle>(null)
  const setBasicArFieldsRef =
    useRef<SetBasicAccessRequirementFieldsHandle>(null)

  const isEditing = 'accessRequirementId' in props

  const stepContent = useMemo(() => {
    switch (step) {
      case 'SET_AR_COMMON_FIELDS':
        return (
          <SetAccessRequirementCommonFields
            ref={setArCommonFieldsRef}
            onSaveComplete={accessRequirement => {
              if (accessRequirement) {
                setAccessRequirement(accessRequirement)
                const nextStep: CreateAccessRequirementWizardStep =
                  accessRequirement.concreteType ===
                  MANAGED_ACT_ACCESS_REQUIREMENT_CONCRETE_TYPE_VALUE
                    ? 'SET_MANAGED_AR_FIELDS'
                    : 'SET_BASIC_AR_FIELDS'
                setStep(nextStep)
              }
              setIsLoading(false)
            }}
            subject={props.subject}
            accessRequirementId={props.accessRequirementId}
          />
        )
      case 'SET_MANAGED_AR_FIELDS':
        return (
          <SetManagedAccessRequirementFields
            ref={setManagedArFieldsRef}
            accessRequirement={
              accessRequirement! as ManagedACTAccessRequirement
            }
            onSaveComplete={updatedAr => {
              if (updatedAr) {
                setAccessRequirement(updatedAr)
                setStep('SET_MANAGED_AR_ACL_PERMISSIONS')
              }
              setIsLoading(false)
            }}
          />
        )
      case 'SET_MANAGED_AR_ACL_PERMISSIONS':
        return (
          <AccessRequirementAclEditor
            ref={editArAclRef}
            accessRequirementId={accessRequirement!.id.toString()}
            onSaveComplete={saveSuccessful => {
              if (saveSuccessful) {
                onComplete()
              }
              setIsLoading(false)
            }}
          />
        )
      case 'SET_BASIC_AR_FIELDS':
        return (
          <SetBasicAccessRequirementFields
            ref={setBasicArFieldsRef}
            accessRequirement={accessRequirement! as BasicAccessRequirement}
            onSaveComplete={updatedAr => {
              if (updatedAr) {
                setAccessRequirement(updatedAr)
                onComplete()
              }
              setIsLoading(false)
            }}
          />
        )
    }
  }, [
    step,
    props.subject,
    props.accessRequirementId,
    accessRequirement,
    onComplete,
  ])

  const onClickPrimary = () => {
    setIsLoading(true)
    switch (step) {
      case 'SET_AR_COMMON_FIELDS':
        setArCommonFieldsRef?.current?.save()
        return
      case 'SET_MANAGED_AR_FIELDS':
        setManagedArFieldsRef?.current?.save()
        return
      case 'SET_MANAGED_AR_ACL_PERMISSIONS':
        editArAclRef?.current?.save()
        return
      case 'SET_BASIC_AR_FIELDS':
        setBasicArFieldsRef?.current?.save()
    }
  }

  return (
    <ConfirmationDialog
      open={open}
      onCancel={onCancel}
      onConfirm={onClickPrimary}
      confirmButtonProps={{
        children: isLastStep(step) ? 'Save' : 'Save & Continue',
        disabled: isLoading,
      }}
      maxWidth={'md'}
      title={getModalTitle(step, isEditing)}
      content={stepContent}
    />
  )
}

export default CreateAccessRequirementWizard
