import { NavLink, Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home, Menu, X } from "lucide-react";

interface MenuItem {
  title: string;
  path: string;
  icon: React.ReactNode;
}

const SidebarItem = ({
  to,
  children,
  icon,
  isCollapsed,
}: {
  to: string;
  children: React.ReactNode;
  icon: React.ReactNode;
  isCollapsed?: boolean;
}) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <NavLink
      to={to}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
        ${isActive 
          ? "bg-primary-50 text-primary-600 border-l-4 border-primary-600" 
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }
        ${isCollapsed ? "justify-center px-2.5" : ""}
      `}
      title={isCollapsed ? String(children) : undefined}
      onClick={() => {
        if (window.innerWidth < 1024) {
          document.body.classList.remove('mobile-sidebar-open');
        }
      }}
    >
      <span className={`${isActive ? "text-primary-600" : "text-gray-500 group-hover:text-gray-700"} 
        ${isCollapsed ? "text-lg" : "text-base"}`}>
        {icon}
      </span>
      {!isCollapsed && (
        <span className="font-medium text-sm whitespace-nowrap">
          {children}
        </span>
      )}
    </NavLink>
  );
};

export function Sidebar({ 
  sidebarCollapsed, 
  setSidebarCollapsed,
  mobileOpen = false,
  setMobileOpen = () => {}
}: { 
  sidebarCollapsed: boolean; 
  setSidebarCollapsed: (collapsed: boolean) => void;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}) {
  const location = useLocation();

  // Only dashboard menu item
  const menuItems: MenuItem[] = [
    {
      title: "Dashboard",
      path: "/dashboard",
      icon: <Home className="w-5 h-5" />,
    }
  ];

  // Handle body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.classList.add('mobile-sidebar-open');
    } else {
      document.body.classList.remove('mobile-sidebar-open');
    }
    
    return () => {
      document.body.classList.remove('mobile-sidebar-open');
    };
  }, [mobileOpen]);

  // Close mobile sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.querySelector('aside');
      const target = event.target as HTMLElement;
      
      const toggleButton = target.closest('[data-mobile-sidebar-toggle]');
      
      if (mobileOpen && 
          sidebar && 
          !sidebar.contains(target) && 
          !toggleButton &&
          window.innerWidth < 1024) {
        setMobileOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [mobileOpen, setMobileOpen]);

  // Close mobile sidebar when window is resized to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && mobileOpen) {
        setMobileOpen(false);
      }
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mobileOpen, setMobileOpen]);

  const renderMenuContent = () => (
    <>
      {/* Header */}
      <div className="p-6 flex items-center justify-between bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        {!sidebarCollapsed ? (
          <Link to="/dashboard" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
              <span className="text-white font-bold">OC</span>
            </div>
            <div>
              <h1 className="text-lg font-bold">Brand<span className="text-primary-200">Mize</span></h1>
              <p className="text-primary-100 text-xs">Agent Dashboard</p>
            </div>
          </Link>
        ) : (
          <Link to="/dashboard" className="flex justify-center items-center w-full">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
              <span className="text-white font-bold">OC</span>
            </div>
          </Link>
        )}
        {!sidebarCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="p-4">
      {!sidebarCollapsed && (

        <div className="px-3 pb-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Navigation
          </p>
        </div>
        )}
        
        <div className="space-y-1">
          {menuItems.map((item) => (
            <SidebarItem 
              key={item.path}
              to={item.path} 
              icon={item.icon}
              isCollapsed={sidebarCollapsed}
            >
              {item.title}
            </SidebarItem>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative h-full bg-white border-r border-gray-200 shadow-sm transition-all duration-300 z-40
          ${sidebarCollapsed ? "w-16" : "w-64"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Mobile Close Button */}
        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 z-50 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {renderMenuContent()}

        {/* Collapse/Expand Button */}
        <div className="absolute bottom-4 left-0 right-0 px-4">
          {!sidebarCollapsed ? (
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="flex items-center justify-between w-full p-3 rounded-xl bg-gray-50 hover:bg-gray-100 
                text-gray-600 hover:text-gray-900 transition-all"
            >
              <span className="text-sm font-medium">Collapse sidebar</span>
              <Menu className="transform rotate-90 w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="flex items-center justify-center w-full p-3 rounded-xl bg-gray-50 hover:bg-gray-100 
                text-gray-600 hover:text-gray-900 transition-all"
              title="Expand sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

// Mobile toggle button component
export function SidebarToggle({ 
  onClick, 
  mobileOpen 
}: { 
  onClick: () => void;
  mobileOpen: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors lg:hidden"
      aria-label={mobileOpen ? "Close menu" : "Open menu"}
    >
      {mobileOpen ? (
        <X className="w-5 h-5" />
      ) : (
        <Menu className="w-5 h-5" />
      )}
    </button>
  );
}