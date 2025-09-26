
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

  // 1. Calculate color variations based on the base color
  const { r, g, b } = hslToRgb(h, s, l);
  const baseTransparent = `rgba(${r.toFixed(0)}, ${g.toFixed(0)}, ${b.toFixed(0)}, 0.8)`;

  // Light Analogous (e.g., bright pink for violet)
  const { r: r_la, g: g_la, b: b_la } = hslToRgb((h + 40) % 360, Math.min(100, s + 10), Math.min(100, l + 15));
  const lightAnalogous = `rgba(${r_la.toFixed(0)}, ${g_la.toFixed(0)}, ${b_la.toFixed(0)}, 0.6)`;

  // Dark Analogous (e.g., deep blue for violet)
  const { r: r_da, g: g_da, b: b_da } = hslToRgb((h - 60 + 360) % 360, s, Math.max(0, l - 15));
  const darkAnalogous = `rgba(${r_da.toFixed(0)}, ${g_da.toFixed(0)}, ${b_da.toFixed(0)}, 0.65)`;

  // Complementary (e.g., teal/cyan for violet)
  const { r: r_c, g: g_c, b: b_c } = hslToRgb((h + 160) % 360, Math.max(0, s - 20), l);
  const complementary = `rgba(${r_c.toFixed(0)}, ${g_c.toFixed(0)}, ${b_c.toFixed(0)}, 0.7)`;

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
