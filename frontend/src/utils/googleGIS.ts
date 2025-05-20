// frontend/src/utils/googleGIS.ts
export function initializeGoogleIdentity(
  clientId: string,
  callback: (response: { credential: string }) => void
) {
  // @ts-expect-error: expect error
  google.accounts.id.initialize({
    client_id: clientId,
    callback,
    ux_mode: 'popup',
  });
}

export function renderGoogleButton(elementId: string) {
  // @ts-expect-error: expect error
  google.accounts.id.renderButton(
    document.getElementById(elementId)!,
    { theme: 'outline', size: 'large' }
  );
}

