// LoginChecker.tsx - SIMPLIFIED
import { ReactNode, useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "./BackendRequest";

interface LoginCheckerProps {
  children: ReactNode;
  allowedUser: 'logged-in' | 'not-logged-in';
}

export function LoginChecker({ children, allowedUser }: LoginCheckerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const hasChecked = useRef<string | null>(null);
  const isChecking = useRef(false); // Prevent concurrent checks

  useEffect(() => {
    // Prevent multiple calls for the same pathname
    if (hasChecked.current === location.pathname) {
      setIsLoading(false);
      return;
    }
    
    // Prevent concurrent checks
    if (isChecking.current) {
      return;
    }
    
    // Reset loading state when pathname changes
    setIsLoading(true);
    
    const checkAuth = async () => {
      // Skip if already checking
      if (isChecking.current) return;
      
      isChecking.current = true;
      hasChecked.current = location.pathname;
      
      try {
        await api.get("/auth/validate-token");
        
        // User IS logged in
        if (allowedUser === "not-logged-in") {
          // Logged-in user trying to access not-logged-in page → redirect to dashboard
          navigate("/", { replace: true });
        } else {
          // Logged-in user accessing logged-in page → allow access
          setIsLoading(false);
        }
      } catch (error: any) {
        // User is NOT logged in
        if (allowedUser === "logged-in") {
          // Not logged-in user trying to access logged-in page → redirect to login
          if (location.pathname !== "/login") {
            navigate("/login", { replace: true });
          } else {
            setIsLoading(false);
          }
        } else {
          // Not logged-in user accessing not-logged-in page → allow access
          setIsLoading(false);
        }
      } finally {
        isChecking.current = false;
      }
    };

    checkAuth();
  }, [allowedUser, navigate, location.pathname]);

  if (isLoading) {
    return <div>Loading...</div>; // Add your loading component
  }

  return <>{children}</>;
}