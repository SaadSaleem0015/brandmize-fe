import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { Login } from "./Pages/Login";
import "./index.css";
import { Dashboard } from "./Pages/Dashboard";
import ErrorBoundary from "./Components/ErrorBoundary";
import { LoginChecker } from "./Helpers/LoginChecker";


// import { States } from "./Pages/States";
import NotFoundPage from "./Components/NotFound";
import { Signup } from "./Pages/Signup";
import { ForgotPassword } from "./Pages/ForgotPassword";
import { PanelLayout } from "./Components/PanelLayout";
import { AdminPanelLayout } from "./Components/admin/AdminPanelLayout";
import { AdminDashboard } from "./Pages/admin/Dashboard";
import { Profile } from "./Pages/Profile";


const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <LoginChecker allowedUser="logged-in">
          <ErrorBoundary><PanelLayout /></ErrorBoundary>
      </LoginChecker>
    ),
    children: [
      {
        path: "dashboard",
        element: <ErrorBoundary><Dashboard /></ErrorBoundary>,
      },
      {
        path: "profile",
        element: <ErrorBoundary><Profile /></ErrorBoundary>,
      },
    ]
    // children: [
    //   {
    //     path: "dashboard",
    //     element: <ErrorBoundary><Dashboard /></ErrorBoundary>,
    //   },
    //   {
    //     path: "files",
    //     element: <ErrorBoundary><Files /></ErrorBoundary>,
    //   },
    //   {
    //     path: "view-leads",
    //     element: <ErrorBoundary><ViewLeads /></ErrorBoundary>,
    //   },
    //   {
    //     path: "leads",
    //     element: <ErrorBoundary><Leads /></ErrorBoundary>,
    //   },
    //   {
    //     path: "ghl-leads",
    //     element: <ErrorBoundary><GhlLeads /></ErrorBoundary>,
    //   },
 


    //   ...(!isUserRole()
    //     ? [
    //       {
    //         path: "Getnumbers",
    //         element: <ErrorBoundary><GetNumbers /></ErrorBoundary>,
    //       },
    //     ]
    //     : []),
    //   {
    //     path: "documents",
    //     element: <ErrorBoundary><ViewDocuments /></ErrorBoundary>,
    //   },
    //   {
    //     path: "documents/upload",
    //     element: <ErrorBoundary><Documents /></ErrorBoundary>,
    //   },
    //   {
    //     path: "assistant/createassistant",
    //     element: <ErrorBoundary><CreateAssitant /></ErrorBoundary>,
    //   },
    //   {
    //     path: "assistant",
    //     element: <ErrorBoundary><Assistant /></ErrorBoundary>,
    //   },
    //   {
    //     path: "message-chat",
    //     element: <ErrorBoundary><ChatList /></ErrorBoundary>,
    //   },
    //   {
    //     path: "appointments",
    //     element: <ErrorBoundary><Appointments /></ErrorBoundary>,
    //   },
    //   {
    //     path: "schedule",
    //     element: <ErrorBoundary><Schedule /></ErrorBoundary>,
    //   },
    //   {
    //     path: "report-dashboard",
    //     element: <ErrorBoundary><ReportDashboard /></ErrorBoundary>,
    //   },
    //   {
    //     path: "content-management",
    //     element: <ErrorBoundary><ContentManagement /></ErrorBoundary>,
    //   },
    //   {
    //     path: "events-availability",
    //     element: <ErrorBoundary><EventsAvailability /></ErrorBoundary>,
    //   },
    //   {
    //     path: "call-logs",
    //     element: <ErrorBoundary><UsageReport /></ErrorBoundary>,
    //   },

    // ],
  },
  {
    path: "/admin",
    element: (
      <LoginChecker allowedUser="logged-in">
        <ErrorBoundary><AdminPanelLayout /></ErrorBoundary>
      </LoginChecker>
    ),
    children: [
      {
        path: "dashboard",
        element: <ErrorBoundary><AdminDashboard /></ErrorBoundary>,
      },
    ],
  },
    {
      path: "/login",
      element: (
        <LoginChecker allowedUser="not-logged-in">
          <ErrorBoundary><Login /></ErrorBoundary>
        </LoginChecker>
      ),
    },
    {
      path: "/signup",
      element: (
        <LoginChecker allowedUser="not-logged-in">
          <ErrorBoundary><Signup /></ErrorBoundary>
        </LoginChecker>
      ),
    },
    {
      path: "/forgot-password",
      element: (
        <LoginChecker allowedUser="not-logged-in">
          <ErrorBoundary><ForgotPassword /></ErrorBoundary>
        </LoginChecker>
      ),
    },
  {
    path: "*",
    element: <ErrorBoundary><NotFoundPage /></ErrorBoundary>
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);