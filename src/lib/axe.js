/**
 * AXE ACCESSIBILITY TESTING
 * Enables automated accessibility testing in development mode
 * Reports violations to the browser console
 */

export const initAxe = async () => {
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    const React = await import('react');
    const ReactDOM = await import('react-dom');
    const axe = await import('@axe-core/react');

    axe.default(React, ReactDOM, 1000, {
      // Configure rules if needed
      rules: [
        {
          id: 'color-contrast',
          enabled: true,
        },
        {
          id: 'label',
          enabled: true,
        },
        {
          id: 'button-name',
          enabled: true,
        },
        {
          id: 'link-name',
          enabled: true,
        },
      ],
    });

    console.log('✅ Axe accessibility testing enabled');
  }
};
