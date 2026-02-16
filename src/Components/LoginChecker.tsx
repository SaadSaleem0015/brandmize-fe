import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../Helpers/BackendRequest";
import { Loading } from "./Loading";

export interface LoginCheckerProps {
    children: ReactNode,
    allowedUser: 'logged-in' | 'not-logged-in'
}

export function LoginChecker({ children, allowedUser }: LoginCheckerProps) {
    const [allowed, setAllowed] = useState(false);
    const [loading, setLoading] = useState(true); 
    const [accessLoading,setAccessLoading] = useState(false);
    const navigate = useNavigate();
    
    // console.log("login checker");

    // useEffect(() => {
    //     const checkAccess = async () => {
    //         try {
    //             setAccessLoading(true)
    //             const response = await BackendRequest('GET', '/have_access');
    //             if (response.success && "canAccess" in response && response.canAccess) {
    //                 return true;
    //             } else {
    //                 navigate("/can-not-access");
    //             }
    //         } catch (error) {
    //             setAccessLoading(false);
    //             navigate("/login");
    //         }
    //         finally{
    //             setAccessLoading(false)
    //         }
    //     };
    //     checkAccess();
    // }, []);

    useEffect(() => {
        const checkTokenValidity = async () => {
            const token = localStorage.getItem('token');

            if (allowedUser === 'logged-in') {
                if (token) {
                    try {
                        const { data: validationData } = await api.get<{ success?: boolean }>('/validate-token');
                        if (validationData?.success) {
                            setAllowed(true);
                        } else {
                            localStorage.removeItem('token');
                            navigate("/login");
                        }
                    } catch (error) {
                        console.error("Token validation failed:", error);
                        navigate("/login");
                    }
                } else {
                    navigate("/login");
                }
            } else if (allowedUser === 'not-logged-in') {
                if (!token) {
                    setAllowed(true);
                } else {
                    navigate("/dashboard");
                }
            }
            setLoading(false);
        };

        checkTokenValidity();
    }, [allowedUser, navigate]);

    if (loading || accessLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen flex-col">
                <Loading/>
                <p className="text-lg  text-gray-600 mt-12">Checking access...</p>
            </div>
        );
    }

    if (allowed) {
        return <>{children}</>;
    }

    return null; 
}
