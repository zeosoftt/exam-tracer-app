# Contributing Guidelines

## Code Standards

### SOLID Principles
- **Single Responsibility**: Each class/function should have one reason to change
- **Open/Closed**: Open for extension, closed for modification
- **Liskov Substitution**: Derived classes must be substitutable for their base classes
- **Interface Segregation**: Many specific interfaces are better than one general interface
- **Dependency Inversion**: Depend on abstractions, not concretions

### Code Quality
- No magic numbers or strings - use constants
- No hard-coded values
- Code readability > brevity
- Never silently swallow errors
- All async operations must have try/catch
- Show meaningful but safe error messages to users

### Security
- Input validation on all endpoints
- Use ORM (Prisma) to prevent SQL injection
- Escape output to prevent XSS
- Use CSRF tokens
- Rate limiting on sensitive endpoints
- Never log sensitive data (passwords, tokens, API keys)

### Testing
- Write unit tests for critical business logic
- Write integration tests for auth and data operations
- Test edge cases

## Development Workflow

1. Create a feature branch
2. Write code following the guidelines
3. Write tests
4. Ensure all tests pass
5. Submit a pull request

## Commit Messages

Use clear, descriptive commit messages:
- `feat: add user registration`
- `fix: resolve password validation issue`
- `refactor: improve error handling`
- `test: add unit tests for auth`
