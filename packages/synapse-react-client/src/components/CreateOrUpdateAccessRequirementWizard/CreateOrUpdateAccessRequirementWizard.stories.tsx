import { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import CreateOrUpdateAccessRequirementWizard from './CreateOrUpdateAccessRequirementWizard'
import { RestrictableObjectType } from '@sage-bionetworks/synapse-types'
import {
  mockACTAccessRequirement,
  mockManagedACTAccessRequirement,
  mockSelfSignAccessRequirement,
  mockToUAccessRequirement,
} from '../../mocks/mockAccessRequirements'

const meta = {
  title: 'Governance/CreateOrUpdateAccessRequirementWizard',
  component: CreateOrUpdateAccessRequirementWizard,
  parameters: {
    stack: 'development',
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const CreateTeamAR: Story = {
  args: {
    open: true,
    onComplete: fn(),
    onCancel: fn(),
    subject: {
      id: '3429759',
      type: RestrictableObjectType.TEAM,
    },
  },
}

export const CreateEntityAR: Story = {
  args: {
    open: true,
    onComplete: fn(),
    onCancel: fn(),
    subject: {
      id: 'syn12714410',
      type: RestrictableObjectType.ENTITY,
    },
  },
}

export const MockManagedAR: Story = {
  args: {
    open: true,
    onComplete: fn(),
    onCancel: fn(),
    accessRequirementId: mockManagedACTAccessRequirement.id.toString(),
  },
  parameters: {
    stack: 'mock',
  },
}

export const MockSelfSignAR: Story = {
  args: {
    open: true,
    onComplete: fn(),
    onCancel: fn(),
    accessRequirementId: mockSelfSignAccessRequirement.id.toString(),
  },
  parameters: {
    stack: 'mock',
  },
}

export const MockTermsOfUseAR: Story = {
  args: {
    open: true,
    onComplete: fn(),
    onCancel: fn(),
    accessRequirementId: mockToUAccessRequirement.id.toString(),
  },
  parameters: {
    stack: 'mock',
  },
}

export const MockActAR: Story = {
  args: {
    open: true,
    onComplete: fn(),
    onCancel: fn(),
    accessRequirementId: mockACTAccessRequirement.id.toString(),
  },
  parameters: {
    stack: 'mock',
  },
}
