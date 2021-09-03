import "dotenv/config";
import "reflect-metadata";
import { createConnection } from "typeorm";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { UserResolver } from "./UserResolver";

(async () => {
  const app = express();

  await createConnection();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver], // 이곳에 typeDef를 넣지 않은 이유는 typeorm entity에서 type-graphql의 deocorator로 type-graphql에서 사용할 스키마를 연결시켜주었기 때문이다.
    }),
    context: ({ req, res }) => ({ req, res }), // context 인자를 통해서 resolver에서도 req, res에 접근 가능하다.
  });

  await apolloServer.start(); // apolloServer 동작을 기다린 후에 app에 미들웨어로 적용시킨다.
  apolloServer.applyMiddleware({ app });

  app.listen(4000, () => {
    console.log("express sever started");
  });
})();

// apolloServer는 express의 middleware로 동작하는 것이다.
