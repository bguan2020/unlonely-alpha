import { useToastOptions } from "@chakra-ui/core";
import { useToast, UseToastOptions } from "@chakra-ui/react";
import React, { ReactNode } from "react";

export const CustomToast = () => {
  const toast = useToast();

  /*
usage: use render if wanting to create a custom link, use title + status + description if you just want to update the user
  */
  type Props = {
    render?: any;
    title?: string;
    status?: "error" | "info" | "warning" | "success" | "loading" | undefined;
    description?: string;
  };
  const addToast = ({ render, title, status, description }: Props) => {
    toast({
      render: render ? () => render : undefined,
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
