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

  useEffect(() => {
    // Prevent multiple calls for the same pathname
    if (hasChecked.current === location.pathname) {
      setIsLoading(false);
      return;
    }
    
    // Reset loading state when pathname changes
    setIsLoading(true);
    
    const checkAuth = async () => {
      hasChecked.current = location.pathname;
      
      try {
        await api.get("/auth/validate-token");
        
        // User is logged in
        if (allowedUser === "not-logged-in") {
          if (location.pathname !== "/") {
            navigate("/", { replace: true });
          } else {
            setIsLoading(false);
          }
        } else {
          setIsLoading(false);
        }
      } catch {
        // User is NOT logged in
        if (allowedUser === "logged-in") {
          if (location.pathname !== "/login") {
            navigate("/login", { replace: true });
          } else {
            setIsLoading(false);
          }
        } else {
          setIsLoading(false);
        }
      }
    };

    checkAuth();
  }, [allowedUser, navigate, location.pathname]);

  if (isLoading) {
    return <div>Loading...</div>; // Add your loading component
  }

  return <>{children}</>;
}