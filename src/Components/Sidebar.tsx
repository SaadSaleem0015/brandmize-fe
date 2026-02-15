import { NavLink, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { 
  Home, Menu, X, Building2, Bot, Phone, FileText, Users,
  BarChart3, CreditCard, Wallet, ChevronDown, ChevronRight,
  PieChart, FileBarChart, GraduationCap,
  Calendar
} from "lucide-react";
import { BsFillBookmarkDashFill } from "react-icons/bs";

interface SubMenuItem {
  title: string;
  path: string;
  icon: React.ReactNode;
}

interface MenuItem {
  title: string;
  path?: string;
  icon: React.ReactNode;
  subItems?: SubMenuItem[];
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
          ? "bg-primary-50 text-primary-600 font-medium border-l-4 border-primary-600" 
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
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
  icon: React.ReactNode;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  isCollapsed?: boolean;
  pathPrefix?: string;
}) => {
  const location = useLocation();
  const isActive = pathPrefix && location.pathname.startsWith(pathPrefix);

  if (isCollapsed) {
    return (
      <div className="relative">
        <button
          onClick={onToggle}
          onMouseEnter={() => !isExpanded && onToggle()}
          onMouseLeave={() => isExpanded && onToggle()}
          className={`flex items-center justify-center w-full p-2.5 rounded-xl transition-colors
            ${isActive ? "bg-primary-50 text-primary-600" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
          title={title}
        >
          <span className={isActive ? "text-primary-600" : "text-gray-500"}>
            {icon}
          </span>
        </button>
        {isExpanded && (
          <div 
            className="absolute left-full top-0 ml-2 bg-white shadow-lg rounded-xl py-2 min-w-48 z-50 border border-gray-200"
            onMouseEnter={() => onToggle()}
            onMouseLeave={() => onToggle()}
          >
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500">{title}</p>
            </div>
            <div className="py-1">
              {children}
            </div>
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
          ${isActive ? "bg-primary-50 text-primary-600" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
      >
        <div className="flex items-center gap-3">
          <span className={`text-base ${isActive ? "text-primary-600" : "text-gray-500"}`}>{icon}</span>
          <span className={`font-medium text-sm ${isActive ? "text-primary-600" : "text-gray-600"}`}>{title}</span>
        </div>
        {isExpanded ? (
          <ChevronDown className={`text-sm w-4 h-4 ${isActive ? "text-primary-600" : "text-gray-400"}`} />
        ) : (
          <ChevronRight className={`text-sm w-4 h-4 ${isActive ? "text-primary-600" : "text-gray-400"}`} />
        )}
      </button>
      <div className={`pl-9 space-y-0.5 overflow-hidden transition-all duration-300 ${
        isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
      }`}>
        {children}
      </div>
    </div>
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
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const location = useLocation();

  // Menu structure with all dropdowns
  const menuSections = {
    dashboard: {
      title: "Dashboard",
      path: "/dashboard",
      icon: <Home className="w-5 h-5" />,
    },
    business: {
      title: "Business",
      icon: <Building2 className="w-5 h-5" />,
      subItems: [
        { title: "AI Assistants", path: "/assistant", icon: <Bot className="w-4 h-4" /> },
        { title: "Phone Numbers", path: "/getnumbers", icon: <Phone className="w-4 h-4" /> },
        { title: "Leads", path: "/files", icon: <Users className="w-4 h-4" /> },
        { title: "Knowledge Base", path: "/documents", icon: <FileText className="w-4 h-4" /> },
        { title: "Calander Integration", path: "/calander-integration", icon: <Calendar className="w-4 h-4" /> },

      ],
    },
    reports: {
      title: "Reports",
      icon: <BarChart3 className="w-5 h-5" />,
      subItems: [
        { title: "Reports Dashboard", path: "/report-dashboard", icon: <PieChart className="w-4 h-4" /> },
        { title: "Usage Report", path: "/usage-report", icon: <FileBarChart className="w-4 h-4" /> },
        { title: "Billing Report", path: "/bl-report", icon: <BsFillBookmarkDashFill className="w-4 h-4" /> },

      ],
    },
    billing: {
      title: "Billing",
      icon: <CreditCard className="w-5 h-5" />,
      subItems: [
        { title: "Payment Methods", path: "/payment", icon: <Wallet className="w-4 h-4" /> },
        { title: "Make Payment", path: "/make-payment", icon: <CreditCard className="w-4 h-4" /> },
      ],
    },
  };

  // Initialize expanded menus based on current path
  useEffect(() => {
    const newExpanded = new Set<string>();

    Object.entries(menuSections).forEach(([key, section]) => {
      if ('subItems' in section) {
        const isActive = section.subItems?.some(subItem => 
          location.pathname.startsWith(subItem.path)
        );
        if (isActive) newExpanded.add(key);
      }
    });

    setExpandedMenus(newExpanded);
  }, [location.pathname]);

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

  const renderSubItem = (item: SubMenuItem, isCollapsed: boolean, parentMenu: string) => (
    <NavLink
      key={item.path}
      to={item.path}
      className={({ isActive }) => 
        `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group
        ${isActive 
          ? "bg-primary-50 text-primary-600" 
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        }
        ${isCollapsed ? "justify-center px-2.5" : ""}`
      }
      title={isCollapsed ? item.title : undefined}
      onClick={() => {
        if (window.innerWidth < 1024) {
          setMobileOpen(false);
        }
      }}
    >
      <span className={`text-sm ${({ isActive }: any) => isActive ? "text-primary-600" : "text-gray-500 group-hover:text-gray-700"}`}>
        {item.icon}
      </span>
      {!isCollapsed && (
        <span className="text-sm whitespace-nowrap">
          {item.title}
        </span>
      )}
    </NavLink>
  );

  const renderMenuContent = () => (
    <>
      {/* Header - Clean, no color fill */}
      <div className="p-6 flex items-center justify-between border-b border-gray-100">
        {!sidebarCollapsed ? (
          <Link to="/dashboard" className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-primary-100 rounded-xl flex items-center justify-center">
              <span className="text-primary-700 font-bold text-sm">BM</span>
            </div>
            <div>
              <h1 className="text-base font-semibold text-gray-900">Brand<span className="text-primary-600">Mize</span></h1>
              <p className="text-xs text-gray-500">Agent Dashboard</p>
            </div>
          </Link>
        ) : (
          <Link to="/dashboard" className="flex justify-center items-center w-full">
            <div className="w-9 h-9 bg-primary-100 rounded-xl flex items-center justify-center">
              <span className="text-primary-700 font-bold text-sm">BM</span>
            </div>
          </Link>
        )}
        {!sidebarCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="p-4 flex-1">
        {!sidebarCollapsed && (
          <div className="px-3 pb-3">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Menu
            </p>
          </div>
        )}
        
        <div className="space-y-1">
          {/* Dashboard - Simple Item */}
          <SidebarItem 
            to={menuSections.dashboard.path}
            icon={menuSections.dashboard.icon}
            isCollapsed={sidebarCollapsed}
          >
            {menuSections.dashboard.title}
          </SidebarItem>

          {/* Business Section */}
          <div 
            onMouseEnter={() => !sidebarCollapsed && setHoveredMenu("business")}
            onMouseLeave={() => setHoveredMenu(null)}
            className="relative"
          >
            <SidebarSection
              title={menuSections.business.title}
              icon={menuSections.business.icon}
              isExpanded={sidebarCollapsed ? hoveredMenu === "business" : expandedMenus.has("business")}
              onToggle={() => toggleMenu("business")}
              isCollapsed={sidebarCollapsed}
              pathPrefix="/business"
            >
              {!sidebarCollapsed || hoveredMenu === "business" ? (
                menuSections.business.subItems?.map((item) => 
                  renderSubItem(item, sidebarCollapsed && hoveredMenu !== "business", "business")
                )
              ) : null}
            </SidebarSection>
          </div>

          {/* Reports Section */}
          <div 
            onMouseEnter={() => !sidebarCollapsed && setHoveredMenu("reports")}
            onMouseLeave={() => setHoveredMenu(null)}
            className="relative"
          >
            <SidebarSection
              title={menuSections.reports.title}
              icon={menuSections.reports.icon}
              isExpanded={sidebarCollapsed ? hoveredMenu === "reports" : expandedMenus.has("reports")}
              onToggle={() => toggleMenu("reports")}
              isCollapsed={sidebarCollapsed}
              pathPrefix="/report"
            >
              {!sidebarCollapsed || hoveredMenu === "reports" ? (
                menuSections.reports.subItems?.map((item) => 
                  renderSubItem(item, sidebarCollapsed && hoveredMenu !== "reports", "reports")
                )
              ) : null}
            </SidebarSection>
          </div>

          {/* Billing Section */}
          <div 
            onMouseEnter={() => !sidebarCollapsed && setHoveredMenu("billing")}
            onMouseLeave={() => setHoveredMenu(null)}
            className="relative"
          >
            <SidebarSection
              title={menuSections.billing.title}
              icon={menuSections.billing.icon}
              isExpanded={sidebarCollapsed ? hoveredMenu === "billing" : expandedMenus.has("billing")}
              onToggle={() => toggleMenu("billing")}
              isCollapsed={sidebarCollapsed}
              pathPrefix="/billing"
            >
              {!sidebarCollapsed || hoveredMenu === "billing" ? (
                menuSections.billing.subItems?.map((item) => 
                  renderSubItem(item, sidebarCollapsed && hoveredMenu !== "billing", "billing")
                )
              ) : null}
            </SidebarSection>
          </div>
        </div>
      </div>

      {/* Bottom Section - User info */}
      {!sidebarCollapsed && (
        <div className="absolute bottom-20 left-0 right-0 px-4">
          <div className="px-3 py-3 bg-primary-50 rounded-xl border border-primary-100">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-primary-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-primary-700">Free Plan</p>
                <p className="text-xs text-primary-600">2 AI assistants left</p>
              </div>
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
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative h-full bg-white border-r border-gray-200 shadow-sm transition-all duration-300 z-40 flex flex-col
          ${sidebarCollapsed ? "w-16" : "w-64"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Mobile Close Button */}
        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-lg bg-white shadow-md hover:bg-gray-50 text-gray-600 hover:text-gray-900 z-50 lg:hidden"
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
              className="flex items-center justify-between w-full p-3 rounded-lg border border-gray-200 bg-white hover:bg-primary-50 
                text-gray-600 hover:text-primary-600 transition-all"
            >
              <span className="text-xs font-medium">Collapse sidebar</span>
              <Menu className="transform rotate-90 w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="flex items-center justify-center w-full p-3 rounded-lg border border-gray-200 bg-white hover:bg-primary-50 
                text-gray-600 hover:text-primary-600 transition-all"
              title="Expand sidebar"
            >
              <Menu className="w-4 h-4" />
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
      className="p-2 rounded-lg hover:bg-primary-50 text-gray-600 hover:text-primary-600 transition-colors lg:hidden"
      aria-label={mobileOpen ? "Close menu" : "Open menu"}
      data-mobile-sidebar-toggle
    >
      {mobileOpen ? (
        <X className="w-5 h-5" />
      ) : (
        <Menu className="w-5 h-5" />
      )}
    </button>
  );
}