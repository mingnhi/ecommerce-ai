export interface PasswordRequirement {
  label: string;
  met: boolean;
}

export interface PasswordStrength {
  score: number;
  label: 'Rất yếu' | 'Yếu' | 'Trung bình' | 'Mạnh' | 'Rất mạnh';
  color: string;
  requirements: PasswordRequirement[];
}

export function checkPasswordStrength(password: string): PasswordStrength {
  const requirements: PasswordRequirement[] = [
    {
      label: 'Ít nhất 8 ký tự',
      met: password.length >= 8,
    },
    {
      label: 'Có chữ in hoa và chữ thường',
      met: /[a-z]/.test(password) && /[A-Z]/.test(password),
    },
    {
      label: 'Có ít nhất 1 số',
      met: /[0-9]/.test(password),
    },
    {
      label: 'Có ít nhất 1 ký tự đặc biệt (!, @, #, ...)',
      met: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    },
  ];

  const metCount = requirements.filter((req) => req.met).length;

  let score = 0;
  let label: PasswordStrength['label'] = 'Rất yếu';
  let color = 'bg-red-500';

  if (metCount === 0) {
    score = 0;
    label = 'Rất yếu';
    color = 'bg-red-500';
  } else if (metCount === 1) {
    score = 1;
    label = 'Yếu';
    color = 'bg-orange-500';
  } else if (metCount === 2) {
    score = 2;
    label = 'Trung bình';
    color = 'bg-yellow-500';
  } else if (metCount === 3) {
    score = 3;
    label = 'Mạnh';
    color = 'bg-green-500';
  } else {
    score = 4;
    label = 'Rất mạnh';
    color = 'bg-green-600';
  }

  return {
    score,
    label,
    color,
    requirements,
  };
}
