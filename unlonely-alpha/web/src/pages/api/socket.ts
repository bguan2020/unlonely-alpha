import { Server, Socket } from "socket.io";
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if ((res.socket as any).server.io) {
    res.end();
    return;
  }

  const io = new Server((res.socket as any).server);

  io.on("connection", (socket: Socket) => {
    socket.on("send-message", (message: string) => {
      // console.log("Received message:", message);
      // Do something with the message, e.g., emit it to all connected clients
      io.emit("receive-message", message);
    });

    // socket.on("disconnect", () => {});
  });

  (res.socket as any).server.io = io;

  res.end();
}
