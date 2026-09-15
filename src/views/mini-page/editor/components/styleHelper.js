const STYLE_KEY = '_style'

export const defaultStyle = () => ({
  margin_top: 0,
  margin_right: 0,
  margin_bottom: 0,
  margin_left: 0,
  padding_top: 0,
  padding_right: 0,
  padding_bottom: 0,
  padding_left: 0,
  border_width: 0,
  border_style: 'solid',
  border_color: '#e5e5e5',
  border_radius: 0,
  background_color: ''
})

const num = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export function styleToCss(style) {
  if (!style) return {}
  const css = {
    marginTop: num(style.margin_top) + 'px',
    marginRight: num(style.margin_right) + 'px',
    marginBottom: num(style.margin_bottom) + 'px',
    marginLeft: num(style.margin_left) + 'px',
    paddingTop: num(style.padding_top) + 'px',
    paddingRight: num(style.padding_right) + 'px',
    paddingBottom: num(style.padding_bottom) + 'px',
    paddingLeft: num(style.padding_left) + 'px',
    borderRadius: num(style.border_radius) + 'px'
  }
  if (num(style.border_width) > 0) {
    css.border = `${num(style.border_width)}px ${style.border_style || 'solid'} ${style.border_color || '#e5e5e5'}`
  }
  if (style.background_color) {
    css.backgroundColor = style.background_color
  }
  return css
}

export { STYLE_KEY }
