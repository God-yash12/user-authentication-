// src/utils/passwordUtils.ts

export const PasswordStrength = {
  VERY_WEAK: 'Very Weak',
  WEAK: 'Weak',
  MEDIUM: 'Medium',
  STRONG: 'Strong',
  VERY_STRONG: 'Very Strong'
} as const;

export type PasswordStrength = typeof PasswordStrength[keyof typeof PasswordStrength];


export type PasswordStrengthResult = {
  strength: PasswordStrength;
  score: number; // 0-100
  color: string;
  feedback: string[];
};

export const checkPasswordStrength = (password: string): PasswordStrengthResult => {
  // Initialize score and feedback array
  let score = 0;
  const feedback: string[] = [];
  
  // Return defaults for empty passwords
  if (!password) {
    return {
      strength: PasswordStrength.VERY_WEAK,
      score: 0,
      color: '#ff4d4f', // Red
      feedback: ['Password is required']
    };
  }

  // Check length
  const length = password.length;
  if (length < 8) {
    feedback.push('Password should be at least 8 characters long');
  } else {
    score += Math.min(20, length * 2); // Up to 20 points for length
  }

  // Check for character types
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecialChars = /[^A-Za-z0-9]/.test(password);

  // Add points for character variety
  if (hasUppercase) score += 10;
  else feedback.push('Add uppercase letters');
  
  if (hasLowercase) score += 10;
  else feedback.push('Add lowercase letters');
  
  if (hasNumbers) score += 10;
  else feedback.push('Add numbers');
  
  if (hasSpecialChars) score += 15;
  else feedback.push('Add special characters (e.g., !@#$%)');

  // Check for character variety
  const charTypeCount = [hasUppercase, hasLowercase, hasNumbers, hasSpecialChars].filter(Boolean).length;
  score += (charTypeCount - 1) * 5; // Up to 15 points for using multiple character types

  // Check for common patterns
  const commonPatterns = [
    /^12345/,
    /password/i,
    /qwerty/i,
    /abc123/i,
    /admin/i,
    /11111/,
    /00000/
  ];

  const hasCommonPattern = commonPatterns.some(pattern => pattern.test(password));
  if (hasCommonPattern) {
    score -= 20;
    feedback.push('Avoid common patterns and sequences');
  }

  // Check for repeated characters
  const repeatedChars = /(.)\1{2,}/.test(password);
  if (repeatedChars) {
    score -= 10;
    feedback.push('Avoid repeated characters (e.g., "aaa")');
  }

  // Ensure score is within 0-100 range
  score = Math.max(0, Math.min(100, score));

  // Determine strength category and color
  let strength: PasswordStrength;
  let color: string;

  if (score < 20) {
    strength = PasswordStrength.VERY_WEAK;
    color = '#ff4d4f'; // Red
  } else if (score < 40) {
    strength = PasswordStrength.WEAK;
    color = '#faad14'; // Orange
  } else if (score < 60) {
    strength = PasswordStrength.MEDIUM;
    color = '#fadb14'; // Yellow
  } else if (score < 80) {
    strength = PasswordStrength.STRONG;
    color = '#52c41a'; // Light Green
  } else {
    strength = PasswordStrength.VERY_STRONG;
    color = '#389e0d'; // Dark Green
  }

  // If no specific feedback yet it's still not top strength, add general advice
  if (feedback.length === 0 && score < 80) {
    feedback.push('Try adding more variety and length for a stronger password');
  }

  return { strength, score, color, feedback };
};