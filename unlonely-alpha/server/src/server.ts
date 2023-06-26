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
app.use(cors());
app.use(bodyParser.json());

app.get("/", (_, res) => res.sendStatus(200));

const startServer = async () => {
  const apolloServer = new ApolloServer({
    schema: graphqlSchema,
    context: getContext,
  });

  await apolloServer.start();

  // Apply Apollo middleware to the Express app
  apolloServer.applyMiddleware({ app, path: "/graphql" });

  // Create an HTTP server using the Express app
  const httpServer = http.createServer(app);

  // force redeploy

  // Create a Socket.IO server and attach it to the HTTP server
  const io = new Server(httpServer, {
    cors: {
      origin: "*", // Replace with the actual origin of your frontend application
      methods: ["GET", "POST"],
      allowedHeaders: ["Authorization", "Content-Type"],
    },
  });

  io.on("connection", (socket) => {
    console.log("a user connected");

    socket.on("send-message", (message) => {
      // You can broadcast the message to all connected clients
      io.emit("receive-message", message);
    });

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });

  httpServer.listen(process.env.PORT || 4000, () =>
    console.info(`Server started on port ${process.env.PORT || 4000}`)
  );
};

startServer();
