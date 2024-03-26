export type CreateAccessRequirementWizardStep =
  | 'SET_AR_COMMON_FIELDS'
  | 'SET_ACL_PERMISSIONS'

export function getModalTitle(
  step: CreateAccessRequirementWizardStep,
  isEditing: boolean,
): string {
  switch (step) {
    case 'SET_AR_COMMON_FIELDS':
      return `${isEditing ? 'Edit' : 'Create'} Access Requirement`
    case 'SET_ACL_PERMISSIONS':
      return 'Access Requirement Permissions'
  }
}

export function isLastStep(step: CreateAccessRequirementWizardStep): boolean {
  switch (step) {
    case 'SET_ACL_PERMISSIONS':
      return true
  }
  return false
}
