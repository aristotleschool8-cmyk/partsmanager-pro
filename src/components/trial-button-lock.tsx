'use client';

import React from 'react';
import { isTrialExpired } from '@/lib/trial-utils';
import { User as AppUser } from '@/lib/types';

interface TrialButtonLockProps {
  user: AppUser | null;
  disabled?: boolean;
  children: React.ReactElement;
  title?: string;
}

/**
 * Wrapper component to disable buttons for expired trial users
 * Shows tooltip explaining trial has expired when hovered
 */
export function TrialButtonLock({
  user,
  disabled = false,
  children,
  title,
}: TrialButtonLockProps) {
  // Check if trial has expired
  const isTrialUsed = user?.subscription === 'trial' && isTrialExpired(user);
  
  const isDisabled = disabled || isTrialUsed;
  const tooltipText = isTrialUsed
    ? 'Your free trial has expired. Upgrade to Premium to continue.'
    : title;

  return (
    <div
      className="relative inline-block"
      title={tooltipText}
    >
      {React.cloneElement(children, {
        disabled: isDisabled,
      } as any)}
      
      {isTrialUsed && (
        <div className="absolute inset-0 rounded-md bg-black/5 cursor-not-allowed flex items-center justify-center" />
      )}
    </div>
  );
}
