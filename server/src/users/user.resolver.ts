import { Context } from "../server";
import validator from "validator";
import { securePassword, writeToken, verifyPassword } from "../utils/securityAlgos";

interface Credentials {
    email: string
    password: string
}

interface signInArgs {
    credentials: Credentials
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
    token: string | null
}

export const resolvers = {
    Mutation : {
        userSignup: async (_: any, {credentials, name, bio}: SignupArgs, { prisma }: Context) : Promise<UserPayload> => {
            
            const { email, password } = credentials;
            let token = null;

            const isValidEmail = validator.isEmail(email);
            const isValidPassword = validator.isLength(password, {
                min: 8
            });

            if(!isValidEmail) {
                return {
                    userErrors: [{
                        message: "Provide a valid email"
                    }],
                    token
                }
            }

            if(!isValidPassword) {
                return {
                    userErrors: [{
                        message: "Password length is too short. Must be of 8 characters"
                    }],
                    token
                }
            }

            if(!name) {
                return {
                    userErrors: [{
                        message: "Provide a valid name"
                    }],
                    token
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
                        token
                    }
            }

            const hashedPassword = await securePassword(password);

            const user = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword
                }
            });

            if (user) {
                token = await writeToken(user.id);
            }

            return {
                userErrors: [],
                token
            }
        },

        userSignin : async (_: any, { credentials } : signInArgs, { prisma }: Context) : Promise<UserPayload> => {
            
            const {email, password} = credentials;
            let token = null;

            if(!password) {
                return {
                    userErrors: [{
                        message: "Password is required"
                    }],
                    token
                }
            }

            const isValidEmail = validator.isEmail(email);

            if(!isValidEmail) {
                return {
                    userErrors: [{
                        message: "Provide a valid email"
                    }],
                    token
                }
            }

            const user = await prisma.user.findUnique({
                select: {
                    id: true,
                    password: true
                },
                where: {
                    email
                }
            });

            if (!user) {
                return {
                        userErrors: [{
                            message: "Invalid Credentials"
                        }],
                        token
                    }
            }

            const validPassword = await verifyPassword(password, user.password);

            if (!validPassword) {
                return {
                        userErrors: [{
                            message: "Invalid Credentials"
                        }],
                        token
                    }
            }

            token = await writeToken(user.id);

            return {
                userErrors: [],
                token
            }
        }
    }
}