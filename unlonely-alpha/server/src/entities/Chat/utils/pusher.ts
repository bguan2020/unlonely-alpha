import Pusher from "pusher";

export const pusher = new Pusher({
  appId: "1605554",
  key: "93678cd36c050bfa28fd",
  secret: "d518dc49a7cf111044c0",
  cluster: "us3",
  useTLS: true
});