import { useEffect, useRef, useState } from "react";
import { Menu, LogOut, User, X, Settings, Bell } from "lucide-react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { api } from "../../Helpers/BackendRequest";

export interface AdminPanelContentProps {
  mobileOpen?: boolean;
  setMobileOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

export function AdminPanelContent({
  mobileOpen = false,
  setMobileOpen = () => {},
}: AdminPanelContentProps) {
  const [droppedDown, setDroppedDown] = useState(false);
  const [userName, setUserName] = useState("");
  const [unreadNotifications, setUnreadNotifications] = useState(5);

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
      setUserName(data?.name || data?.email || "Admin");
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

  return (
    <div className="flex-grow bg-gray-50 overflow-auto">
      {/* Admin Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Side - Mobile Menu & Brand */}
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
            
            {/* Admin Brand */}
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">AD</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  Admin<span className="text-secondary-600">Console</span>
                </h1>
                <p className="text-xs text-gray-500">Super Administrator</p>
              </div>
            </div>
          </div>

          {/* Right Side - Admin Actions */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative p-2 hover:bg-gray-100 rounded-xl transition">
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </button>

            {/* Settings */}
            <button className="p-2 hover:bg-gray-100 rounded-xl transition">
              <Settings className="w-5 h-5 text-gray-600" />
            </button>

            {/* Admin User Menu */}
            <div className="relative">
              <button
                ref={buttonRef}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 transition-all"
                onClick={handleDropDown}
              >
                <div className="w-9 h-9 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-white">
                    {userName?.charAt(0)?.toUpperCase() || "A"}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                    {userName || "Admin"}
                  </p>
                  <p className="text-xs text-primary-600 font-medium">Super Admin</p>
                </div>
              </button>

              {/* Admin Dropdown Menu */}
              <div
                ref={menuRef}
                className={`absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-lg border border-gray-200 py-3 z-50 ${
                  droppedDown ? "block" : "hidden"
                }`}
              >
                {/* Admin Info */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="font-medium text-gray-900">{userName || "Admin"}</p>
                  <p className="text-sm text-purple-600 font-medium mt-1">Super Administrator</p>
                </div>

                {/* Admin Menu Items */}
                <div className="py-2">
                  <button
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition"
                    onClick={() => {
                      setDroppedDown(false);
                      navigate("/admin/profile");
                    }}
                  >
                    <User className="w-4 h-4 text-gray-500" />
                    Admin Profile
                  </button>
                  <button
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition"
                    onClick={() => {
                      setDroppedDown(false);
                      navigate("/admin/settings");
                    }}
                  >
                    <Settings className="w-4 h-4 text-gray-500" />
                    System Settings
                  </button>
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

      {/* Main Content Area */}
      <div className="p-0">
        <Outlet />
      </div>
    </div>
  );
}