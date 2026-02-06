import { useState, useEffect, useRef } from "react";
import { Menu, LogOut, User, X, CreditCard, Bell, Settings } from "lucide-react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { api } from "../Helpers/BackendRequest";

export interface PanelContentProps {
  mobileOpen?: boolean;
  setMobileOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

export function PanelContent({
  mobileOpen = false,
  setMobileOpen = () => {},
}: PanelContentProps) {
  const [droppedDown, setDroppedDown] = useState(false);
  const [userName, setUserName] = useState("");
  const [unreadNotifications, setUnreadNotifications] = useState(3);

  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  function logout() {
    api
      .post("/auth/logout")
      .catch(() => {
        // ignore logout error, still clear local state
      })
      .finally(() => {
        localStorage.clear();
        navigate("/login");
        window.location.reload();
      });
  }

  function handleDropDown() {
    setDroppedDown((prev) => !prev);
  }

  const handleUser = async () => {
    try {
      const response = await api.get("/auth/profile");
      const data = response.data;
      setUserName(data?.name || data?.email || "User");
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  };

  useEffect(() => {
    handleUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setDroppedDown(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const admin_logged_in = localStorage.getItem("admin_token");
  
  const handleExit = () => {
    if (!admin_logged_in) return;
    localStorage.setItem("role", "admin");
    localStorage.setItem("token", admin_logged_in);
    localStorage.removeItem("admin_token");
    localStorage.removeItem("adminLogin");
    navigate("/admin/dashboard");
  };

  return (
    <div className="flex-grow bg-gray-50 overflow-auto">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Side - Mobile Menu Button & Brand */}
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-all"
              onClick={(e) => {
                e.stopPropagation();
                setMobileOpen(!mobileOpen);
              }}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? (
                <X className="w-5 h-5 text-gray-600" />
              ) : (
                <Menu className="w-5 h-5 text-gray-600" />
              )}
            </button>
            
            {/* Brand */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">OC</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 hidden md:block">
                  Brand<span className="text-primary-600">Mize</span>
                </h1>
                <p className="text-xs text-gray-500 hidden md:block">Agent Dashboard</p>
              </div>
            </div>
          </div>

          {/* Right Side - Actions & User Menu */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
           

            {/* Settings */}
            <button className="p-2 hover:bg-gray-100 rounded-xl transition">
              <Settings className="w-5 h-5 text-gray-600" />
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                ref={buttonRef}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 transition-all"
                onClick={handleDropDown}
              >
                <div className="w-9 h-9 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-white">
                    {userName?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                    {userName}
                  </p>
                  <p className="text-xs text-gray-500">Agent</p>
                </div>
              </button>

              {/* Dropdown Menu */}
              <div
                ref={menuRef}
                className={`absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-lg border border-gray-200 py-3 z-50 ${
                  droppedDown ? "block" : "hidden"
                }`}
              >
                {/* User Info */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="font-medium text-gray-900">{userName}</p>
                  <p className="text-sm text-gray-500 mt-1">Support Agent</p>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition"
                    onClick={() => setDroppedDown(false)}
                  >
                    <User className="w-4 h-4 text-gray-500" />
                    Profile & Settings
                  </Link>
                  <Link
                    to="/billing"
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition"
                    onClick={() => setDroppedDown(false)}
                  >
                    <CreditCard className="w-4 h-4 text-gray-500" />
                    Billing & Plan
                  </Link>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100"></div>

                {/* Logout */}
                <div className="pt-2">
                  <button
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition"
                    onClick={logout}
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Management Banner */}
      {admin_logged_in && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="px-6 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-3 h-3 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Managing: <span className="font-semibold">{userName}</span>
                </p>
                <p className="text-xs text-blue-700">Admin mode - Viewing agent dashboard</p>
              </div>
            </div>
            <button
              onClick={handleExit}
              className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition"
            >
              Exit Management
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="p-6">
        <Outlet />
      </div>
    </div>
  );
}