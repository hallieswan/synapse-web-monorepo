import React, { useMemo, useRef, useState } from 'react'
import ConfirmationDialog from '../ConfirmationDialog'
import {
  SetAccessRequirementCommonFields,
  SetAccessRequirementCommonFieldsHandle,
  SetAccessRequirementCommonFieldsProps,
} from '../SetAccessRequirementCommonFields'
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

  const setArCommonFieldsRef =
    useRef<SetAccessRequirementCommonFieldsHandle>(null)

  const isEditing = 'accessRequirementId' in props

  const onSaveComplete = (
    saveSuccessful: boolean,
    step: CreateAccessRequirementWizardStep,
  ) => {
    if (saveSuccessful) {
      setStep(step)
    }
    setIsLoading(false)
  }

  const stepContent = useMemo(() => {
    switch (step) {
      case 'SET_AR_COMMON_FIELDS':
        return (
          <>
            {isEditing ? (
              <SetAccessRequirementCommonFields
                ref={setArCommonFieldsRef}
                onSaveComplete={saveSuccessful =>
                  onSaveComplete(saveSuccessful, 'SET_ACL_PERMISSIONS')
                }
                accessRequirementId={props.accessRequirementId}
              />
            ) : (
              <SetAccessRequirementCommonFields
                ref={setArCommonFieldsRef}
                onSaveComplete={saveSuccessful =>
                  onSaveComplete(saveSuccessful, 'SET_ACL_PERMISSIONS')
                }
                subject={props.subject}
              />
            )}
          </>
        )
      default:
        return <>TODO</>
    }
  }, [step, props.subject, props.accessRequirementId, isEditing])

  const onClickPrimary = () => {
    setIsLoading(true)
    if (step === 'SET_AR_COMMON_FIELDS') {
      setArCommonFieldsRef?.current?.save()
      return
    }
    return onComplete
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
