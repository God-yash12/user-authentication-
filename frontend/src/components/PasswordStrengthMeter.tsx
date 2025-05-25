import React from 'react';
import { PasswordStrengthLevel, type PasswordRequirement } from '../types';
import { PASSWORD_STRENGTH_MESSAGES, PASSWORD_STRENGTH_COLORS } from '../constants';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

interface PasswordStrengthMeterProps {
  level: PasswordStrengthLevel;
  suggestions?: string[];
  requirements: PasswordRequirement[];
}

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ level, suggestions, requirements }) => {
  const strengthText = PASSWORD_STRENGTH_MESSAGES[level] || '';
  const strengthColor = PASSWORD_STRENGTH_COLORS[level] || 'bg-gray-200';

  const getWidthPercentage = (level: PasswordStrengthLevel): string => {
    switch (level) {
      case PasswordStrengthLevel.EMPTY: return '0%';
      case PasswordStrengthLevel.VERY_WEAK: return '10%'; // Adjusted for more granular visual feedback
      case PasswordStrengthLevel.WEAK: return '30%';
      case PasswordStrengthLevel.MEDIUM: return '50%';
      case PasswordStrengthLevel.STRONG: return '75%';
      case PasswordStrengthLevel.VERY_STRONG: return '100%';
      default: return '0%';
    }
  };

  const allRequirementsMet = requirements.every(req => req.met);

  return (
    <div className="w-full mt-2 space-y-2">
      <div className="h-2.5 w-full bg-gray-200 rounded-full mb-1 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ease-in-out ${strengthColor}`}
          style={{ width: getWidthPercentage(level) }}
          aria-valuenow={parseInt(getWidthPercentage(level), 10)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Password strength: ${strengthText}`}
        ></div>
      </div>
      <div className="flex justify-between items-center mb-2">
        <p className={`text-xs font-medium ${level === PasswordStrengthLevel.EMPTY ? 'text-gray-500' : strengthColor.replace('bg-', 'text-')}`}>
          Strength: {strengthText}
        </p>
      </div>

      {level !== PasswordStrengthLevel.EMPTY && (
        <div className="space-y-1.5">
          {requirements.map((req) => (
            <div key={req.id} className={`flex items-center text-xs ${req.met ? 'text-green-600' : 'text-red-600'}`}>
              {req.met ? (
                <CheckCircle2 size={16} className="mr-2 flex-shrink-0" />
              ) : (
                <XCircle size={16} className="mr-2 flex-shrink-0" />
              )}
              <span>{req.text}</span>
            </div>
          ))}
        </div>
      )}

      {suggestions && suggestions.length > 0 && !allRequirementsMet && level !== PasswordStrengthLevel.EMPTY && (
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-300 rounded-md">
          <div className="flex items-start">
            <AlertTriangle size={18} className="text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
            <ul className="list-none text-xs text-yellow-700 space-y-0.5">
              {suggestions.slice(0,2).map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthMeter;