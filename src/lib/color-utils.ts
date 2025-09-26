
'use client';

/**
 * Parses an HSL color string to an object of H, S, L values.
 * @param hslString - e.g., "241 62% 59%"
 * @returns An object like { h: 241, s: 62, l: 59 }
 */
function parseHsl(hslString: string): { h: number, s: number, l: number } {
  if (!hslString) return { h: 241, s: 62, l: 59 }; // Default blue
  const match = hslString.match(/(\d+(\.\d+)?)/g);
  if (!match || match.length < 3) return { h: 241, s: 62, l: 59 };
  const [h, s, l] = match.map(Number);
  return { h, s, l };
}

/**
 * Converts HSL color values to an RGB color object.
 */
function hslToRgb(h: number, s: number, l: number): { r: number, g: number, b: number } {
    s /= 100;
    l /= 100;
    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) =>
        l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
    return { r: 255 * f(0), g: 255 * f(8), b: 255 * f(4) };
}


/**
 * Generates a dynamic, multi-layered aurora-like style object for FABs.
 * @param baseHsl - The base color in HSL string format (e.g., "241 62% 59%").
 * @returns A style object with backgroundImage and boxShadow.
 */
export function generateAuroraStyle(baseHsl: string): React.CSSProperties {
  const { h, s, l } = parseHsl(baseHsl);

  // 1. Calculate more subtle color variations based on the base color
  const { r, g, b } = hslToRgb(h, s, l);
  const baseTransparent = `rgba(${r.toFixed(0)}, ${g.toFixed(0)}, ${b.toFixed(0)}, 0.8)`;

  // Light Analogous (less shift, e.g., from +40 to +25)
  const { r: r_la, g: g_la, b: b_la } = hslToRgb((h + 25) % 360, Math.min(100, s + 5), Math.min(100, l + 10));
  const lightAnalogous = `rgba(${r_la.toFixed(0)}, ${g_la.toFixed(0)}, ${b_la.toFixed(0)}, 0.6)`;

  // Dark Analogous (less shift, e.g., from -60 to -25)
  const { r: r_da, g: g_da, b: b_da } = hslToRgb((h - 25 + 360) % 360, s, Math.max(0, l - 10));
  const darkAnalogous = `rgba(${r_da.toFixed(0)}, ${g_da.toFixed(0)}, ${b_da.toFixed(0)}, 0.65)`;

  // Softer "Complementary" (using a triadic-like but closer hue, e.g., +90 instead of +160)
  const { r: r_c, g: g_c, b: b_c } = hslToRgb((h + 90) % 360, Math.max(0, s - 15), l);
  const complementary = `rgba(${r_c.toFixed(0)}, ${g_c.toFixed(0)}, ${b_c.toFixed(0)}, 0.5)`;

  // 2. Construct the multi-layered background image
  const backgroundImage = [
    `radial-gradient(at 15% 15%, ${complementary} 0px, transparent 50%)`,
    `radial-gradient(at 80% 25%, ${lightAnalogous} 0px, transparent 50%)`,
    `radial-gradient(at 20% 85%, ${darkAnalogous} 0px, transparent 50%)`,
    `radial-gradient(at 50% 50%, ${baseTransparent} 0px, transparent 100%)`
  ].join(', ');
  
  // 3. Construct the glow effect
  const glowColor = `rgba(${r.toFixed(0)}, ${g.toFixed(0)}, ${b.toFixed(0)}, 0.4)`;
  const boxShadow = `0px 6px 24px ${glowColor}`;

  return {
    backgroundImage,
    boxShadow,
  };
}

/**
 * Generates a complex, 8-color linear gradient for an exquisite look.
 * @param baseHsl - The base color in HSL string format.
 * @returns A style object with a complex linear-gradient backgroundImage.
 */
export function generateExquisiteLinearGradient(baseHsl: string): React.CSSProperties {
  const { h, s, l } = parseHsl(baseHsl);

  const colors: string[] = [];
  const hueStep = 360 / 16; // Smaller step for more colors in a segment of the wheel

  for (let i = 0; i < 8; i++) {
    const currentHue = (h + i * hueStep) % 360;
    // Vary saturation and lightness in a sine wave pattern for more organic feel
    const s_variation = Math.sin(i * Math.PI / 7) * 10;
    const l_variation = Math.cos(i * Math.PI / 7) * 5;
    
    const current_s = Math.max(0, Math.min(100, s + s_variation));
    const current_l = Math.max(0, Math.min(100, l + l_variation));

    const { r, g, b } = hslToRgb(currentHue, current_s, current_l);
    // Add some alpha transparency, especially at the edges
    const alpha = 0.75 + Math.sin(i * Math.PI / 7) * 0.25;
    colors.push(`rgba(${r.toFixed(0)}, ${g.toFixed(0)}, ${b.toFixed(0)}, ${alpha.toFixed(2)})`);
  }

  const backgroundImage = `linear-gradient(to right, ${colors.join(', ')})`;

  // Generate a softer, more spread-out glow
  const { r, g, b } = hslToRgb(h, s, l);
  const glowColor = `rgba(${r.toFixed(0)}, ${g.toFixed(0)}, ${b.toFixed(0)}, 0.3)`;
  const boxShadow = `0px 4px 20px ${glowColor}`;


  return {
    backgroundImage,
    boxShadow,
  };
}
