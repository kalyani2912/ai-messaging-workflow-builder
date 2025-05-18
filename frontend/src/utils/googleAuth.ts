// frontend/src/utils/googleAuth.ts
import { signInWithGoogle } from './userStore';

/**
 * Load & initialize the Google API client.
 */
export function initGoogleAuth(clientId: string) {
 // @ts-expect-error: gapi is injected by Google’s platform.js
  window.gapi.load('auth2', () => {
     // @ts-expect-error: gapi.auth2 is available after load()
    window.gapi.auth2.init({ client_id: clientId });
  });
}

/**
 * Called by the Google Sign-In button on success.
 */
export async function onGoogleSignIn(
  googleUser: gapi.auth2.GoogleUser,
  apiBaseUrl: string
) {
  const profile = googleUser.getBasicProfile();
  console.log('ID:', profile.getId());
  console.log('Name:', profile.getName());
  console.log('Email:', profile.getEmail());

  const idToken = googleUser.getAuthResponse().id_token;
  
  // use your userStore helper instead
  const ok = await signInWithGoogle(idToken);
  if (!ok) throw new Error('Google login failed');



  // redirect after successful login
  window.location.href = '/workflows';
}
