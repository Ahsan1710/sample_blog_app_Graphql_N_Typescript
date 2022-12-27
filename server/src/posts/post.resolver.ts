import { Context } from "../server";
import { Post, User } from "@prisma/client";

interface PostArgs {
    title?: string
    content?: string
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
        postCreate: async (parent: any, {title, content}: PostArgs, { prisma }: Context) : Promise<PostPayloadType> => {
            
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
                    authorId: 1
            }
            });

            // post = {
            //     ...post,
            //     createdAt: new Date(post.createdAt).toLocaleString()
            // }

            return {
                userErrors: [],
                post
            }
        },
        
        postUpdate: async (_: any, { id, input}: {id: string, input: PostArgs}, { prisma }: Context): Promise<PostPayloadType> => {
            const { title, content} = input;
            if (!id) {
                return {
                    userErrors: [{
                        message: "ID is required for updating data"
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
                        message: "Invalid post id. Post doesn't find. Try again"
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