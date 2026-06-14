'use client';

import React from 'react';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

export default function RecaptchaWrapper({ children, reCaptchaKey }: { children: React.ReactNode, reCaptchaKey: string }) {
  if (!reCaptchaKey) return <>{children}</>;

  return (
    <GoogleReCaptchaProvider reCaptchaKey={reCaptchaKey}>
      {children}
    </GoogleReCaptchaProvider>
  );
}
