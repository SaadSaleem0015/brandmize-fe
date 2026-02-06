import { PanelContent } from "./PanelContent";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export function PanelLayout() {
    const navigate = useNavigate()

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    
    useEffect(()=>{
        const user_role = localStorage.getItem('role')
        if (user_role =='admin'){
            navigate('/admin/dashboard')
        }
    }, [navigate])
    return (
        <div className="flex h-screen"> 
            <Sidebar
                sidebarCollapsed={sidebarCollapsed} 
                setSidebarCollapsed={setSidebarCollapsed}
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen} />
            <PanelContent
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen} />
        </div>
    );
}