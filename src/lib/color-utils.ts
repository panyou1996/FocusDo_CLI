
'use client';

/**
 * Parses an HSL color string to an object of H, S, L values.
 * @param hslString - e.g., "241 62% 59%"
 * @returns An object like { h: 241, s: 62, l: 59 }
 */
function parseHsl(hslString: string): { h: number, s: number, l: number } {
  const [h, s, l] = hslString.match(/\d+/g)?.map(Number) || [0, 0, 0];
  return { h, s, l };
}

/**
 * Generates a dynamic, multi-color aurora-like gradient based on a base HSL color.
 * @param baseHsl - The base color in HSL string format (e.g., "241 62% 59%").
 * @returns A CSS linear-gradient string.
 */
export function generateAuroraGradient(baseHsl: string): string {
  if (!baseHsl) {
    return 'linear-gradient(135deg, #87CEFA 0%, #5D5FEF 50%, #FF758C 100%)';
  }
  const { h, s, l } = parseHsl(baseHsl);

  // Define complementary colors by shifting the hue
  const color1_h = (h + 30) % 360;
  const color2_h = (h - 30 + 360) % 360;

  // Adjust saturation and lightness for a softer, more pastel look
  const grad_s = Math.max(50, s - 10);
  const grad_l = Math.min(80, l + 15);

  const color1 = `hsl(${color1_h}, ${grad_s}%, ${grad_l}%)`;
  const color2 = `hsl(${h}, ${s}%, ${l}%)`; // Keep original as center
  const color3 = `hsl(${color2_h}, ${grad_s}%, ${grad_l}%)`;

  return `linear-gradient(135deg, ${color1} 0%, ${color2} 50%, ${color3} 100%)`;
}


/**
 * Generates a soft glow effect based on a base HSL color.
 * @param baseHsl - The base color in HSL string format (e.g., "241 62% 59%").
 * @returns A CSS box-shadow string.
 */
export function generateGlow(baseHsl: string): string {
  if (!baseHsl) {
    return '0px 6px 24px rgba(93, 95, 239, 0.4)';
  }
  const { h, s, l } = parseHsl(baseHsl);

  const glowColor = `hsla(${h}, ${s}%, ${l}%, 0.4)`;
  
  return `0px 6px 24px ${glowColor}`;
}
