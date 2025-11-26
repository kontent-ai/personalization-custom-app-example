import { type CustomAppContext, observeCustomAppContext } from "@kontent-ai/custom-app-sdk";
import { createContext, type ReactNode, useContext, useEffect, useState } from "react";

const AppContext = createContext<CustomAppContext | undefined>(undefined);

interface AppContextProviderProps {
  readonly children: ReactNode;
}

/**
 * Provider component that subscribes to the custom app context once
 * and makes it available to all child components.
 *
 * Only renders children once the context is successfully loaded.
 * Handles loading and error states internally.
 */
export const AppContextProvider = (props: AppContextProviderProps) => {
  const { context, isLoading, error } = useCustomAppContext();

  if (isLoading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p>Loading custom app context...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "red" }}>
        <h2>Error loading custom app context</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!context) {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "red" }}>
        <h2>Error</h2>
        <p>Custom app context is not available</p>
      </div>
    );
  }

  return <AppContext.Provider value={context}>{props.children}</AppContext.Provider>;
};

/**
 * Hook to access the full custom app context.
 *
 * @throws Error if used outside of AppContextProvider
 * @returns The complete CustomAppContext object
 */
export const useAppContext = (): CustomAppContext => {
  const context = useContext(AppContext);

  if (context === undefined) {
    throw new Error("useAppContext must be used within AppContextProvider");
  }

  return context;
};

/**
 * Hook to access only the app configuration from the context.
 *
 * @throws Error if used outside of AppContextProvider
 * @returns The app configuration object
 */
export const useAppConfig = () => {
  const context = useAppContext();

  try {
    return JSON.parse((context.appConfig as string | null) ?? "null") as unknown;
  } catch {
    return null;
  }
};

interface UseCustomAppContextResult {
  context: CustomAppContext | null;
  isLoading: boolean;
  error: string | null;
}

const useCustomAppContext = (): UseCustomAppContextResult => {
  const [context, setContext] = useState<CustomAppContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => Promise<void>) | null = null;

    const subscribe = async () => {
      const response = await observeCustomAppContext((updatedContext) => {
        setContext(updatedContext);
        setIsLoading(false);
      });

      if (response.isError) {
        setError(`${response.code}: ${response.description}`);
        setIsLoading(false);
        return null;
      }

      setContext(response.context);
      setIsLoading(false);
      unsubscribe = response.unsubscribe;
    };

    void subscribe();

    return () => {
      if (unsubscribe !== null) {
        void unsubscribe();
      }
    };
  }, []);

  return { context, isLoading, error };
};
