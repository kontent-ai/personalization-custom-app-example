import {
  createContext,
  type FC,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { type AudienceCodename, isValidAudience } from "../types/content.ts";

const STORAGE_KEY = "personalization_audience";

const getStoredAudience = (): AudienceCodename => {
  if (typeof window === "undefined") {
    return null;
  }
  const stored = localStorage.getItem(STORAGE_KEY);
  return isValidAudience(stored) ? stored : null;
};

const setStoredAudience = (audience: AudienceCodename): void => {
  if (typeof window === "undefined") {
    return;
  }
  audience === null
    ? localStorage.removeItem(STORAGE_KEY)
    : localStorage.setItem(STORAGE_KEY, audience);
};

interface AudienceContextValue {
  readonly currentAudience: AudienceCodename;
  readonly setAudience: (audience: AudienceCodename) => void;
}

const AudienceContext = createContext<AudienceContextValue | undefined>(undefined);

interface AudienceProviderProps {
  readonly children: ReactNode;
}

export const AudienceProvider: FC<AudienceProviderProps> = ({ children }) => {
  const [currentAudience, setCurrentAudience] = useState<AudienceCodename>(getStoredAudience);

  useEffect(() => {
    setCurrentAudience(getStoredAudience());
  }, []);

  const setAudience = useCallback((audience: AudienceCodename) => {
    setStoredAudience(audience);
    setCurrentAudience(audience);
  }, []);

  const contextValue = useMemo(
    () => ({ currentAudience, setAudience }),
    [currentAudience, setAudience],
  );

  return <AudienceContext.Provider value={contextValue}>{children}</AudienceContext.Provider>;
};

/**
 * Hook to access the current audience context.
 *
 * In this example, the hook returns the audience manually selected by the user
 * via the AudienceSelector component. In real projects, this would typically
 * determine the user's audience programmatically based on factors like
 * authentication status, user profile data, behavior tracking, or cookies.
 */
export const useAudience = (): AudienceContextValue => {
  const context = useContext(AudienceContext);
  if (context === undefined) {
    throw new Error("useAudience must be used within an AudienceProvider");
  }
  return context;
};
