import { registerCapabilities } from '@reticlehq/react';
if (import.meta.env.DEV) {
  registerCapabilities({
    testids: [
      'login-btn', 'register-btn', 'logout-btn',
      'save-profile-btn', 'upload-doc-btn', 'sign-doc-btn',
      'start-call-btn', 'join-call-btn', 'end-call-btn',
      'deposit-btn', 'withdraw-btn', 'transfer-btn',
      'enable-2fa-btn', 'disable-2fa-btn',
      'meeting-create-btn', 'meeting-accept-btn', 'meeting-reject-btn',
    ],
    signals: ['auth:login', 'auth:register', 'meeting:created', 'document:uploaded', 'payment:completed'],
    stores: [],
  });
}
