import { useToastOptions } from "@chakra-ui/core";
import { useToast, UseToastOptions } from "@chakra-ui/react";
import React, { ReactNode } from "react";

export const CustomToast = () => {
  const toast = useToast();

  type Props = {
    render: any;
    title?: string;
    status?: "info" | "warning" | "success" | "error" | "loading";
    description?: string;
  };
  const addToast = ({ render, title, status, description }: Props) => {
    toast({
      render: () => render,
      status: status ? status : undefined,
      title: title ? title : undefined,
      description: description ? description : undefined,
      position: "top",
      isClosable: true,
      duration: 5000,
      variant: "left-accent",
    });
  };

  return { addToast };
};
