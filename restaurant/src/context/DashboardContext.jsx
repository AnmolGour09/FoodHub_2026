
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

import { getDashboard } from "../services/dashboard.service";

const DashboardContext = createContext();

const STORAGE_KEY = "restaurantDashboard";

export const DashboardProvider = ({ children }) => {
  // Load previous dashboard data immediately
  const [dashboard, setDashboard] = useState(() => {
    try {
      const cached = sessionStorage.getItem(STORAGE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refreshDashboard = useCallback(async () => {
    try {
      setError(null);

      // Only show loading when no cached data exists
      if (!dashboard) {
        setLoading(true);
      }

      const data = await getDashboard();

      setDashboard(data);

      // Save latest successful dashboard data
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
      );

    } catch (error) {
      console.error("Dashboard Error:", error);

      setError(error.message);

    } finally {
      setLoading(false);
    }
  }, [dashboard]);

  useEffect(() => {
    refreshDashboard();
  }, []);

  return (
    <DashboardContext.Provider
      value={{
        dashboard,
        loading,
        error,
        refreshDashboard,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => useContext(DashboardContext);
