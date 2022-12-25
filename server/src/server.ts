import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { loadFilesSync } from "@graphql-tools/load-files";

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
        listen: {port: 3000}
    });

    console.log(`Server is ready at ${url}`);
}

startServer();