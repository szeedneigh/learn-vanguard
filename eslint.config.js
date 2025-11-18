// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [{ ignores: ['dist'] }, {
  files: ['**/*.{js,jsx}'],
  languageOptions: {
    ecmaVersion: 2020,
    globals: globals.browser,
    parserOptions: {
      ecmaVersion: 'latest',
      ecmaFeatures: { jsx: true },
      sourceType: 'module',
    },
  },
  settings: { react: { version: '18.3' } },
  plugins: {
    react,
    'react-hooks': reactHooks,
    'react-refresh': reactRefresh,
  },
  rules: {
    ...js.configs.recommended.rules,
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
    ...reactHooks.configs.recommended.rules,

    // ==================================
    // Security Rules
    // ==================================
    // Prevent security vulnerabilities with target="_blank"
    // Re-enabled with proper configuration to require rel="noopener noreferrer"
    'react/jsx-no-target-blank': ['error', {
      allowReferrer: false,
      enforceDynamicLinks: 'always',
    }],

    // Prevent usage of dangerous properties
    'react/no-danger': 'warn',
    'react/no-danger-with-children': 'error',

    // ==================================
    // Code Quality Rules
    // ==================================
    // Warn about console statements (should use logger instead)
    'no-console': ['warn', {
      allow: ['warn', 'error'] // Allow console.warn and console.error for critical issues
    }],

    // Complexity limits
    'complexity': ['warn', 15], // Max cyclomatic complexity
    'max-depth': ['warn', 4], // Max nested block depth
    'max-lines-per-function': ['warn', {
      max: 150,
      skipBlankLines: true,
      skipComments: true
    }],
    'max-params': ['warn', 4], // Max function parameters

    // Code smell detection
    'no-duplicate-imports': 'error',
    'no-unused-vars': ['warn', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_'
    }],
    'no-var': 'error', // Use let/const instead of var
    'prefer-const': 'warn', // Use const when variable is not reassigned
    'no-multiple-empty-lines': ['warn', { max: 2, maxEOF: 1 }],
    'no-trailing-spaces': 'warn',
    'eqeqeq': ['error', 'always', { null: 'ignore' }], // Require === and !==

    // ==================================
    // React Best Practices
    // ==================================
    'react/prop-types': 'warn', // Warn if prop types are missing
    'react/jsx-key': ['error', {
      checkFragmentShorthand: true,
      checkKeyMustBeforeSpread: true
    }],
    'react/jsx-no-duplicate-props': 'error',
    'react/jsx-no-undef': 'error',
    'react/no-array-index-key': 'warn', // Warn against using array index as key
    'react/no-deprecated': 'warn',
    'react/self-closing-comp': ['warn', {
      component: true,
      html: true
    }],
    'react/jsx-pascal-case': ['warn', {
      allowAllCaps: true,
      allowNamespace: true
    }],

    // React Hooks rules
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // ==================================
    // React Refresh (HMR)
    // ==================================
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
}, ...storybook.configs["flat/recommended"]];
