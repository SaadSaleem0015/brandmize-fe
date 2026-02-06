import { NavLink, Link, useLocation } from "react-router-dom";
import { ReactNode, useEffect, useState } from "react";
import { 
  Home, ChevronDown, ChevronRight, Menu, X,
  MessageCircle, Shield
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
}: {
  to: string;
  children: ReactNode;
  icon: ReactNode;
  isCollapsed?: boolean;
}) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <NavLink
      to={to}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
        ${isActive ? "bg-primary-50 text-primary-600 border-l-4 border-primary-600" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}
        ${isCollapsed ? "justify-center px-2.5" : ""}
      `}
      title={isCollapsed ? String(children) : undefined}
      onClick={() => {
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

const SidebarSection = ({
  title,
  icon,
  children,
  isExpanded,
  onToggle,
  isCollapsed,
  pathPrefix,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  isCollapsed?: boolean;
  pathPrefix?: string;
}) => {
  const location = useLocation();
  const isActive = pathPrefix && location.pathname.startsWith(pathPrefix);

  if (isCollapsed) {
    return (
      <div className="space-y-1 relative">
        <button
          onClick={onToggle}
          onMouseEnter={() => !isExpanded && onToggle()}
          onMouseLeave={() => isExpanded && onToggle()}
          className={`flex items-center justify-center w-full p-2.5 rounded-xl transition-colors
            ${isActive ? "bg-primary-50 text-primary-600" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}`}
          title={title}
        >
          {icon}
          {isExpanded && (
            <div className="absolute left-full ml-2 bg-gray-900 text-white text-sm py-1 px-3 rounded-lg shadow-lg whitespace-nowrap z-50">
              {title}
            </div>
          )}
        </button>
        {isExpanded && (
          <div 
            className="absolute left-full top-0 ml-2 bg-white shadow-xl rounded-xl py-2 min-w-48 z-40 border border-gray-200"
            onMouseEnter={() => onToggle()}
            onMouseLeave={() => onToggle()}
          >
            {children}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <button
        onClick={onToggle}
        className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl transition-colors
          ${isActive ? "bg-primary-50 text-primary-600" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}`}
      >
        <div className="flex items-center gap-3">
          <span className={`text-base ${isActive ? "text-primary-600" : "text-gray-500"}`}>{icon}</span>
          <span className="font-medium text-sm">{title}</span>
        </div>
        {isExpanded ? <ChevronDown className="text-gray-400 text-sm" /> : <ChevronRight className="text-gray-400 text-sm" />}
      </button>
      <div className={`pl-9 space-y-1 overflow-hidden transition-all duration-300 ${isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
        {children}
      </div>
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
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const location = useLocation();

  // Only dashboard option for now
  const menuItems: { [key: string]: MenuItem } = {
    dashboard: {
      title: "Dashboard",
      path: "/admin/dashboard",
      icon: <Home className="w-5 h-5" />,
    },
    // Commenting out other options for now
    /*
    inbox: {
      title: "Inbox",
      path: "/admin/inbox",
      icon: <Inbox className="w-5 h-5" />,
    },
    aiAgent: {
      title: "AI Agent",
      path: "/admin/ai-agent",
      icon: <Bot className="w-5 h-5" />,
    },
    automations: {
      title: "Automations",
      path: "/admin/automations",
      icon: <Workflow className="w-5 h-5" />,
    },
    integrations: {
      title: "Integrations",
      path: "/admin/integrations",
      icon: <Integration className="w-5 h-5" />,
    },
    analytics: {
      title: "Analytics",
      path: "/admin/analytics",
      icon: <BarChart3 className="w-5 h-5" />,
    },
    teamChat: {
      title: "Team Chat",
      path: "/admin/team-chat",
      icon: <Users className="w-5 h-5" />,
    },
    crm: {
      title: "CRM",
      path: "/admin/crm",
      icon: <FileText className="w-5 h-5" />,
    },
    settings: {
      title: "Settings",
      path: "/admin/settings",
      icon: <Settings className="w-5 h-5" />,
    },
    */
  };

  useEffect(() => {
    const newExpanded = new Set<string>();

    Object.entries(menuItems).forEach(([key, item]) => {
      if (item.subItems) {
        const isActive = item.subItems.some((subItem) => location.pathname.startsWith(subItem.path));
        if (isActive) newExpanded.add(key);
      }
    });

    setExpandedMenus(newExpanded);
  }, [location.pathname]);

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

  const toggleMenu = (menu: string) => {
    setExpandedMenus((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(menu)) {
        newSet.delete(menu);
      } else {
        newSet.add(menu);
      }
      return newSet;
    });
  };

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
      <div className="p-6 flex items-center justify-between bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        {!sidebarCollapsed ? (
          <Link to="/admin/dashboard" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Brand<span className="text-primary-200">Mize</span></h1>
              <p className="text-primary-100 text-xs">Admin Portal</p>
            </div>
          </Link>
        ) : (
          <Link to="/admin/dashboard" className="flex justify-center items-center w-full">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
          </Link>
        )}
        {!sidebarCollapsed && (
          <button
            onClick={handleSidebarToggle}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Navigation */}
      <div className="p-4 space-y-1">
        <div className="px-3 pb-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Navigation
          </p>
        </div>

        {/* Only Dashboard Option */}
        {Object.entries(menuItems).map(([key, item]) => (
          <SidebarItem 
            key={key} 
            to={item.path} 
            icon={item.icon} 
            isCollapsed={sidebarCollapsed}
            onClick={handleMobileMenuClose}
          >
            {item.title}
          </SidebarItem>
        ))}

        {/* Placeholder for future sections */}
        <div className="px-3 pt-4 pb-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Coming Soon
          </p>
        </div>
        <div className="px-3 py-2">
          <div className="text-xs text-gray-500 italic">
            More admin features will be added soon
          </div>
        </div>
      </div>

      {/* Admin Status Section */}
    
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

        {renderMenuContent()}

        {/* Collapse/Expand Button - Only show when sidebar is expanded */}
        {!sidebarCollapsed && (
          <div className="absolute bottom-4 left-0 right-0 px-4">
            <button
              onClick={handleSidebarToggle}
              className="flex items-center justify-between w-full p-3 rounded-xl bg-gray-50 hover:bg-gray-100 
                text-gray-600 hover:text-gray-900 transition-all"
            >
              <span className="text-sm font-medium">Collapse sidebar</span>
              <Menu className="transform rotate-90 w-4 h-4" />
            </button>
          </div>
        )}

        {/* Expand Button - Only show when sidebar is collapsed */}
        {sidebarCollapsed && (
          <div className="absolute bottom-4 left-0 right-0 px-3">
            <button
              onClick={handleSidebarToggle}
              className="flex items-center justify-center w-full p-3 rounded-xl bg-gray-50 hover:bg-gray-100 
                text-gray-600 hover:text-gray-900 transition-all"
              title="Expand sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        )}
      </aside>
    </>
  );
}