import { object, string } from "yup";

export const postYTLinkSchema = object({
  videoLink: string()
    .trim()
    .required("link is required")
    .matches(
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/,
      "invalid youtube url."
    ),
});

export const postVideoSchema = object({
  description: string()
    .trim()
    .required("your reason is required")
    .max(100, "reason cannot go over 100 characters"),
});

export const postSongSchema = object({
  title: string()
    .trim()
    .required("song is required")
    .max(100, "song cannot go over 100 characters"),
  description: string()
    .trim()
    .required("your reason is required")
    .max(100, "reason cannot go over 100 characters"),
});

export const postNfcSchema = object({
  title: string()
    .trim()
    .required("title is required")
    .min(5, "title cannot be less than 5 characters")
    .max(50, "title cannot go over 50 characters"),
});

export const updateChannelTextSchema = object({
  name: string()
    .trim()
    .required("title is required")
    .min(5, "title cannot be less than 5 characters")
    .max(50, "title cannot go over 50 characters"),
  description: string()
    .trim()
    .required("description is required")
    .max(250, "description cannot go over 250 characters"),
});

export const postStreamInteractionTextSchema = object({
  text: string()
    .trim()
    .min(1, "text cannot be less than 1 character")
    .max(280, "text cannot go over 280 characters"),
});
