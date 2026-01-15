/**
 * Form validation utilities for TimeLov Admin
 * Includes email, password strength, and input sanitization
 */

// Email validation
export const validateEmail = (email) => {
  if (!email) {
    return { valid: false, error: 'Email jest wymagany' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Nieprawidłowy format email' };
  }
  
  return { valid: true, error: null };
};

// Password strength validation
// Requirements: min 8 chars, 1 uppercase, 1 number, 1 special char
export const validatePassword = (password) => {
  const errors = [];
  
  if (!password) {
    return { valid: false, errors: ['Hasło jest wymagane'], strength: 0 };
  }
  
  if (password.length < 8) {
    errors.push('Minimum 8 znaków');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Minimum 1 wielka litera');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Minimum 1 cyfra');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Minimum 1 znak specjalny (!@#$%^&*)');
  }
  
  // Calculate strength (0-4)
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
  
  return {
    valid: errors.length === 0,
    errors,
    strength,
    strengthLabel: getStrengthLabel(strength)
  };
};

// Get strength label
const getStrengthLabel = (strength) => {
  switch (strength) {
    case 0: return 'Bardzo słabe';
    case 1: return 'Słabe';
    case 2: return 'Średnie';
    case 3: return 'Dobre';
    case 4: return 'Silne';
    default: return 'Nieznane';
  }
};

// Get strength color
export const getStrengthColor = (strength) => {
  switch (strength) {
    case 0: return 'bg-red-500';
    case 1: return 'bg-red-400';
    case 2: return 'bg-yellow-500';
    case 3: return 'bg-green-400';
    case 4: return 'bg-green-500';
    default: return 'bg-gray-400';
  }
};

// XSS input sanitization
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Sanitize object recursively
export const sanitizeObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return sanitizeInput(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitized[key] = sanitizeObject(value);
  }
  return sanitized;
};

// Username validation
export const validateUsername = (username) => {
  if (!username) {
    return { valid: false, error: 'Nazwa użytkownika jest wymagana' };
  }
  
  if (username.length < 3) {
    return { valid: false, error: 'Minimum 3 znaki' };
  }
  
  if (username.length > 50) {
    return { valid: false, error: 'Maksimum 50 znaków' };
  }
  
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { valid: false, error: 'Dozwolone: litery, cyfry, _ i -' };
  }
  
  return { valid: true, error: null };
};

// General required field validation
export const validateRequired = (value, fieldName = 'Pole') => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return { valid: false, error: `${fieldName} jest wymagane` };
  }
  return { valid: true, error: null };
};

// Form validation helper
export const validateForm = (fields) => {
  const errors = {};
  let isValid = true;
  
  for (const [fieldName, validation] of Object.entries(fields)) {
    if (!validation.valid) {
      errors[fieldName] = validation.error || validation.errors?.join(', ');
      isValid = false;
    }
  }
  
  return { isValid, errors };
};
