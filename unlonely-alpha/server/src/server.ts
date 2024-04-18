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
  fetchForNewTempTokenEndtimestamps();
  res.send("/aws-scheduler-update success");
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

  // force redeploy

  httpServer.listen(process.env.PORT || 4000, () => {
    console.info(`Server started on port ${process.env.PORT || 4000}`);
  });
};

startServer();
