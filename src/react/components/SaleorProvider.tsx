import React from "react";
import { SaleorClient } from "../../core";
import { ApolloClient, ApolloProvider } from "@apollo/client";

export type SaleorContextType = {
  client: SaleorClient;
};

export const SaleorContext = React.createContext<SaleorClient | null>(null);

export const SaleorProvider: React.FC<{
  client: SaleorClient;
  apolloClient: ApolloClient<any>;
}> = ({ client, apolloClient, children }) => {
  const [context, setContext] = React.useState<SaleorClient>(client);

  React.useEffect(() => {
    setContext(client);
  }, [client]);

  if (context) {
    return (
      <SaleorContext.Provider value={context}>
        <ApolloProvider client={apolloClient}>{children}</ApolloProvider>
      </SaleorContext.Provider>
    );
  }

  return null;
};
