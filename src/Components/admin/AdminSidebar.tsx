import { NavLink, Link, useLocation } from "react-router-dom";
import { ReactNode, useEffect, useState } from "react";
import { 
  Home, Menu, X, Phone, Users, Settings, ChevronDown
} from "lucide-react";

interface MenuItem {
  title: string;
  path: string;
  icon: ReactNode;
  subItems?: { title: string; path: string; icon: ReactNode }[];
}

const SidebarItem = ({
  to,
  children,
  icon,
  isCollapsed,
  onClick,
}: {
  to: string;
  children: ReactNode;
  icon: ReactNode;
  isCollapsed?: boolean;
  onClick?: () => void;
}) => {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(to + '/');

  return (
    <NavLink
      to={to}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
        ${isActive ? "bg-primary-50 text-primary-600 border-l-3 border-primary-500" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}
        ${isCollapsed ? "justify-center px-2.5" : ""}
      `}
      title={isCollapsed ? String(children) : undefined}
      onClick={() => {
        if (onClick) onClick();
        if (window.innerWidth < 1024) {
          document.body.classList.remove("mobile-sidebar-open");
        }
      }}
    >
      <span
        className={`${isActive ? "text-primary-600" : "text-gray-500 group-hover:text-gray-700"} ${
          isCollapsed ? "text-lg" : "text-base"
        }`}
      >
        {icon}
      </span>
      {!isCollapsed && <span className="font-medium text-sm whitespace-nowrap overflow-hidden">{children}</span>}
    </NavLink>
  );
};

interface SidebarSectionProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  isCollapsed: boolean;
  defaultExpanded?: boolean;
}

const SidebarSection = ({ title, icon, children, isCollapsed, defaultExpanded = false }: SidebarSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (isCollapsed) {
    return (
      <div className="relative group">
        <div className="flex items-center justify-center px-3 py-2.5 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-900 cursor-pointer">
          {icon}
        </div>
        <div className="absolute left-full top-0 ml-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 min-w-[160px] invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all z-50">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-1.5">
            {title}
          </div>
          <div className="space-y-1">
            {children}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-base">{icon}</span>
          <span className="text-xs font-semibold uppercase tracking-wider">{title}</span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
      </button>
      {isExpanded && (
        <div className="ml-4 mt-1 space-y-1 border-l border-gray-200 pl-3">
          {children}
        </div>
      )}
    </div>
  );
};

export function AdminSidebar({
  sidebarCollapsed,
  setSidebarCollapsed,
  mobileOpen = false,
  setMobileOpen = () => {},
}: {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}) {
  const location = useLocation();

  const menuItems: { [key: string]: MenuItem } = {
    dashboard: {
      title: "Dashboard",
      path: "/admin/dashboard",
      icon: <Home className="w-5 h-5" />,
    },
    phoneNumbers: {
      title: "Phone Numbers",
      path: "/admin/phone-numbers",
      icon: <Phone className="w-5 h-5" />,
    },
    users: {
      title: "All Users",
      path: "/admin/users",
      icon: <Users className="w-5 h-5" />,
    },
    settings: {
      title: "Settings",
      path: "/admin/settings",
      icon: <Settings className="w-5 h-5" />,
    },
  };

  useEffect(() => {
    if (mobileOpen) {
      document.body.classList.add("mobile-sidebar-open");
    } else {
      document.body.classList.remove("mobile-sidebar-open");
    }

    return () => {
      document.body.classList.remove("mobile-sidebar-open");
    };
  }, [mobileOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.querySelector("aside");
      const target = event.target as HTMLElement;
      const toggleButton = target.closest("[data-mobile-sidebar-toggle]");

      if (mobileOpen && sidebar && !sidebar.contains(target) && !toggleButton && window.innerWidth < 1024) {
        setMobileOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [mobileOpen, setMobileOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && mobileOpen) {
        setMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mobileOpen, setMobileOpen]);

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleMobileMenuClose = () => {
    if (window.innerWidth < 1024) {
      setMobileOpen(false);
    }
  };

  const renderMenuContent = () => (
    <>
      {/* Header with Brand */}
      <div className="p-5 flex items-center justify-between bg-primary-500 text-white">
        {!sidebarCollapsed ? (
          <Link to="/admin/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
              <img src="/Logo.png" alt="BrandMize" className="w-5 h-5 object-contain" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Brand<span className="text-primary-200">Mize</span></h1>
              <p className="text-primary-100 text-xs">Admin Portal</p>
            </div>
          </Link>
        ) : (
          <Link to="/admin/dashboard" className="flex justify-center w-full">
            <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
              <img src="/Logo.png" alt="BrandMize" className="w-5 h-5 object-contain" />
            </div>
          </Link>
        )}
        {!sidebarCollapsed && (
          <button
            onClick={handleSidebarToggle}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Navigation */}
      <div className="p-3 space-y-1">
        {/* Dashboard */}
        <SidebarItem
          to={menuItems.dashboard.path}
          icon={menuItems.dashboard.icon}
          isCollapsed={sidebarCollapsed}
          onClick={handleMobileMenuClose}
        >
          {menuItems.dashboard.title}
        </SidebarItem>

        {/* Phone Numbers */}
        <SidebarItem
          to={menuItems.phoneNumbers.path}
          icon={menuItems.phoneNumbers.icon}
          isCollapsed={sidebarCollapsed}
          onClick={handleMobileMenuClose}
        >
          {menuItems.phoneNumbers.title}
        </SidebarItem>

        {/* All Users */}
        <SidebarItem
          to={menuItems.users.path}
          icon={menuItems.users.icon}
          isCollapsed={sidebarCollapsed}
          onClick={handleMobileMenuClose}
        >
          {menuItems.users.title}
        </SidebarItem>

        {/* Settings */}
        {/* <SidebarItem
          to={menuItems.settings.path}
          icon={menuItems.settings.icon}
          isCollapsed={sidebarCollapsed}
          onClick={handleMobileMenuClose}
        >
          {menuItems.settings.title}
        </SidebarItem> */}
      </div>

      {/* Bottom Section - Admin Info */}
      {!sidebarCollapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-600 text-sm font-semibold">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">Admin User</p>
              <p className="text-xs text-gray-500 truncate">admin@brandmize.com</p>
            </div>
          </div>
        </div>
      )}

      {sidebarCollapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200 bg-gray-50/50">
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-600 text-sm font-semibold">A</span>
            </div>
          </div>
        </div>
      )}
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
        className={`fixed lg:relative h-full bg-white border-r border-gray-200 shadow-sm transition-all duration-300 z-40 flex flex-col
          ${sidebarCollapsed ? "w-16" : "w-64"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        style={{ overflowY: "auto", scrollbarWidth: "thin", scrollbarColor: "#CBD5E1 transparent" }}
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

        <div className="flex-1 flex flex-col">
          {renderMenuContent()}
        </div>

        {/* Collapse/Expand Button */}
        {!sidebarCollapsed && (
          <div className="p-3 border-t border-gray-200">
            <button
              onClick={handleSidebarToggle}
              className="flex items-center justify-between w-full p-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 
                text-gray-600 hover:text-gray-900 transition-all"
            >
              <span className="text-sm font-medium">Collapse</span>
              <Menu className="w-4 h-4" />
            </button>
          </div>
        )}

        {sidebarCollapsed && (
          <div className="p-2 border-t border-gray-200">
            <button
              onClick={handleSidebarToggle}
              className="flex items-center justify-center w-full p-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 
                text-gray-600 hover:text-gray-900 transition-all"
              title="Expand sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        )}
      </aside>
    </>
  );
}