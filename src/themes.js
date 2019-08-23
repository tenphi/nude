import { mixColors, invertColor, toKebabCase, extractColor, generalizeColor, getLuminance } from "./helpers";
import { THEME_COLOR_ATTRS_LIST } from "./attrs";

export function generateTheme(props, darkProps, parentProps) {
  const lightTheme = {
    color: generalizeColor(props.color || parentProps.color),
    backgroundColor: generalizeColor(props.backgroundColor || parentProps.backgroundColor),
    borderColor: generalizeColor(props.borderColor || parentProps.borderColor),
    specialColor: generalizeColor(props.specialColor || parentProps.specialColor),
    borderRadius: props.borderRadius || parentProps.borderRadius,
    borderWidth: props.borderWidth || parentProps.borderWidth,
    shadowColor: generalizeColor(props.shadowColor || parentProps.shadowColor),
    specialBackgroundColor: generalizeColor(props.backgroundColor),
    // Use parent shadow intensity value only if both shadow color and shadow intensity
    // are not specified in the props
    shadowIntensity: props.shadowIntensity || (!props.shadowColor && parentProps.shadowIntensity),
    focusColor: generalizeColor(props.focusColor),
    headingColor: generalizeColor(props.headingColor),
    hoverColor: generalizeColor(props.hoverColor),
  };

  let darkTheme;

  if (getLuminance(lightTheme.color) < getLuminance(lightTheme.backgroundColor)) {
    darkTheme = Object.keys(lightTheme)
    .reduce((vars, varName) => {
      if ((THEME_COLOR_ATTRS_LIST.includes(toKebabCase(varName)))
        && lightTheme[varName]
        && varName !== 'shadowColor') {
        vars[varName] = darkProps[varName] || invertColor(lightTheme[varName], 40);
      } else {
        vars[varName] = darkProps[varName] || lightTheme[varName];
      }

      return vars;
    }, {});
  } else {
    darkTheme = { ...lightTheme };
  }

  return [lightTheme, darkTheme].map(theme => {
    Object.assign(theme, {
      shadowIntensity: Number(theme.shadowIntensity
        || extractColor(theme.shadowColor)[3]),
      focusColor: theme.focusColor
        || mixColors(theme.specialColor, theme.backgroundColor),
      headingColor: theme.headingColor
        || mixColors(theme.color, theme.backgroundColor, .1),
      hoverColor: theme.hoverColor
        || mixColors(theme.backgroundColor, theme.specialColor, .1),
    });

    const shadowIntensity = Math.min(Number(theme.shadowIntensity), 1);
    theme.shadowIntensity = Math.min(shadowIntensity
      + (1 - getLuminance(theme.backgroundColor)) * (1 - shadowIntensity), 1);
    theme.specialShadowIntensity = Math.min(shadowIntensity
      + (1 - getLuminance(theme.specialColor)) * (1 - shadowIntensity), 1);
    console.log(theme.shadowIntensity, theme.specialShadowIntensity);

    return Object.keys(theme).reduce((map, propName) => {
      map[`--nu-theme-${toKebabCase(propName)}`] = theme[propName];

      return map;
    }, {});
  });
}
