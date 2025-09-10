# 4. CODING STANDARDS

## 4.1 Documentation Standards

### JSDoc/TypeDoc Requirements
```typescript
/**
 * All public interfaces, classes, and functions MUST include comprehensive JSDoc comments.
 * This is mandatory for all developer agents to ensure code maintainability.
 */

/**
 * @description Brief description of the function's purpose
 * @param {Type} paramName - Description of the parameter
 * @returns {ReturnType} Description of what is returned
 * @throws {ErrorType} Description of when this error is thrown
 * @example
 * // Example usage of the function
 * const result = functionName(param1, param2);
 * @since 1.0.0
 * @author Developer Name
 * @see {@link RelatedFunction} for related functionality
 */
public functionName(paramName: Type): ReturnType {
  // Implementation
}

/**
 * @interface InterfaceName
 * @description Comprehensive description of the interface purpose
 * @extends {BaseInterface} If applicable
 * @since 1.0.0
 */
interface InterfaceName {
  /**
   * @description Property description
   * @type {string}
   * @readonly If applicable
   */
  propertyName: string;
}

/**
 * @class ClassName
 * @description Class purpose and responsibilities
 * @extends {BaseClass} If applicable
 * @implements {Interface} If applicable
 * @since 1.0.0
 */
class ClassName {
  /**
   * @constructor
   * @param {Type} param - Parameter description
   */
  constructor(param: Type) {}

  /**
   * @method methodName
   * @description Method purpose
   * @param {Type} param - Parameter description
   * @returns {ReturnType} Return description
   * @memberof ClassName
   */
  public methodName(param: Type): ReturnType {}
}
```

### Python Docstring Standards
```python
def function_name(param1: str, param2: int) -> dict:
    """
    Brief description of function purpose.

    Detailed description explaining the function's behavior,
    assumptions, and any important notes.

    Args:
        param1 (str): Description of param1
        param2 (int): Description of param2

    Returns:
        dict: Description of the return value

    Raises:
        ValueError: When invalid parameters are provided
        ConnectionError: When database connection fails

    Example:
        >>> result = function_name("example", 42)
        >>> print(result)
        {'status': 'success'}

    Note:
        Any additional notes or warnings

    Since: 1.0.0
    Author: Developer Name
    """
    pass

class ClassName:
    """
    Class purpose and main responsibilities.

    This class handles [specific functionality] and provides
    [key features or capabilities].

    Attributes:
        attribute1 (str): Description of attribute1
        attribute2 (int): Description of attribute2

    Since: 1.0.0
    """
    
    def __init__(self, param: str):
        """
        Initialize the ClassName instance.

        Args:
            param (str): Description of initialization parameter
        """
        pass
```

## 4.2 Code Style Guidelines

### TypeScript/JavaScript
```yaml
Naming Conventions:
  - Classes: PascalCase (UserService, PaymentProcessor)
  - Interfaces: PascalCase with 'I' prefix (IUserService)
  - Functions/Methods: camelCase (getUserById, processPayment)
  - Constants: UPPER_SNAKE_CASE (MAX_RETRY_COUNT)
  - Files: kebab-case (user-service.ts, payment-processor.ts)

Code Organization:
  - One class/interface per file
  - Group related functionality
  - Clear separation of concerns
  - Maximum file length: 300 lines

Comments:
  - JSDoc for all public APIs (MANDATORY)
  - Inline comments for complex logic
  - TODO comments with ticket references
  - No commented-out code in production
```

### Error Handling
```typescript
// Always use custom error classes
class PaymentError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'PaymentError';
  }
}

// Always handle errors explicitly
try {
  const result = await riskyOperation();
} catch (error) {
  if (error instanceof PaymentError) {
    // Handle specific error
    logger.error('Payment failed', { error, context });
    throw error;
  }
  // Handle unexpected errors
  logger.error('Unexpected error', { error });
  throw new InternalServerError('Operation failed');
}
```

## 4.3 Testing Standards
```yaml
Coverage Requirements:
  - Unit tests: 90% coverage minimum
  - Integration tests: Critical paths covered
  - E2E tests: User journeys covered

Test Structure:
  - Arrange: Set up test data
  - Act: Execute the function
  - Assert: Verify the result

Test Naming:
  - describe('ComponentName')
  - it('should [expected behavior] when [condition]')
```

## 4.4 Security Standards
```yaml
Authentication:
  - JWT with RS256 signing
  - Token rotation every 15 minutes
  - Refresh tokens in secure cookies

Data Protection:
  - Encrypt PII at rest
  - Use parameterized queries
  - Validate all inputs
  - Sanitize all outputs

Secrets Management:
  - Never commit secrets
  - Use environment variables
  - Rotate keys regularly
  - Use secret management tools
```

---
