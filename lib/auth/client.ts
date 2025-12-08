"use client";

import SuperTokens from "supertokens-auth-react";
import Session from "supertokens-auth-react/recipe/session";
import EmailPassword from "supertokens-auth-react/recipe/emailpassword";

export const appInfo = {
  appName: process.env.NEXT_PUBLIC_APP_NAME || "ProjectManager",
  apiDomain: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000",
  websiteDomain: process.env.NEXT_PUBLIC_APP_DOMAIN || "http://localhost:3000",
  apiBasePath: "/api/auth",
  websiteBasePath: "/login",
};

export function initAuth() {
  if (typeof window !== "undefined") {
    SuperTokens.init({
      appInfo,
      recipeList: [
        Session.init({
          maxRetryAttemptsForSessionRefresh: 1,
          onSessionExpired: async () => {
            // Redirect to login when session expires
            window.location.href = "/login";
          },
        }),
        EmailPassword.init(),
      ],
    });
  }
}

export async function signIn(email: string, password: string) {
  try {
    const response = await EmailPassword.signIn({
      formFields: [
        { id: "email", value: email },
        { id: "password", value: password },
      ],
    });

    if (response.status === "FIELD_ERROR") {
      return { error: response.formFields[0].error };
    } else if (response.status === "WRONG_CREDENTIALS_ERROR") {
      return { error: "Invalid email or password" };
    } else {
      return { success: true };
    }
  } catch (error) {
    if (error instanceof Response && error.status >= 500) {
      return {
        error:
          "Authentication service is currently unavailable. Please try again later.",
      };
    } else {
      return { error: "Something went wrong" };
    }
  }
}

export async function signUp(email: string, password: string) {
  try {
    const response = await EmailPassword.signUp({
      formFields: [
        { id: "email", value: email },
        { id: "password", value: password },
      ],
    });

    if (response.status === "FIELD_ERROR") {
      return { error: response.formFields[0].error };
    } else {
      return { success: true };
    }
  } catch (error) {
    if (error instanceof Response && error.status >= 500) {
      return {
        error:
          "Authentication service is currently unavailable. Please try again later.",
      };
    } else {
      return { error: "Something went wrong" };
    }
  }
}

export async function signOut() {
  await Session.signOut();
  window.location.href = "/login";
}

export async function getSession() {
  return await Session.doesSessionExist();
}
