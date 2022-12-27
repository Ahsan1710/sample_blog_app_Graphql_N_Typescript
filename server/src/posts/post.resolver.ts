import { Context } from "../server";
import { Post, User } from "@prisma/client";
import { readToken } from "../utils/securityAlgos";

interface Input {
    title?: string
    content?: string
}

interface PostArgs {
    input: Input
}

interface PostPayloadType {
    userErrors: {
        message: string
    }[],
    post: Post | null
}

export const resolvers = {
    Query: {
        posts: (_: any, __: any, { prisma }: Context): Promise<Post[]> => {
            return prisma.post.findMany({
                orderBy: {
                    createdAt: 'desc'
                }
            });
        }
    },
    Mutation: {
        postCreate: async (parent: any, {input}: PostArgs, { prisma, token }: Context) : Promise<PostPayloadType> => {
            const {title, content} = input;
            if (!token) {
                return {
                    userErrors: [{
                        message: "Unauthenticated. Forbidden access"
                    }],
                    post: null
                }
            }

            const access = readToken(token);

            if(!access) {
                return {
                    userErrors: [{
                        message: "Unauthenticated. Forbidden access"
                    }],
                    post: null
                }
            }


            if(!title || !content) {
                return {
                    userErrors: [{
                        message: "Title and content are required fields"
                    }],
                    post: null
                }
            }

            let post = await prisma.post.create({
                data: {
                    title,
                    content,
                    authorId: access.id
            }
            });

            return {
                userErrors: [],
                post
            }
        },
        
        postUpdate: async (_: any, { id, input}: {id: string, input: Input}, { prisma, token }: Context): Promise<PostPayloadType> => {
            
            const { title, content} = input;

            if (!token) {
                return {
                    userErrors: [{
                        message: "Unauthenticated. Forbidden access"
                    }],
                    post: null
                }
            }

            const access = readToken(token);

            if(!access) {
                return {
                    userErrors: [{
                        message: "Unauthenticated. Forbidden access"
                    }],
                    post: null
                }
            }

            if (!id || isNaN(Number(id))) {
                return {
                    userErrors: [{
                        message: "Valid ID is required for updating data"
                    }],
                    post: null
                };
            }

            if (!title && !content) {
                return {
                    userErrors: [{
                        message: "Atleast one field required to update the Record: 'Title' or 'Content'"
                    }],
                    post: null
                    
                }
            }

            const existingRecord = await prisma.post.findUnique({
                where: {
                    id: Number(id)
                }
            });

            if (!existingRecord) {
                return {
                    userErrors: [{
                        message: "Doesn't find the post. Try again witha valid post"
                    }],
                    post: null
                    
                }
            }

            if (!(existingRecord.authorId === access.id)) {
                return {
                    userErrors: [{
                        message: "Forbidden action. Unauthorized to update"
                    }],
                    post: null
                    
                }
            }

            const post = await prisma.post.update({
                data: {
                    ...input
                },
                where: {
                    id: Number(id)
                }
            });

            return {
                userErrors: [],
                post
            }
        },

        postDelete: async (_: any, { id }: {id: string}, { prisma, token }: Context): Promise<PostPayloadType> => {
           

            if (!token) {
                return {
                    userErrors: [{
                        message: "Unauthenticated. Forbidden access"
                    }],
                    post: null
                }
            }

            const access = readToken(token);

            if(!access) {
                return {
                    userErrors: [{
                        message: "Unauthenticated. Forbidden access"
                    }],
                    post: null
                }
            }
           
            if (!id || isNaN(Number(id))) {
                return {
                    userErrors: [{
                        message: "Valid ID is required for deleting data"
                    }],
                    post: null
                };
            }

            const existingRecord = await prisma.post.findUnique({
                where: {
                    id: Number(id)
                }
            });

            if (!existingRecord) {
                return {
                    userErrors: [{
                        message: "Post doesn't exist. Try again"
                    }],
                    post: null
                    
                }
            }

            if (!(existingRecord.authorId === access.id)) {
                return {
                    userErrors: [{
                        message: "Forbidden action. Unauthorized to delete"
                    }],
                    post: null
                    
                }
            }

            const post = await prisma.post.delete({
                where: {
                    id: Number(id)
                }
            });

            return {
                userErrors: [],
                post
            }
        }
    },

    Post: {
        user: ({ authorId }: Post, _: any, { prisma }: Context): Promise<User | null> => {
            return prisma.user.findUnique({
                where: {
                    id: authorId
                }
            })
        }

    }
}