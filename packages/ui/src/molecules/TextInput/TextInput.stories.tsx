import { ComponentMeta, Story } from '@storybook/react'

import TextInput, { LabelButton, TextInputProps } from './TextInput'

export default {
  title: 'Molecules/TextInput',
  component: TextInput,
  subcomponents: {
    LabelButton,
  },
  parameters: {
    layout: 'centered',
  },
} as ComponentMeta<typeof TextInput>

export const Default: Story<TextInputProps> = args => <TextInput {...args} />

Default.args = {
  type: 'text',
  leadingLabel: 'Available to stake',
  trailingLabel: '420 DOT',
  placeholder: '0 DOT',
  trailingIcon: <LabelButton>MAX</LabelButton>,
  leadingSupportingText: '$99,999.99',
  trailingSupportingText: 'Good to go',
}
