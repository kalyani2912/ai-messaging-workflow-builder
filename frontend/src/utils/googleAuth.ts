// frontend/src/utils/googleAuth.ts

/**
 * Ensure gapi.auth2 is loaded & initialized, then resolve the GoogleAuth instance.
 */
export function initGoogleAuth(clientId: string): Promise<gapi.auth2.GoogleAuth> {
  return new Promise(resolve => {
    // If already initialized, just return it
    if (window.gapi?.auth2?.getAuthInstance()) {
      return resolve(window.gapi.auth2.getAuthInstance());
    }

    // Otherwise load & init
    window.gapi.load('auth2', () => {
      window.gapi.auth2
        .init({ client_id: clientId })
        .then(googleAuth => resolve(googleAuth))
        .catch(err => {
          console.error('gapi.auth2.init failed', err);
          throw err;
        });
    });
  });
}

/**
 * After sign-in, exchange the ID token with your backend.
 */
export async function onGoogleSignIn(
  googleUser: gapi.auth2.GoogleUser,
  apiBaseUrl: string
) {
  const idToken = googleUser.getAuthResponse().id_token;
  await fetch(`${apiBaseUrl}/auth/google-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ idToken }),
  });
  window.location.href = '/workflows';
}
