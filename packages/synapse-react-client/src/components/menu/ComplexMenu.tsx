import { Box } from '@mui/material'
import { DropdownMenu, DropdownMenuProps } from './DropdownMenu'
import { IconSvgButton, IconSvgButtonProps } from '../IconSvgButton'

export type ComplexMenuProps = {
  /*
   * Configuration for IconButtons. Each entry corresponds to one button.
   * See the IconButtonConfiguration type for more info.
   */
  iconButtons?: IconSvgButtonProps[]
  /*
   * Configuration for DropdownMenus. Each entry corresponds to one dropdown menu button, which
   * itself can contain multiple groups of items.
   * See the DropdownMenuProps type for more info.
   */
  dropdownMenus?: DropdownMenuProps[]
}

/**
 * The ComplexMenu component allows you to create a generic menu with
 * icon buttons and multiple dropdown menus that contain groups of items.
 */
export function ComplexMenu(props: ComplexMenuProps) {
  const { iconButtons = [], dropdownMenus = [] } = props

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      {iconButtons.map(iconButton => {
        return <IconSvgButton key={iconButton.tooltipText} {...iconButton} />
      })}
      {dropdownMenus.map((menuProps, index) => {
        return <DropdownMenu key={index} {...menuProps} />
      })}
    </Box>
  )
}
