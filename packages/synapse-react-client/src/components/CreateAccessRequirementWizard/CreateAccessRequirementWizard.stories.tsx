import { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import CreateAccessRequirementWizard from './CreateAccessRequirementWizard'
import { RestrictableObjectType } from '@sage-bionetworks/synapse-types'

const meta = {
  title: 'Governance/CreateAccessRequirementWizard',
  component: CreateAccessRequirementWizard,
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
