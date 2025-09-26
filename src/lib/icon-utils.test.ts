
import { getIcon } from './icon-utils';
import * as Icons from 'lucide-react';

describe('getIcon', () => {
  it('should return the correct icon component when the icon name exists', () => {
    const iconName = 'Home';
    const result = getIcon(iconName);
    expect(result.displayName).toBe(iconName);
  });

  it('should return the HelpCircle icon when the icon name does not exist', () => {
    const iconName = 'NonExistentIcon';
    const result = getIcon(iconName);
    expect(result.displayName).toBe('HelpCircle');
  });

  it('should be case-sensitive', () => {
    const iconName = 'home'; // Lowercase
    const result = getIcon(iconName);
    expect(result.displayName).toBe('HelpCircle');
  });
});
