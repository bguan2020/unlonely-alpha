import { useToast } from "@chakra-ui/react";


export const CustomToast = () => {
  const toast = useToast();

  /*
usage: use render if wanting to create a custom link, use title + status + description if you just want to update the user
  */
  type Props = {
    render?: any;
    title?: string;
    status?: "error" | "info" | "warning" | "success" | undefined;
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
      duration: 9000,
    });
  };

  return { addToast };
};
