import { Shield, Crown, User } from 'lucide-react';

export default function RoleBadge({ role, size = 'sm' }) {
  const sizeClasses = {
    xs: 'text-xs px-1.5 py-0.5',
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
  };

  const roleConfig = {
    admin: {
      label: 'Admin',
      icon: Crown,
      bgColor: 'bg-red-100',
      textColor: 'text-red-700',
      borderColor: 'border-red-200',
    },
    moderator: {
      label: 'Moderator',
      icon: Shield,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
    },
    repair_provider: {
      label: 'Repair Provider',
      icon: User,
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-200',
    },
    business: {
      label: 'Business',
      icon: User,
      bgColor: 'bg-indigo-100',
      textColor: 'text-indigo-700',
      borderColor: 'border-indigo-200',
    },
    recycler: {
      label: 'Recycler',
      icon: User,
      bgColor: 'bg-green-100',
      textColor: 'text-green-700',
      borderColor: 'border-green-200',
    },
    organization: {
      label: 'Organization',
      icon: User,
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-200',
    },
    user: {
      label: 'User',
      icon: User,
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-200',
    },
  };

  const config = roleConfig[role] || roleConfig.user;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium border ${sizeClasses[size]} ${config.bgColor} ${config.textColor} ${config.borderColor}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}
