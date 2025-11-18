/**
 * Validation Rules Tests
 *
 * Comprehensive tests for form validation utilities.
 */

import {
  required,
  email,
  emailDomain,
  passwordStrength,
  getPasswordStrength,
  minLength,
  maxLength,
  pattern,
  minValue,
  maxValue,
  matchField,
  url,
  phone,
  date,
  futureDate,
  pastDate,
  fileSize,
  fileType,
  compose,
} from '../src/utils/validationRules';

describe('Validation Rules', () => {
  // ==========================================
  // Required Validator
  // ==========================================
  describe('required', () => {
    const validate = required();

    it('should return error for empty string', () => {
      expect(validate('')).toBe('This field is required');
    });

    it('should return error for null', () => {
      expect(validate(null)).toBe('This field is required');
    });

    it('should return error for undefined', () => {
      expect(validate(undefined)).toBe('This field is required');
    });

    it('should return error for whitespace-only string', () => {
      expect(validate('   ')).toBe('This field is required');
    });

    it('should return error for empty array', () => {
      expect(validate([])).toBe('This field is required');
    });

    it('should return null for valid string', () => {
      expect(validate('valid')).toBeNull();
    });

    it('should return null for non-empty array', () => {
      expect(validate(['item'])).toBeNull();
    });

    it('should use custom message', () => {
      const customValidator = required('Name is required');
      expect(customValidator('')).toBe('Name is required');
    });
  });

  // ==========================================
  // Email Validator
  // ==========================================
  describe('email', () => {
    const validate = email();

    it('should return null for empty value (optional field)', () => {
      expect(validate('')).toBeNull();
      expect(validate(null)).toBeNull();
    });

    it('should return null for valid emails', () => {
      expect(validate('user@example.com')).toBeNull();
      expect(validate('user.name@example.com')).toBeNull();
      expect(validate('user+tag@example.com')).toBeNull();
      expect(validate('user@sub.example.com')).toBeNull();
      expect(validate('user@example.co.uk')).toBeNull();
    });

    it('should return error for invalid emails', () => {
      expect(validate('invalid')).toBe('Invalid email address');
      expect(validate('user@')).toBe('Invalid email address');
      expect(validate('@example.com')).toBe('Invalid email address');
      expect(validate('user@.com')).toBe('Invalid email address');
      expect(validate('user@example')).toBe('Invalid email address');
    });

    it('should reject emails with invalid characters', () => {
      expect(validate('user name@example.com')).toBe('Invalid email address');
    });
  });

  // ==========================================
  // Email Domain Validator
  // ==========================================
  describe('emailDomain', () => {
    const validate = emailDomain('@student.laverdad.edu.ph');

    it('should return null for correct domain', () => {
      expect(validate('user@student.laverdad.edu.ph')).toBeNull();
    });

    it('should return error for incorrect domain', () => {
      expect(validate('user@example.com')).toBe('Email must be from @student.laverdad.edu.ph');
    });

    it('should return null for empty value', () => {
      expect(validate('')).toBeNull();
    });
  });

  // ==========================================
  // Password Strength Validator
  // ==========================================
  describe('passwordStrength', () => {
    const validate = passwordStrength();

    it('should return null for valid password', () => {
      expect(validate('Password1')).toBeNull();
      expect(validate('MyStr0ngPass')).toBeNull();
    });

    it('should return error for short password', () => {
      expect(validate('Pass1')).toContain('at least 8 characters');
    });

    it('should return error for missing uppercase', () => {
      expect(validate('password1')).toContain('one uppercase letter');
    });

    it('should return error for missing lowercase', () => {
      expect(validate('PASSWORD1')).toContain('one lowercase letter');
    });

    it('should return error for missing number', () => {
      expect(validate('Password')).toContain('one number');
    });

    it('should require special character when option is set', () => {
      const validateSpecial = passwordStrength({ requireSpecial: true });
      expect(validateSpecial('Password1')).toContain('one special character');
      expect(validateSpecial('Password1!')).toBeNull();
    });

    it('should return null for empty value (optional field)', () => {
      expect(validate('')).toBeNull();
    });
  });

  // ==========================================
  // Password Strength Score
  // ==========================================
  describe('getPasswordStrength', () => {
    it('should return 0 for empty password', () => {
      const result = getPasswordStrength('');
      expect(result.score).toBe(0);
      expect(result.label).toBe('None');
    });

    it('should return low score for weak password', () => {
      const result = getPasswordStrength('123');
      expect(result.score).toBeLessThan(30);
      expect(result.label).toBe('Very Weak');
    });

    it('should return medium score for fair password', () => {
      const result = getPasswordStrength('Password1');
      expect(result.score).toBeGreaterThan(40);
      expect(result.score).toBeLessThan(80);
    });

    it('should return high score for strong password', () => {
      const result = getPasswordStrength('MyStr0ng!Pass#2024');
      expect(result.score).toBeGreaterThanOrEqual(80);
      expect(['Strong', 'Very Strong']).toContain(result.label);
    });

    it('should penalize common patterns', () => {
      const result = getPasswordStrength('password123');
      expect(result.feedback).toContain('Avoid common password patterns');
    });

    it('should penalize repeated characters', () => {
      const result = getPasswordStrength('Paaa111');
      expect(result.feedback).toContain('Avoid repeated characters');
    });
  });

  // ==========================================
  // Min/Max Length Validators
  // ==========================================
  describe('minLength', () => {
    const validate = minLength(5);

    it('should return null for value meeting minimum', () => {
      expect(validate('hello')).toBeNull();
      expect(validate('hello world')).toBeNull();
    });

    it('should return error for short value', () => {
      expect(validate('hi')).toBe('Minimum 5 characters required');
    });

    it('should return null for empty value (optional)', () => {
      expect(validate('')).toBeNull();
    });
  });

  describe('maxLength', () => {
    const validate = maxLength(10);

    it('should return null for value within maximum', () => {
      expect(validate('hello')).toBeNull();
      expect(validate('0123456789')).toBeNull();
    });

    it('should return error for long value', () => {
      expect(validate('hello world!')).toBe('Maximum 10 characters allowed');
    });
  });

  // ==========================================
  // Min/Max Value Validators (Numbers)
  // ==========================================
  describe('minValue', () => {
    const validate = minValue(10);

    it('should return null for value meeting minimum', () => {
      expect(validate(10)).toBeNull();
      expect(validate(100)).toBeNull();
      expect(validate('50')).toBeNull();
    });

    it('should return error for low value', () => {
      expect(validate(5)).toBe('Minimum value is 10');
    });

    it('should return null for empty value', () => {
      expect(validate('')).toBeNull();
    });
  });

  describe('maxValue', () => {
    const validate = maxValue(100);

    it('should return null for value within maximum', () => {
      expect(validate(50)).toBeNull();
      expect(validate(100)).toBeNull();
    });

    it('should return error for high value', () => {
      expect(validate(101)).toBe('Maximum value is 100');
    });
  });

  // ==========================================
  // Pattern Validator
  // ==========================================
  describe('pattern', () => {
    const alphanumeric = pattern(/^[a-zA-Z0-9]+$/, 'Only alphanumeric characters allowed');

    it('should return null for matching pattern', () => {
      expect(alphanumeric('abc123')).toBeNull();
    });

    it('should return error for non-matching pattern', () => {
      expect(alphanumeric('abc-123')).toBe('Only alphanumeric characters allowed');
    });

    it('should return null for empty value', () => {
      expect(alphanumeric('')).toBeNull();
    });
  });

  // ==========================================
  // Match Field Validator
  // ==========================================
  describe('matchField', () => {
    const validateConfirmPassword = matchField('password', 'Passwords must match');

    it('should return null when fields match', () => {
      const result = validateConfirmPassword('secret123', { password: 'secret123' });
      expect(result).toBeNull();
    });

    it('should return error when fields do not match', () => {
      const result = validateConfirmPassword('secret123', { password: 'different' });
      expect(result).toBe('Passwords must match');
    });
  });

  // ==========================================
  // URL Validator
  // ==========================================
  describe('url', () => {
    const validate = url();

    it('should return null for valid URLs', () => {
      expect(validate('https://example.com')).toBeNull();
      expect(validate('http://localhost:3000')).toBeNull();
      expect(validate('https://sub.example.com/path?query=1')).toBeNull();
    });

    it('should return error for invalid URLs', () => {
      expect(validate('not-a-url')).toBe('Invalid URL');
      expect(validate('example.com')).toBe('Invalid URL');
    });

    it('should return null for empty value', () => {
      expect(validate('')).toBeNull();
    });
  });

  // ==========================================
  // Phone Validator
  // ==========================================
  describe('phone', () => {
    const validate = phone();

    it('should return null for valid phone numbers', () => {
      expect(validate('1234567890')).toBeNull();
      expect(validate('+1 (555) 123-4567')).toBeNull();
      expect(validate('555-123-4567')).toBeNull();
    });

    it('should return error for invalid phone numbers', () => {
      expect(validate('123')).toBe('Invalid phone number');
      expect(validate('abc')).toBe('Invalid phone number');
    });
  });

  // ==========================================
  // Date Validators
  // ==========================================
  describe('date', () => {
    const validate = date();

    it('should return null for valid dates', () => {
      expect(validate('2024-01-15')).toBeNull();
      expect(validate(new Date().toISOString())).toBeNull();
    });

    it('should return error for invalid dates', () => {
      expect(validate('not-a-date')).toBe('Invalid date');
    });
  });

  describe('futureDate', () => {
    const validate = futureDate();

    it('should return null for future dates', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      expect(validate(futureDate.toISOString())).toBeNull();
    });

    it('should return error for past dates', () => {
      expect(validate('2020-01-01')).toBe('Date must be in the future');
    });
  });

  describe('pastDate', () => {
    const validate = pastDate();

    it('should return null for past dates', () => {
      expect(validate('2020-01-01')).toBeNull();
    });

    it('should return error for future dates', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      expect(validate(futureDate.toISOString())).toBe('Date must be in the past');
    });
  });

  // ==========================================
  // File Validators
  // ==========================================
  describe('fileSize', () => {
    const validate = fileSize(5 * 1024 * 1024); // 5MB

    it('should return null for file within size limit', () => {
      const file = { size: 1024 * 1024 }; // 1MB
      expect(validate(file)).toBeNull();
    });

    it('should return error for file exceeding size limit', () => {
      const file = { size: 10 * 1024 * 1024 }; // 10MB
      expect(validate(file)).toContain('5.0MB');
    });

    it('should return null for no file', () => {
      expect(validate(null)).toBeNull();
    });
  });

  describe('fileType', () => {
    const validate = fileType(['application/pdf', '.jpg', '.png']);

    it('should return null for allowed file types', () => {
      expect(validate({ type: 'application/pdf', name: 'doc.pdf' })).toBeNull();
      expect(validate({ type: 'image/jpeg', name: 'photo.jpg' })).toBeNull();
    });

    it('should return error for disallowed file types', () => {
      const file = { type: 'text/plain', name: 'file.txt' };
      expect(validate(file)).toContain('File type must be');
    });
  });

  // ==========================================
  // Compose Validator
  // ==========================================
  describe('compose', () => {
    it('should run validators in order and return first error', async () => {
      const validator = compose(
        required(),
        minLength(5),
        maxLength(10)
      );

      expect(await validator('')).toBe('This field is required');
      expect(await validator('hi')).toBe('Minimum 5 characters required');
      expect(await validator('hello world!')).toBe('Maximum 10 characters allowed');
      expect(await validator('hello')).toBeNull();
    });
  });
});
