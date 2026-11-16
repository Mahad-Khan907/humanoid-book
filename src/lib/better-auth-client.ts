import { createAuthClient } from "better-auth/react";
import { createContext } from 'react';

export type AuthClientType = ReturnType<typeof createAuthClient>;

// Export a function to create a client instance.
export function createAuthClientInstance(baseURL: string) {
  return createAuthClient({
    baseURL,
    user: {
      additionalFields: {
        softwareBackground: { type: "string" },
        hardwareBackground: { type: "string" },
      },
    },
  });
}

// Export a context to hold the client instance.
// We'll provide the value in Root.tsx.
export const AuthContext = createContext<any>(null);
