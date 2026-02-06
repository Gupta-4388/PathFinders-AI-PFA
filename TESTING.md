# Google Authentication Testing Plan

This document outlines a comprehensive testing plan to ensure that Google authentication is functioning correctly, securely, and reliably for all users of the PathFinder AI application.

---

## 1. Test Objectives

-   Verify seamless sign-up and login for new and existing users via Google.
-   Ensure robust error handling for various authentication scenarios.
-   Confirm secure session management, including token issuance, refresh, and persistence.
-   Validate a consistent user experience across multiple devices.
-   Ensure user data is correctly associated with the Google-authenticated account.

---

## 2. Testing Scenarios

### 2.1. New User Sign-Up

**Objective:** To ensure a new user can successfully create an account using their Google credentials.

| #   | Test Step                                                                 | Expected Result                                                                                                                              |
| :-- | :------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.1 | Navigate to the application's homepage.                                   | The homepage loads with "Sign In" and "Get Started" options.                                                                                 |
| 1.2 | Click on "Get Started" or "Sign In", then select "Continue with Google".  | A Google authentication popup window appears, prompting the user to choose a Google account.                                               |
| 1.3 | Select a Google account that has never been used with the app before.     | The user is prompted by Google to grant permissions to the application.                                                                      |
| 1.4 | Grant the required permissions.                                           | The popup closes, the user is redirected to the `/dashboard`, and a "Signed In with Google" success toast notification appears.              |
| 1.5 | **Verification:** Check the Firestore `users` collection.                  | A new user document should be created with the correct `uid`, `email`, `name`, `profilePicture`, and `signUpMethod: 'google.com'`.         |
| 1.6 | **Verification:** Refresh the page.                                        | The user remains logged in and stays on the dashboard.                                                                                       |

### 2.2. Existing User Login

**Objective:** To ensure an existing user can successfully log in.

| #   | Test Step                                                                                              | Expected Result                                                                                                                                                                                                          |
| :-- | :----------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.1 | Log out of the application if currently logged in.                                                     | The user is redirected to the homepage.                                                                                                                                                                                  |
| 2.2 | Click "Sign In" and then "Continue with Google".                                                       | The Google authentication popup appears.                                                                                                                                                                                 |
| 2.3 | Select the same Google account used in the "New User Sign-Up" scenario.                                | The popup closes without asking for permissions again (unless permissions were revoked), the user is redirected to the `/dashboard`, and a "Signed In with Google" success toast notification appears. |
| 2.4 | **Verification:** Check the Firestore `users` collection.                                               | No new user document is created. The existing user's data is unchanged (unless updated from the Google profile, e.g., name change).                                                                                   |
| 2.5 | **Verification:** Check console logs and network traffic.                                               | A new Firebase Auth ID token should be issued.                                                                                                                                                                           |

### 2.3. Error Handling

**Objective:** To verify that the application gracefully handles authentication errors.

| #   | Test Scenario                                             | Test Step                                                              | Expected Result                                                                                                                                              |
| :-- | :-------------------------------------------------------- | :--------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3.1 | **Popup Closed by User**                                  | Click "Continue with Google", and close the popup window manually.     | The login flow is cancelled. The user remains on the homepage. No error message should be shown unless the closure was due to a specific Google error. |
| 3.2 | **Permissions Denied** (Requires revoking app access)     | Revoke app access from the Google Account settings, then try to log in. | An appropriate error toast notification should appear (e.g., "Authentication Failed," with a descriptive message if available from Firebase).           |
| 3.3 | **Network Error**                                         | Disable the network connection and attempt to sign in with Google.     | A relevant error toast should be displayed indicating a network issue or timeout.                                                                            |

### 2.4. Session and Token Management

**Objective:** To confirm that user sessions are managed securely and tokens are handled correctly.

| #   | Test Step                                                                                                                             | Expected Result                                                                                                                                                                                                                                                                                                                         |
| :-- | :------------------------------------------------------------------------------------------------------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 4.1 | **Session Persistence**                                                                                                               | Log in with Google, close the browser tab, and then reopen the application.                                                                                                                                                                                                                                                             |
|     |                                                                                                                                       | The user should remain logged in and be on the dashboard page.                                                                                                                                                                                                                                                                          |
| 4.2 | **Token Refresh** (Simulated)                                                                                                         | Stay logged into the application for over an hour (Firebase ID tokens expire after 1 hour). Perform an action that requires authentication (e.g., navigate to a protected page or fetch user-specific data). | The Firebase SDK should automatically refresh the ID token in the background without any user interruption. The action should complete successfully.                                                                  |
| 4.3 | **Secure Access**                                                                                                                     | While logged in, attempt to access data belonging to another user via direct API call or URL manipulation (if applicable).                                                                                                                                                                                                                   |
|     |                                                                                                                                       | The request should be denied by Firestore Security Rules, and the app should handle the "Missing or insufficient permissions" error gracefully.                                                                                                                                                                                           |
| 4.4 | **Logout**                                                                                                                            | Click the "Sign Out" button.                                                                                                                                                                                                                                                                                                            |
|     |                                                                                                                                       | The user session is terminated, local storage is cleared, a "Signed Out" toast appears, and the user is redirected to the homepage. Attempting to navigate to `/dashboard` should redirect back to the homepage. |

### 2.5. Multi-Device Access

**Objective:** To ensure a seamless experience when accessing the application from multiple devices or browsers.

| #   | Test Step                                                                                   | Expected Result                                                                                                                                    |
| :-- | :------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------- |
| 5.1 | Log in on `Device A` (e.g., a desktop browser).                                             | The user is successfully logged in.                                                                                                                |
| 5.2 | On `Device B` (e.g., a mobile browser or a different desktop browser), log in with the same Google account. | The user is successfully logged in on `Device B`. The session on `Device A` should remain active and unaffected.                                        |
| 5.3 | Perform an action on `Device A` (e.g., update settings).                                    | The change is saved to Firestore.                                                                                                                  |
| 5.4 | Refresh the page on `Device B`.                                                             | The change made on `Device A` should be reflected on `Device B` due to Firestore's real-time data synchronization.                                 |
| 5.5 | Log out from `Device A`.                                                                    | The user is logged out on `Device A` only. The session on `Device B` remains active.                                                               |

---

## 3. Account Recovery

**Note:** Password recovery for Google-based authentication is handled entirely by Google. Our application does not manage the user's Google password.

| #   | Test Scenario                             | Test Step                                                                                                 | Expected Result                                                                                                                               |
| :-- | :---------------------------------------- | :-------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------- |
| 6.1 | **Post-Google Account Recovery**          | 1. User recovers their Google account (e.g., password reset) through Google's own recovery flow. <br> 2. User then attempts to log into our application using "Continue with Google". | The user should be able to log in successfully, as our application relies on Google to verify the user's identity. The login process should be the same as for an existing user. |

This testing plan provides a solid framework for verifying the Google authentication flow. All tests should be performed in both light and dark modes to ensure UI consistency.
