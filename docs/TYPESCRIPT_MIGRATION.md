# TypeScript Migration Guide

## Overview

This document outlines the strategy for migrating the Learn Vanguard codebase from JavaScript to TypeScript. The migration is designed to be incremental and can be done in phases.

## Current Status

- **TypeScript**: Installed and configured
- **Config**: `tsconfig.json` and `tsconfig.node.json` created
- **Types**: Core type definitions added to `src/types/index.ts`
- **Files Migrated**: 0 (configuration only)

## Benefits of TypeScript

1. **Type Safety**: Catch errors at compile time
2. **Better IDE Support**: Autocomplete, refactoring, navigation
3. **Self-documenting Code**: Types serve as documentation
4. **Easier Refactoring**: Confident changes with type checking
5. **Better Collaboration**: Clear contracts between modules

## Migration Strategy

### Phase 1: Foundation (Completed)
- [x] Create `tsconfig.json` with strict settings
- [x] Create `tsconfig.node.json` for Vite
- [x] Add core type definitions (`src/types/index.ts`)
- [x] Configure path aliases

### Phase 2: Utilities & Constants (Week 1)
Migrate low-risk utility files first:

```bash
# Files to migrate
src/constants/index.js → src/constants/index.ts
src/utils/logger.js → src/utils/logger.ts
src/utils/errorHandler.js → src/utils/errorHandler.ts
src/utils/secureStorage.js → src/utils/secureStorage.ts
src/utils/validationRules.js → src/utils/validationRules.ts
src/lib/constants.js → src/lib/constants.ts
```

**Priority**: High - These are imported by many files

### Phase 3: API Layer (Week 2)
Migrate API and service files:

```bash
src/lib/api/client.js → src/lib/api/client.ts
src/lib/api/taskApi.js → src/lib/api/taskApi.ts
src/lib/api/userApi.js → src/lib/api/userApi.ts
src/lib/api/resourceApi.js → src/lib/api/resourceApi.ts
src/lib/api/eventApi.js → src/lib/api/eventApi.ts
src/services/authService.js → src/services/authService.ts
```

**Priority**: High - Critical for API type safety

### Phase 4: Hooks (Week 3)
Migrate React hooks:

```bash
src/hooks/useTasksQuery.js → src/hooks/useTasksQuery.ts
src/hooks/useUsersQuery.js → src/hooks/useUsersQuery.ts
src/hooks/useAuth.js → src/hooks/useAuth.ts
src/hooks/usePermission.js → src/hooks/usePermission.ts
```

**Priority**: Medium - Provides types to components

### Phase 5: Context (Week 4)
Migrate context providers:

```bash
src/context/AuthContext.jsx → src/context/AuthContext.tsx
src/context/PermissionContext.jsx → src/context/PermissionContext.tsx
```

**Priority**: Medium - Foundation for typed props

### Phase 6: Components (Weeks 5-8)
Migrate components in order of dependency:

1. **UI Components** (Week 5)
   - `src/components/ui/*.jsx`

2. **Layout Components** (Week 6)
   - `src/components/layout/*.jsx`

3. **Feature Components** (Week 7-8)
   - `src/components/modal/*.jsx`
   - `src/components/section/*.jsx`

4. **Pages** (Final)
   - `src/app/pages/*.jsx`
   - `src/app/auth/*.jsx`

## How to Migrate a File

### Step 1: Rename the file
```bash
mv src/utils/logger.js src/utils/logger.ts
```

### Step 2: Add type imports
```typescript
import type { LogLevel, LoggerConfig } from '@/types';
```

### Step 3: Add type annotations

**Functions:**
```typescript
// Before
const formatLog = (level, message, data) => { ... }

// After
const formatLog = (level: LogLevel, message: string, data?: unknown): string[] => { ... }
```

**Props (React):**
```typescript
// Before
function Button({ onClick, children, variant = 'primary' }) { ... }

// After
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
}

function Button({ onClick, children, variant = 'primary' }: ButtonProps) { ... }
```

**State:**
```typescript
// Before
const [user, setUser] = useState(null);

// After
const [user, setUser] = useState<User | null>(null);
```

### Step 4: Handle null/undefined
```typescript
// Use optional chaining
user?.email

// Use type guards
if (user) {
  return user.email;
}

// Use non-null assertion (sparingly)
user!.email
```

### Step 5: Run type check
```bash
npm run type-check
```

## Configuration Files

### tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### ESLint (add TypeScript support)
```bash
npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

### Vite (already configured)
Vite has built-in TypeScript support, no additional configuration needed.

## Common Patterns

### API Response Types
```typescript
import type { ApiResponse, User } from '@/types';

const getUser = async (id: string): Promise<ApiResponse<User>> => {
  // ...
};
```

### React Query
```typescript
import { useQuery } from '@tanstack/react-query';
import type { Task, TaskFilters } from '@/types';

const useTasks = (filters: TaskFilters) => {
  return useQuery<Task[], Error>({
    queryKey: ['tasks', filters],
    queryFn: () => fetchTasks(filters),
  });
};
```

### Event Handlers
```typescript
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  // ...
};

const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  setValue(event.target.value);
};
```

### Form Values
```typescript
interface FormData {
  email: string;
  password: string;
}

const [formData, setFormData] = useState<FormData>({
  email: '',
  password: '',
});
```

## Gradual Adoption

You can mix .js and .ts files during migration:

1. **allowJs**: TypeScript will check .js files with JSDoc comments
2. **checkJs**: Enable type checking for .js files (optional)
3. **Import .ts from .js**: Works out of the box

```javascript
// In .js file, import types from .ts
import type { User } from '@/types';

/** @type {User | null} */
let currentUser = null;
```

## Testing with TypeScript

### Jest configuration
```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

### Type-safe tests
```typescript
import { render, screen } from '@testing-library/react';
import type { User } from '@/types';

const mockUser: User = {
  id: '1',
  email: 'test@test.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'STUDENT',
};
```

## Troubleshooting

### "Cannot find module" errors
- Check path aliases in tsconfig.json
- Ensure file extension is correct (.ts/.tsx)

### "Type 'X' is not assignable to type 'Y'"
- Check for null/undefined
- Use type guards or assertions
- Verify the type definition is correct

### "Property 'X' does not exist"
- Add the property to the interface
- Use optional property syntax: `property?: Type`

### Third-party libraries
```bash
# Install type definitions
npm install --save-dev @types/react @types/react-dom @types/node
```

## Metrics

Track migration progress:

```bash
# Count remaining .js/.jsx files
find src -name "*.js" -o -name "*.jsx" | wc -l

# Count migrated .ts/.tsx files
find src -name "*.ts" -o -name "*.tsx" | wc -l
```

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Migration from JavaScript](https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html)

## Timeline Estimate

| Phase | Duration | Files |
|-------|----------|-------|
| Phase 2: Utilities | 1 week | ~10 files |
| Phase 3: API Layer | 1 week | ~15 files |
| Phase 4: Hooks | 1 week | ~15 files |
| Phase 5: Context | 3 days | ~5 files |
| Phase 6: Components | 4 weeks | ~80 files |
| **Total** | **8 weeks** | **~125 files** |

## Success Criteria

- [ ] All files migrated to TypeScript
- [ ] No `any` types (or documented exceptions)
- [ ] Type check passes with no errors
- [ ] All tests pass
- [ ] ESLint TypeScript rules enabled
- [ ] Documentation updated

## Next Steps

1. Start with Phase 2 (Utilities)
2. Run `npm run type-check` frequently
3. Fix errors as they appear
4. Update imports as files are migrated
5. Review and update type definitions as needed
