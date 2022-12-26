import { Context } from "../server";
import { Post } from "@prisma/client";
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
            const post = await prisma.post.create({
                data: {
                    title,
                    content,
                    authorId: 1
            }
            });

            return {
                userErrors: [],
                post
            }
        }
    }
}