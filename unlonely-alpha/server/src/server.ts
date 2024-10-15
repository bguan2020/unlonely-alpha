import "reflect-metadata";
import http from "http";

import { ApolloServer } from "apollo-server-express";
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";

import { getContext } from "./context";
import graphqlSchema from "./entities/graphqlSchema";
import { fetchForNewTempTokenEndtimestamps } from "./utils/fetchForNewTempTokenEndtimestamps";
import { setLivepeerStreamIsLive } from "./utils/setLivepeerStreamIsLive";
import { fetchForNewTokenSupplies } from "./utils/fetchForNewTokenSupplies";
import { directCastFc } from "./utils/directcastfc";
import { sendPWANotifications } from "./utils/sendPWANotifications";
import { fetchZoraMints } from "./utils/fetchZoraMints";
import { Server } from "socket.io";

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get("/", (_, res) => res.sendStatus(200));

// Define a route to handle incoming webhook data
app.post("/webhook", (req, res) => {
  const payload = req.body;
  const streamId = payload.stream.id;
  const streamStatus = payload.stream.isActive;
  setLivepeerStreamIsLive(streamId, streamStatus);
  if (streamStatus) {
    directCastFc(
      streamId,
      (title: string, slug: string) =>
        `/${slug} has started streaming!\n\n${title}\nhttps://unlonely.app/channels/${slug}`
    );
    sendPWANotifications(streamId);
  }
  res.sendStatus(200);
});

app.get("/aws-scheduler-update", (req, res) => {
  const secretKey = req.headers["x-secret-key"] || req.query.secretKey;

  if (secretKey !== process.env.AWS_ACCESS_KEY) {
    console.log(
      "Unauthorized access to /aws-scheduler-update, called at",
      new Date().toISOString()
    );
    return res.status(401).send("Unauthorized");
  }
  console.log(
    "Authorized access to /aws-scheduler-update, called at",
    new Date().toISOString()
  );
  fetchZoraMints();
  fetchForNewTempTokenEndtimestamps();
  res.send("/aws-scheduler-update success");
});

app.get("/aws-scheduler-update-2", (req, res) => {
  const secretKey = req.headers["x-secret-key"] || req.query.secretKey;

  if (secretKey !== process.env.AWS_ACCESS_KEY) {
    console.log(
      "Unauthorized access to /aws-scheduler-update-2, called at",
      new Date().toISOString()
    );
    return res.status(401).send("Unauthorized");
  }
  console.log(
    "Authorized access to /aws-scheduler-update-2, called at",
    new Date().toISOString()
  );
  fetchForNewTokenSupplies();
  res.send("/aws-scheduler-update-2 success");
});

const startServer = async () => {
  const apolloServer = new ApolloServer({
    schema: graphqlSchema,
    context: getContext,
    introspection: process.env.DEVELOPMENT ? true : false,
    // introspection: true,
  });

  await apolloServer.start();

  // Apply Apollo middleware to the Express app
  apolloServer.applyMiddleware({ app, path: "/graphql" });

  // Create an HTTP server using the Express app
  const httpServer = http.createServer(app);

  const io = new Server(httpServer, {
    cors: {
      origin: [
        "https://unlonely-alpha-git-homepage-exp-unlonely-alpha.vercel.app",
        "https://unlonely-alpha-git-staging-unlonely-alpha.vercel.app",
        "https://www.unlonely.app",
      ],
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket: any) => {
    console.log(`A user connected: ${socket.id}`);

    // Listen for "interaction" events from the client
    socket.on("interaction", (data: any) => {
      console.log("Received interaction:", data);

      // Send the message to all connected clients, including the sender
      io.emit("interaction", data);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  httpServer.listen(process.env.PORT || 4000, () => {
    console.info(`Server started on port ${process.env.PORT || 4000}`);
  });
};

startServer();
