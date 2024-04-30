// creation flow and send remaining funds from INACTIVE token, DO NOT USE THIS COMPONENT FOR ACTIVE TOKENS

import { ApolloError } from "@apollo/client";

export function formatApolloError(error: ApolloError) {
  let errorDetails = `Error Message: ${error.message}\n`;

  if (error.graphQLErrors) {
    error.graphQLErrors.forEach((err, index) => {
      errorDetails += `GraphQL Error #${index + 1}: ${err.message}\n`;
    });
  }

  if (error.networkError) {
    errorDetails += `Network Error: ${error.networkError.message}\n`;
  }

  if (error.extraInfo) {
    errorDetails += `Extra Info: ${JSON.stringify(error.extraInfo)}\n`;
  }

  return errorDetails;
}
