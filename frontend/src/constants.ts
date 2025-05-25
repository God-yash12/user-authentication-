
export const CAPTCHA_LENGTH = 6;

export const PASSWORD_STRENGTH_MESSAGES: { [key: string]: string } = {
  EMPTY: '',
  VERY_WEAK: 'Very Weak',
  WEAK: 'Weak',
  MEDIUM: 'Medium',
  STRONG: 'Strong',
  VERY_STRONG: 'Very Strong',
};

export const PASSWORD_STRENGTH_COLORS: { [key: string]: string } = {
  EMPTY: 'bg-gray-200',
  VERY_WEAK: 'bg-red-500',
  WEAK: 'bg-orange-500',
  MEDIUM: 'bg-yellow-500',
  STRONG: 'bg-green-500',
  VERY_STRONG: 'bg-emerald-600',
};
    