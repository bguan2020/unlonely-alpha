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
    .max(100, "reason must be less than 100 characters"),
});

export const postSongSchema = object({
  title: string()
    .trim()
    .required("song is required")
    .max(100, "song must be less than 100 characters"),
  description: string()
    .trim()
    .required("your reason is required")
    .max(100, "reason must be less than 100 characters"),
});

export const postNfcSchema = object({
  title: string()
    .trim()
    .required("title is required")
    .min(5, "title must be more than 5 characters")
    .max(100, "title must be less than 50 characters"),
});

export const updateChannelTextSchema = object({
  name: string()
    .trim()
    .required("title is required")
    .min(5, "title must be more than 5 characters")
    .max(100, "title must be less than 50 characters"),
  description: string()
    .trim()
    .required("description is required")
    .max(100, "description must be less than 100 characters"),
});
