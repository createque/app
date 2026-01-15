import React from 'react';
import { validatePassword, getStrengthColor } from '../../lib/validators';

const PasswordStrength = ({ password }) => {
  const { strength, strengthLabel, errors, valid } = validatePassword(password);

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      {/* Strength bar */}
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded-full transition-colors ${
              level < strength ? getStrengthColor(strength) : 'bg-gray-700'
            }`}
          />
        ))}
      </div>
      
      {/* Strength label */}
      <p className={`text-xs ${
        strength <= 1 ? 'text-red-400' : 
        strength === 2 ? 'text-yellow-400' : 
        'text-green-400'
      }`}>
        Siła hasła: {strengthLabel}
      </p>
      
      {/* Requirements list */}
      {!valid && errors.length > 0 && (
        <ul className="text-xs text-gray-500 space-y-1">
          {errors.map((error, idx) => (
            <li key={idx} className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-gray-600" />
              {error}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PasswordStrength;
