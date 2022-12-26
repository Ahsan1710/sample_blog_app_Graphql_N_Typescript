import { Context } from "../server";
import { Post, User } from "@prisma/client";
interface PostCreateArgs {
    title: string
    content: string
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
        postCreate: async (parent: any, {title, content}: PostCreateArgs, { prisma }: Context) : Promise<PostPayloadType> => {
            
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