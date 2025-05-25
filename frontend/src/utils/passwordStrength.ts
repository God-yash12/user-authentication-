import type { PasswordRequirement, PasswordStrengthResult } from '../types';
import { PasswordStrengthLevel } from '../types';

export const calculatePasswordStrength = (password: string, username: string = ""): PasswordStrengthResult => {
  const requirements: PasswordRequirement[] = [
    { id: 'length', text: 'At least 8 characters', met: false },
    { id: 'uppercase', text: 'Includes uppercase letter (A-Z)', met: false },
    { id: 'lowercase', text: 'Includes lowercase letter (a-z)', met: false },
    { id: 'number', text: 'Includes number (0-9)', met: false },
    { id: 'specialChar', text: 'Includes special character (e.g., !@#$)', met: false },
    { id: 'notUsername', text: 'Does not contain your username', met: false },
  ];
  
  if (!password) {
    return { score: 0, level: PasswordStrengthLevel.EMPTY, suggestions: [], requirements };
  }

  let score = 0;
  const suggestions: string[] = [];

  // Criteria Checks
  const lengthCriteria = password.length >= 8;
  if (lengthCriteria) {
    score++;
    const req = requirements.find(r => r.id === 'length');
    if(req) req.met = true;
  } else {
    suggestions.push("Use at least 8 characters.");
  }

  const uppercaseCriteria = /[A-Z]/.test(password);
  if (uppercaseCriteria) {
    score++;
    const req = requirements.find(r => r.id === 'uppercase');
    if(req) req.met = true;
  } else {
    suggestions.push("Include uppercase letters.");
  }

  const lowercaseCriteria = /[a-z]/.test(password);
  if (lowercaseCriteria) {
    score++;
     const req = requirements.find(r => r.id === 'lowercase');
    if(req) req.met = true;
  } else {
    suggestions.push("Include lowercase letters.");
  }

  const numberCriteria = /[0-9]/.test(password);
  if (numberCriteria) {
    score++;
    const req = requirements.find(r => r.id === 'number');
    if(req) req.met = true;
  } else {
    suggestions.push("Include numbers.");
  }

  const specialCharCriteria = /[^A-Za-z0-9]/.test(password);
  if (specialCharCriteria) {
    score++;
    const req = requirements.find(r => r.id === 'specialChar');
    if(req) req.met = true;
  } else {
    suggestions.push("Include special characters (e.g., !@#$).");
  }
  
  const usernameLower = username.toLowerCase();
  const passwordLower = password.toLowerCase();
  const notContainsUsernameCriteria = usernameLower === "" || !passwordLower.includes(usernameLower);
  if (notContainsUsernameCriteria) {
    // Only increment score if username is actually provided and check passes.
    // If username is empty, this criterion is trivially met but shouldn't boost score if other checks would already do so.
    // This specific criterion primarily acts as a malus if failed.
    if (usernameLower !== "") score++; // Give a point if it passes and username was there to check against.
    const req = requirements.find(r => r.id === 'notUsername');
    if(req) req.met = true;
  } else {
    suggestions.push("Password should not contain your username.");
    // If it contains username, penalize score heavily unless it's already very low.
    if (score > 1) score -=1;
  }


  // Adjust score for very short passwords even if they meet some criteria
  if (password.length < 6 && password.length > 0) score = Math.min(score, 1);
  if (password.length < 4 && password.length > 0) score = 0;

  let level: PasswordStrengthLevel;
  if (password.length === 0) {
    level = PasswordStrengthLevel.EMPTY;
  } else if (score <= 1) {
    level = PasswordStrengthLevel.VERY_WEAK;
  } else if (score <= 2) { // Adjusted score thresholds due to new 'notUsername' potential point
    level = PasswordStrengthLevel.WEAK;
  } else if (score <= 3) {
    level = PasswordStrengthLevel.MEDIUM;
  } else if (score <= 4) {
    level = PasswordStrengthLevel.STRONG;
  } else { // score >= 5
    level = PasswordStrengthLevel.VERY_STRONG;
  }
  
  // Special case for only one type of char, e.g. "aaaaaaaa" or "11111111"
  if (password.length >= 8 && /^(.)\1+$/.test(password)) {
    level = PasswordStrengthLevel.VERY_WEAK;
    score = 1; // Max score for repetitive chars.
    if (!suggestions.includes("Avoid using only repetitive characters.")) {
        suggestions.push("Avoid using only repetitive characters.");
    }
  }

  return { score, level, suggestions, requirements };
};