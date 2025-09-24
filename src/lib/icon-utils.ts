
import type { Icon as LucideIcon } from 'lucide-react';
import * as Icons from 'lucide-react';

/**
 * Safely retrieves a Lucide icon component by its name.
 * @param iconName The name of the icon (e.g., 'Briefcase', 'User').
 * @returns The Lucide icon component or a fallback 'HelpCircle' icon if not found.
 */
export const getIcon = (iconName: string): LucideIcon => {
  const icon = (Icons as any)[iconName];
  if (icon) {
    return icon;
  }
  // Return a fallback icon if the requested icon doesn't exist
  return Icons.HelpCircle;
};
