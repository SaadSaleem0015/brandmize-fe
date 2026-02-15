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
import { Files } from "./Pages/Files";
import { ViewLeads } from "./Pages/ViewLeads";
import { Leads } from "./Pages/Leads";
import { ViewDocuments } from "./Components/ViewDocuments";
import { Documents } from "./Pages/Documents";
import Assistant from "./Pages/Assistant";
import CreateAssistant from "./Pages/CreateAssistant";
import ReportDashboard from "./Pages/Reportdashboard";
import UsageReport from "./Pages/UsageReport";
import PaymentPage from "./Pages/Payment";
import PaymentMethod from "./Pages/PaymentMethod";
import MakePayment from "./Pages/MakePayment";
import CalendarIntegration from "./Pages/CalendarIntegration";
import GetNumbers from "./Pages/GetNumbers";
import BillingReport from "./Pages/BillingReport";

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
    //   {
    //     path: "dashboard",
    //     element: <ErrorBoundary><Dashboard /></ErrorBoundary>,
    //   },
      {
        path: "files",
        element: <ErrorBoundary><Files /></ErrorBoundary>,
      },
      {
        path: "view-leads",
        element: <ErrorBoundary><ViewLeads /></ErrorBoundary>,
      },
      {
        path: "leads",
        element: <ErrorBoundary><Leads /></ErrorBoundary>,
      },
      {
        path: "getnumbers",
        element: <ErrorBoundary><GetNumbers /></ErrorBoundary>,
      },
      {
        path: "usage-report",
        element: <ErrorBoundary><UsageReport /></ErrorBoundary>,
      },
      {
        path: "bl-report",
        element: <ErrorBoundary><BillingReport /></ErrorBoundary>,
      },
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
      {
        path: "documents",
        element: <ErrorBoundary><ViewDocuments /></ErrorBoundary>,
      },
  
      {
        path: "documents/upload",
        element: <ErrorBoundary><Documents /></ErrorBoundary>,
      },
      {
        path: "make-payment",
        element: <ErrorBoundary><MakePayment /></ErrorBoundary>,
      },
      {
        path: "payment-method",
        element: <ErrorBoundary><PaymentMethod /></ErrorBoundary>,
      },
      {
        path: "calander-integration",
        element: <ErrorBoundary><CalendarIntegration /></ErrorBoundary>,
      },
      {
        path: "payment",
        element: <ErrorBoundary><PaymentPage /></ErrorBoundary>,
      },
      {
        path: "documents/upload",
        element: <ErrorBoundary><Documents /></ErrorBoundary>,
      },
      {
        path: "assistant/createassistant",
        element: <ErrorBoundary><CreateAssistant /></ErrorBoundary>,
      },
      {
        path: "assistant",
        element: <ErrorBoundary><Assistant /></ErrorBoundary>,
      },
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
      {
        path: "report-dashboard",
        element: <ErrorBoundary><ReportDashboard /></ErrorBoundary>,
      },
    //   {
    //     path: "content-management",
    //     element: <ErrorBoundary><ContentManagement /></ErrorBoundary>,
    //   },
    //   {
    //     path: "events-availability",
    //     element: <ErrorBoundary><EventsAvailability /></ErrorBoundary>,
    //   },
      {
        path: "call-logs",
        element: <ErrorBoundary><UsageReport /></ErrorBoundary>,
      },

    ]
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