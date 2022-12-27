import { User } from "@prisma/client"
import { Context } from "../server"

interface Credentials {
    email: string
    password: string
}

interface SignupArgs {
    credentials: Credentials
    name: string
    bio?: string
}

interface UserPayload {
    userErrors: {
        message: string
    }[]
    user: User | null
}

export const resolvers = {
    Mutation : {
        userSignup: async (_: any, {credentials, name, bio}: SignupArgs, { prisma }: Context) : Promise<UserPayload> => {
            const { email, password } = credentials;
            const user = await prisma.user.create({
                data: {
                    name,
                    email,
                    password
                }
            });
            return {
                userErrors: [],
                user
            }
        }
    }
}