import {
    createAuthClient
} from "better-auth/react";


const API_BASE_URL = typeof window !== "undefined" && window.location.origin.includes("localhost")
    ? "http://localhost:4000/"
    : (import.meta.env.VITE_BETTER_AUTH_URL || window.location.origin + "/");

export const authClient = createAuthClient({
    baseURL: API_BASE_URL,
})



export const {
    signIn,
    signOut,
    signUp,
    useSession
} = authClient;