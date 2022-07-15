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
    .max(140, "description must be less than 140 characters"),
});
