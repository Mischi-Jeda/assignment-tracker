// src/app/settings.tsx
// Settings have been merged into the Profile screen.
// This file redirects any direct /settings navigation to /profile.
import { Redirect } from 'expo-router';

export default function SettingsRedirect() {
  return <Redirect href="/profile" />;
}