import {
  Auth,
  ConfirmationResult,
  linkWithCredential,
  PhoneAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  UserCredential,
} from "firebase/auth";

import { auth } from "@/src/config/firebase";

// Extend the Window interface to store the global Recaptcha instance
declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier | undefined;
  }
}

/**
 * Helper to get the Auth instance casted correctly for the Web SDK.
 * This prevents TypeScript from complaining that we are passing a "Native" object
 * to functions designed for the "Web" namespace (like `signInWithPopup`).
 *
 * @returns {Auth} The Firebase Auth instance typed for the Web SDK.
 */
const getWebAuth = (): Auth => {
  return auth as unknown as Auth;
};

/**
 * **Initialize Invisible Recaptcha**
 *
 * Sets up the Firebase Recaptcha Verifier required for web-based phone authentication.
 * It attaches to a DOM element with ID `recaptcha-container` to prevent abuse.
 *
 * **Key Behavior:**
 * - **Singleton Pattern:** Checks `window.recaptchaVerifier` to avoid duplicate initializations.
 * - **Invisible Mode:** Configuration is set to `size: "invisible"` so it doesn't disrupt UI unless suspicious.
 *
 * @returns {Promise<void>} Resolves when the verifier is ready.
 */
export const initWebRecaptcha = async (): Promise<void> => {
  const webAuth = getWebAuth();
  if (!window.recaptchaVerifier) {
    try {
      // 'recaptcha-container' must exist in your index.html or root component
      window.recaptchaVerifier = new RecaptchaVerifier(
        webAuth,
        "recaptcha-container",
        {
          size: "invisible",
        },
      );
    } catch (err) {
      console.warn("Recaptcha Init Error:", err);
    }
  }
};

/**
 * **Teardown Recaptcha Instance**
 *
 * Cleans up the global Recaptcha verifier to prevent memory leaks and "verifier already exists" errors.
 * Should be called on component unmount or when the auth flow is reset.
 *
 * @returns {void}
 */
export const clearWebRecaptcha = (): void => {
  if (window.recaptchaVerifier) {
    window.recaptchaVerifier.clear();
    window.recaptchaVerifier = undefined;
  }
};

/**
 * **Send OTP (Web Implementation)**
 *
 * Triggers the SMS delivery to the specified phone number using Firebase's `signInWithPhoneNumber`.
 * Automatically initializes the Recaptcha verifier if it hasn't been started yet.
 *
 * @param {string} phoneNumber - The target phone number in E.164 format (e.g., +15555555555).
 * @returns {Promise<ConfirmationResult>} The confirmation result object (containing `verificationId`) needed for the next step.
 * @throws {Error} If Recaptcha fails to initialize or the SMS request is rejected.
 */
export const sendPhoneOtp = async (
  phoneNumber: string,
): Promise<ConfirmationResult> => {
  const webAuth = getWebAuth();
  if (!window.recaptchaVerifier) await initWebRecaptcha();

  if (!window.recaptchaVerifier) {
    throw new Error("Recaptcha failed to initialize.");
  }

  return await signInWithPhoneNumber(
    webAuth,
    phoneNumber,
    window.recaptchaVerifier,
  );
};

/**
 * **Verify OTP & Link Credential (Web Implementation)**
 *
 * Finalizes the phone authentication by verifying the user's 6-digit code.
 * It then links this new phone credential to the currently signed-in user session.
 *
 * **Key Difference:**
 * - Uses the modular `linkWithCredential` standalone function instead of the object-oriented method found in older SDKs.
 *
 * @param {string} verificationId - The unique ID returned by `sendPhoneOtp`.
 * @param {string} code - The 6-digit SMS code entered by the user.
 * @returns {Promise<UserCredential>} The updated user credential with the phone number successfully linked.
 * @throws {Error} If the user session is missing or the code is invalid.
 */
export const confirmPhoneOtp = async (
  verificationId: string,
  code: string,
): Promise<UserCredential> => {
  const webAuth = getWebAuth();

  // 1. Create Credential
  const credential = PhoneAuthProvider.credential(verificationId, code);

  // 2. Get User (Must be from the WEB typed auth)
  const user = webAuth.currentUser;

  if (!user) throw new Error("User session missing during linking.");

  // 3. Link (Web Syntax: Standalone function)
  return linkWithCredential(user, credential);
};
