'use client';

import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { checkPasswordStrength } from '@/utils/passwordStrength';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
}) => {
  if (!password) return null;

  const strength = checkPasswordStrength(password);
  const allMet = strength.requirements.every((req) => req.met);

  return (
    <div className="mt-3 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        {allMet ? (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        ) : (
          <AlertCircle className="h-5 w-5 text-gray-400" />
        )}
        <h3 className="text-sm font-semibold text-gray-700">
          {allMet ? 'Mật khẩu mạnh' : 'Yêu cầu mật khẩu'}
        </h3>
      </div>

      <div className="mb-3">
        <div className="flex gap-1">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded ${
                index <= strength.score
                  ? strength.color
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      <ul className="space-y-1.5">
        {strength.requirements.map((requirement, index) => (
          <li key={index} className="flex items-center gap-2 text-sm">
            {requirement.met ? (
              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
            ) : (
              <div className="h-4 w-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
            )}
            <span
              className={
                requirement.met ? 'text-gray-700' : 'text-gray-500'
              }
            >
              {requirement.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

