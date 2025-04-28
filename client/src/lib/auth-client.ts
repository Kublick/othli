import {
    createAuthClient
} from "better-auth/react";



export const authClient = createAuthClient({
    baseURL: "http://localhost:4000",
})



export const {
    signIn,
    signOut,
    signUp,
    useSession
} = authClient;