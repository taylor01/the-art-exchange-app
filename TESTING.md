# Testing Guide

This project uses Vitest and React Testing Library for testing.

## Running Tests

```bash
# Watch mode (recommended for development)
npm test

# Run once (for CI)
npm run test:run

# Interactive UI
npm run test:ui

# With coverage report
npm run test:coverage
```

## Writing Tests

### Component Tests

Location: `src/components/*.test.jsx`

Example:
```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(
      <BrowserRouter>
        <MyComponent />
      </BrowserRouter>
    );
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Store Tests

Location: `src/store/*.test.js`

Example:
```jsx
import { describe, it, expect, beforeEach } from 'vitest';
import { useMyStore } from './myStore';

describe('myStore', () => {
  beforeEach(() => {
    useMyStore.setState({ /* initial state */ });
  });

  it('updates state correctly', () => {
    const { myAction } = useMyStore.getState();
    myAction('value');
    expect(useMyStore.getState().myValue).toBe('value');
  });
});
```

### Mocking

**Mock Zustand stores:**
```jsx
import { vi } from 'vitest';
import { useAuthStore } from '../store/authStore';

vi.mock('../store/authStore', () => ({
  useAuthStore: vi.fn(),
}));

// In test
useAuthStore.mockReturnValue({ user: null });
```

**Mock API calls:**
```jsx
import { vi } from 'vitest';

vi.mock('../api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));
```

## Testing Utilities

### React Testing Library

Common queries:
- `getByText(text)` - Find by text content
- `getByRole(role)` - Find by ARIA role
- `getByLabelText(label)` - Find by label
- `getByPlaceholderText(placeholder)` - Find by placeholder

User interactions:
```jsx
import userEvent from '@testing-library/user-event';

const user = userEvent.setup();
await user.click(button);
await user.type(input, 'text');
```

### Vitest Matchers

```jsx
expect(value).toBe(expected)
expect(value).toEqual(expected)
expect(value).toBeTruthy()
expect(value).toBeNull()
expect(array).toHaveLength(3)
```

### Jest-DOM Matchers

```jsx
expect(element).toBeInTheDocument()
expect(element).toHaveTextContent('text')
expect(element).toHaveAttribute('href', '/path')
expect(element).toHaveClass('className')
expect(element).toBeVisible()
expect(element).toBeDisabled()
```

## Test Organization

```
src/
├── components/
│   ├── Layout.jsx
│   ├── Layout.test.jsx
│   ├── PosterCard.jsx
│   └── PosterCard.test.jsx
├── pages/
│   ├── Home.jsx
│   ├── Home.test.jsx
│   ├── Gallery.jsx
│   └── Gallery.test.jsx
├── store/
│   ├── authStore.js
│   └── authStore.test.js
└── test/
    └── setup.js
```

## Coverage

View coverage report:
```bash
npm run test:coverage
```

Coverage is stored in `coverage/` directory (gitignored).

## CI/CD

Tests run automatically in GitHub Actions:
- On every push to main
- On every pull request
- Before building Docker images

Build will fail if tests fail.

## Best Practices

1. **Test behavior, not implementation** - Focus on what users see/do
2. **Keep tests simple** - One assertion per test when possible
3. **Use data-testid sparingly** - Prefer getByRole, getByText
4. **Mock external dependencies** - API calls, localStorage, etc.
5. **Test edge cases** - Empty states, errors, loading states
6. **Avoid testing library internals** - Test the public API

## Example Test Suite

```jsx
describe('LoginPage', () => {
  it('renders login form', () => {
    // Arrange
    render(<Login />);

    // Assert
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('submits form with credentials', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<Login />);

    // Act
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    // Assert
    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
  });
});
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [jest-dom Matchers](https://github.com/testing-library/jest-dom)
