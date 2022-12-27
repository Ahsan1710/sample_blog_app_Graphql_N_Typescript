import { User } from "@prisma/client"
import { Context } from "../server"
import validator from "validator"

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

            const isValidEmail = validator.isEmail(email);
            const isValidPassword = validator.isLength(password, {
                min: 8
            });

            if(!isValidEmail) {
                return {
                    userErrors: [{
                        message: "Provide a valid email"
                    }],
                    user: null
                }
            }

            if(!isValidPassword) {
                return {
                    userErrors: [{
                        message: "Password length is too short. Must be of 8 characters"
                    }],
                    user: null
                }
            }

            if(!name) {
                return {
                    userErrors: [{
                        message: "Provide a valid name"
                    }],
                    user: null
                }
            }

            const emailExists = await prisma.user.findUnique({
                where: {
                    email
                }
            });

            if (emailExists) {
                return {
                        userErrors: [{
                            message: "Email already exists"
                        }],
                        user: null
                    }
            }

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