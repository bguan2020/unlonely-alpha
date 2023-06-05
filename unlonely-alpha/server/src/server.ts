/* eslint-disable no-console */
import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import http from "http";
import { Server } from "socket.io";

import { getContext } from "./context";
import graphqlSchema from "./entities/graphqlSchema";

const app = express();
app.use(cors(), bodyParser.json());

app.get("/", (_, res) => res.sendStatus(200));

const startServer = async () => {
  const apolloServer = new ApolloServer({
    schema: graphqlSchema,
    context: getContext,
  });
  await apolloServer.start();
  apolloServer.applyMiddleware({ app, path: "/graphql" });

  // create http server and attach the express app
  const httpServer = http.createServer(app);

  // Create socket.io server and attach to http server
  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log('a user connected');

    socket.on('send-message', (message) => {
      // You can broadcast the message to all connected clients
      io.emit('receive-message', message);
    });

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });

  httpServer.listen(process.env.PORT || 4000, () =>
    console.info(`Server started on port ${process.env.PORT || 4000}`)
  );
};

startServer();
