import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { loadFilesSync } from "@graphql-tools/load-files";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export interface Context {
    prisma: PrismaClient<Prisma.PrismaClientOptions, never, Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined>
}

const typeDefs = loadFilesSync('**/*', {
    extensions: ['.graphql']
});

const resolvers = loadFilesSync ('**/*', {
    extensions: ['.resolver.ts']
});

const server = new ApolloServer({
    typeDefs,
    resolvers
});

async function startServer() {
    const { url } = await startStandaloneServer(server, {
        context: async ({ req }) => ({
            prisma,
        }),
        listen: {port: 3000}
    });

    console.log(`Server is ready at ${url}`);
}

startServer();