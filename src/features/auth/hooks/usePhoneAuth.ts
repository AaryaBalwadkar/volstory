import { useEffect, useRef, useState } from "react";
import { router } from "expo-router";

import { auth, getIdToken } from "@/src/config/firebase";
import { signInWithGoogleApi } from "@/src/features/auth/api/auth.api";
import { useAuthStore } from "@/src/features/auth/stores/auth.store";
import {
  clearWebRecaptcha,
  confirmPhoneOtp,
  initWebRecaptcha,
  sendPhoneOtp,
} from "@/src/features/auth/utils/phone-provider";
import { showAlert } from "@/src/utils/alert";

/**
 * **Phone Authentication Orchestrator**
 *
 * Manages the multi-step flow of verifying a phone number via SMS (OTP).
 * This hook handles the interaction between the UI, the platform-specific OTP provider (Recaptcha/Native), and Firebase.
 *
 * **Key Responsibilities:**
 * 1. **Send OTP:** Triggers the SMS delivery and navigates to the input screen.
 * 2. **Verify OTP:** Confirms the code, links the phone credential to the existing Google User, and syncs with the Backend.
 * 3. **Conflict Handling:** Detects if the phone number is already linked to *another* account (`auth/credential-already-in-use`).
 *
 * @hook
 * @returns {{
 * sendOTP: (phoneNumber: string) => Promise<void>,
 * verifyOTP: (code: string) => Promise<void>,
 * loading: boolean,
 * accountConflict: boolean,
 * setAccountConflict: (value: boolean) => void
 * }} An object containing OTP methods and state for conflict resolution.
 */
export const usePhoneAuth = () => {
  const [loading, setLoading] = useState(false);

  // Tracks if the phone number is already taken by another account
  const [accountConflict, setAccountConflict] = useState(false);

  // Ref Lock: Prevents "Double Submit" race conditions synchronously
  const isSubmittingRef = useRef(false);

  // Use Store Actions for proper state/storage synchronization
  const { setVerificationId, verificationId, setSignupData, login } =
    useAuthStore();

  // Initialize Recaptcha on mount (No-op on Native)
  useEffect(() => {
    initWebRecaptcha();
    return () => clearWebRecaptcha();
  }, []);

  /**
   * Sends the OTP to the provided phone number.
   * @param {string} phoneNumber - E.164 formatted string (e.g., +15550000000)
   */
  const sendOTP = async (phoneNumber: string) => {
    setLoading(true);
    try {
      // 1. Trigger Platform-Specific Send
      const result = await sendPhoneOtp(phoneNumber);

      // Store ONLY the ID (String), not the whole object (Function)
      setVerificationId(result.verificationId);

      router.push("/(auth)/otp");
    } catch (error: unknown) {
      clearWebRecaptcha();
      const message = error instanceof Error ? error.message : "Unknown error";
      showAlert("OTP Error", message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verifies the code entered by the user.
   * @param {string} code - 6-digit SMS code
   */
  const verifyOTP = async (code: string) => {
    // 1. LOCK CHECK: Stop immediately if a request is already running.
    if (isSubmittingRef.current) return;

    // 2. ID CHECK: Only show "Session Expired" if we aren't already running.
    if (!verificationId) {
      showAlert("Session Expired", "Please retry phone verification.");
      return;
    }

    // 3. ENGAGE LOCK & STATE
    isSubmittingRef.current = true;
    setLoading(true);
    setAccountConflict(false);

    try {
      // --- (A) Link Phone Credential ---
      // We wrap this in a specific Try/Catch to handle the "Already Linked" race condition.
      try {
        await confirmPhoneOtp(verificationId, code);
      } catch (err: unknown) {
        const linkError = err as { code?: string };
        // If Firebase says "Provider Already Linked", it means a previous racing call succeeded.
        // We Treat this as SUCCESS and proceed.
        if (linkError.code !== "auth/provider-already-linked") {
          throw err; // Re-throw real errors (like invalid code)
        }
      }

      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Google session expired.");

      // --- (B) Exchange Token with Backend ---
      // We get a fresh ID token to prove we own this verified phone
      const idToken = await getIdToken(currentUser, true);

      // Note: We use the existing API endpoint to get our Backend Tokens
      const backendResponse = await signInWithGoogleApi({ idToken });

      // --- (C) Update Store Context ---
      setSignupData({
        firebaseUser: {
          uid: currentUser.uid,
          phoneNumber: currentUser.phoneNumber || undefined,
        },
      });

      // --- (D) Persistence (Via Store Action) ---
      login({
        userId: currentUser.uid,
        name: currentUser.displayName || "",
        email: currentUser.email || "",
        accessToken: backendResponse.accessToken || "",
        refreshToken: backendResponse.refreshToken,
        profileImageUrl: currentUser.photoURL,
        mobileNumber: currentUser.phoneNumber || undefined,
      });

      // --- (E) Cleanup & Navigate ---
      setVerificationId(null);
      router.replace("/(auth)/register");
    } catch (err: unknown) {
      // UNLOCK ON ERROR: So user can retry if they typed the wrong code
      isSubmittingRef.current = false;

      const error = err as { code?: string; message?: string };

      if (
        error.code === "auth/credential-already-in-use" ||
        error.code === "auth/account-exists-with-different-credential"
      ) {
        setAccountConflict(true);
      } else if (error.code === "auth/requires-recent-login") {
        showAlert("Re-auth Required", "Please sign in with Google again.");
        router.replace("/(auth)/login");
      } else if (error.code === "auth/invalid-verification-code") {
        showAlert("Incorrect Code", "The code you entered is incorrect.");
      } else {
        showAlert("Verification Failed", error.message || "Unknown Error");
      }
    } finally {
      setLoading(false);
      // NOTE: We do NOT unlock isSubmittingRef on success because we are navigating away.
    }
  };

  return { sendOTP, verifyOTP, loading, accountConflict, setAccountConflict };
};
