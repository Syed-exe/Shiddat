'use client';

import { useState, useEffect, useCallback } from 'react';
import { ShiddatPermissions, PermissionStore } from '@/lib/playback/native/ShiddatPermissions';

export type OnboardingStep = 'idle' | 'notifications' | 'done';

export interface OnboardingState {
  /** True when onboarding modal should be visible */
  isVisible: boolean;
  /** Current step in the onboarding flow */
  step: OnboardingStep;
  /** Current persisted permission state */
  permissions: PermissionStore;
  /** Call when user taps "Continue" on the notifications step */
  requestNotifications: () => Promise<void>;
  /** Call when user taps "Skip" or "Not now" */
  skipNotifications: () => void;
}

/**
 * usePermissionOnboarding
 *
 * Runs the one-time permission setup flow:
 *   - First install: shows onboarding notification prompt
 *   - Every subsequent launch: silently reads state, returns isVisible=false
 *   - User denied previously: never shows again
 *   - App data cleared / reinstalled: treated as fresh install
 *
 * Bluetooth is NOT part of onboarding — it's feature-triggered from Connect screen.
 */
export function usePermissionOnboarding(): OnboardingState {
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState<OnboardingStep>('idle');
  const [permissions, setPermissions] = useState<PermissionStore>(
    ShiddatPermissions.getStoredState()
  );

  useEffect(() => {
    // On every mount: check if onboarding has been completed
    const state = ShiddatPermissions.getStoredState();
    setPermissions(state);

    if (state.setupCompleted) {
      // Silently sync real OS state in the background (handles Settings changes)
      ShiddatPermissions.syncFromOs().then(() => {
        setPermissions(ShiddatPermissions.getStoredState());
      });
      // No popup, no onboarding
      return;
    }

    // First install: show onboarding after a short delay
    // (let the app render first, don't block startup)
    const timer = setTimeout(() => {
      const fresh = ShiddatPermissions.getStoredState();
      if (!fresh.setupCompleted && fresh.notification === 'not_requested') {
        setStep('notifications');
        setIsVisible(true);
      } else {
        // notification was already dealt with somehow — mark done
        ShiddatPermissions.markSetupCompleted();
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const requestNotifications = useCallback(async () => {
    const result = await ShiddatPermissions.requestNotificationPermission();
    const updated = ShiddatPermissions.getStoredState();
    setPermissions(updated);
    // Onboarding complete — regardless of grant/deny
    ShiddatPermissions.markSetupCompleted();
    setStep('done');
    setIsVisible(false);
  }, []);

  const skipNotifications = useCallback(() => {
    // Record that user chose not to grant — never ask again
    const store = ShiddatPermissions.getStoredState();
    store.notification = 'denied';
    localStorage.setItem('shiddat_permission_state', JSON.stringify(store));
    ShiddatPermissions.markSetupCompleted();
    setPermissions(ShiddatPermissions.getStoredState());
    setStep('done');
    setIsVisible(false);
  }, []);

  return { isVisible, step, permissions, requestNotifications, skipNotifications };
}
