export {
  // ContextMenu has no drill-down mode, so its content uses the shared
  // surface props without `submenuBehavior`.
  baseMenuSubContentPropDefs as contextMenuContentPropDefs,
  baseMenuSubContentPropDefs as contextMenuSubContentPropDefs,
  baseMenuItemPropDefs as contextMenuItemPropDefs,
  baseMenuCheckboxItemPropDefs as contextMenuCheckboxItemPropDefs,
  baseMenuRadioItemPropDefs as contextMenuRadioItemPropDefs,
} from './_internal/base-menu.props.js';
