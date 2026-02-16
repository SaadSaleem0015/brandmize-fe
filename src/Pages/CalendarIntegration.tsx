import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { notifyResponse, notyf } from "../Helpers/notyf";
import { getAllTimezones } from "../Helpers/timezones";
import { FiChevronDown, FiChevronUp, FiExternalLink } from "react-icons/fi";
import { api } from "../Helpers/BackendRequest";

interface CalComEventType {
  id: number;
  title: string;
  slug: string;
  length: number;
}

interface IntegrationStatusResponse {
  is_connected: boolean;
  masked_api_key?: string;
  event_slug?: string;
  time_zone?: string;
  event_type_id?: number;
}

interface FetchResponse {
  event_types: CalComEventType[];
  default_timezone?: string;
}


export default function CalendarIntegration() {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [maskedApiKey, setMaskedApiKey] = useState<string>("");
  const [checking, setChecking] = useState(true);
  const [isChangeMode, setIsChangeMode] = useState(false);

  const [calComApiKey, setCalComApiKey] = useState("");
  const [eventTypes, setEventTypes] = useState<CalComEventType[]>([]);
  const [apiTimezone, setApiTimezone] = useState<string>("");
  const [selectedEventType, setSelectedEventType] = useState<CalComEventType | null>(null);
  const [selectedTimezone, setSelectedTimezone] = useState<string>("");
  const [savedEventSlug, setSavedEventSlug] = useState<string>("");
  const [savedTimezone, setSavedTimezone] = useState<string>("");

  const [fetching, setFetching] = useState(false);
  const [integrating, setIntegrating] = useState(false);
  const [showGuide, setShowGuide] = useState(true);

  const baseTimezones = getAllTimezones();
  // Include API timezone in list if not already present
  const timezones = apiTimezone
  ? [
      apiTimezone,
      ...baseTimezones.filter((tz) => tz !== apiTimezone).sort(),
    ]
  : baseTimezones;

  useEffect(() => {
    const fetchStatus = async () => {
      setChecking(true);
      try {
        const { data } = await api.get<
          IntegrationStatusResponse | { detail?: string }
        >("/calcom/integration");
        if (data && typeof data === "object" && "is_connected" in data) {
          setIsConnected(!!data.is_connected);
          setMaskedApiKey(data.masked_api_key || "");
          setSavedEventSlug(data.event_slug || "");
          setSavedTimezone(data.time_zone || "");
          if (data.time_zone) setSelectedTimezone(data.time_zone);
        } else {
          setIsConnected(false);
        }
      } catch (error) {
        console.error("Error fetching Cal.com status:", error);
      } finally {
        setChecking(false);
      }
    };
    fetchStatus();
  }, []);

  const handleChangeClick = () => {
    setIsChangeMode(true);
    setCalComApiKey("");
    setEventTypes([]);
    setSelectedEventType(null);
    setApiTimezone("");
    setSelectedTimezone(savedTimezone || (baseTimezones[0] ?? ""));
  };

  const refetchStatus = async () => {
    try {
      const { data } = await api.get<
        IntegrationStatusResponse | { detail?: string }
      >("/calcom/integration");
      if (data && typeof data === "object" && "is_connected" in data) {
        setIsConnected(data.is_connected);
        setMaskedApiKey(data.masked_api_key || "");
        setSavedEventSlug(data.event_slug || "");
        setSavedTimezone(data.time_zone || "");
      }
    } catch (error) {
      console.error("Error refetching status:", error);
    }
  };

  const handleFetch = async () => {
    if (!calComApiKey.trim()) {
      notifyResponse({ success: false, detail: "Please enter your Cal.com API key" });
      return;
    }
    setFetching(true);
    setEventTypes([]);
    setSelectedEventType(null);
    setApiTimezone("");
    setSelectedTimezone("");
    try {
      const { data } = await api.post<FetchResponse | { success?: boolean; detail: string }>(
        "/calcom/event-types",
        { api_key: calComApiKey.trim() }
      );
      if (data && typeof data === "object" && "event_types" in data && Array.isArray(data.event_types)) {
        setEventTypes(data.event_types);
        const tz = (data as FetchResponse).default_timezone || "";
        setApiTimezone(tz);
        setSelectedTimezone(tz);
      } else {
        notifyResponse((data as { success?: boolean; detail?: string }) ?? { success: false, detail: "Failed to fetch event types" });
      }
    } catch (error) {
      console.error("Error fetching Cal.com data:", error);
      notifyResponse({ success: false, detail: "Failed to fetch event types" });
    } finally {
      setFetching(false);
    }
  };

  const handleIntegrate = async () => {
    if (!calComApiKey.trim()) {
      notifyResponse({ success: false, detail: "Please enter your Cal.com API key" });
      return;
    }
    if (!selectedEventType) {
      notifyResponse({ success: false, detail: "Please select an event type" });
      return;
    }
    if (!selectedTimezone) {
      notifyResponse({ success: false, detail: "Please select a timezone" });
      return;
    }
    setIntegrating(true);
    try {
      const { data } = await api.patch<
        | {
            status: "success";
            message: string;
            confirmed: {
              id: number;
              slug: string;
              timeZone: string;
              name: string | null;
              length_minutes: number | null;
              integration_id: number;
              saved_at: string;
            };
          }
        | { success?: boolean; detail?: string }
      >(
        "/calcom/integration",
        {
          api_key: calComApiKey.trim(),
          event_type_id: selectedEventType.id,
          event_slug: selectedEventType.slug,
          time_zone: selectedTimezone,
        }
      );

      if (
        data &&
        typeof data === "object" &&
        "status" in data &&
        data.status === "success" &&
        "confirmed" in data
      ) {
        const { confirmed } = data;
        const parts: string[] = [`Event type: ${confirmed.slug}`];
        if (confirmed.timeZone) parts.push(`Timezone: ${confirmed.timeZone}`);
        notyf.success(`Cal.com integrated successfully! ${parts.join(" • ")}`);
        setIsChangeMode(false);
        setCalComApiKey("");
        setEventTypes([]);
        setSelectedEventType(null);
        await refetchStatus();
      } else {
        notifyResponse(data ?? {});
      }
    } catch (error) {
      console.error("Error saving integration:", error);
      notifyResponse({ success: false, detail: "Failed to save integration" });
    } finally {
      setIntegrating(false);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-white max-w-6xl">
      <button
        type="button"
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Dashboard
      </button>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
          Calendar Integration (Cal.com)
        </h1>
        {!checking && (
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              isConnected
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-gray-100 text-gray-600 border border-gray-200"
            }`}
          >
            {isConnected ? "Connected" : "Not Connected"}
          </span>
        )}
      </div>

      {checking ? (
        <div className="py-8 text-center text-gray-500">Loading...</div>
      ) : isConnected && !isChangeMode ? (
        /* Connected: show masked key + Change button */
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                API Key (masked)
              </label>
              <p className="font-mono text-gray-700">{maskedApiKey || "••••••••••••••••"}</p>
              {savedEventSlug && (
                <p className="mt-2 text-sm text-gray-600">
                  Event: <span className="font-medium">{savedEventSlug}</span>
                  {savedTimezone && (
                    <>
                      {" • "}
                      Timezone: <span className="font-medium">{savedTimezone}</span>
                    </>
                  )}
                </p>
              )}
            </div>
            <button
              onClick={handleChangeClick}
              className="px-4 py-2.5 rounded-lg font-medium text-sm border border-primary text-primary hover:bg-primary/10 transition-colors whitespace-nowrap"
            >
              Change
            </button>
          </div>
        </div>
      ) : (
        /* Not connected or Change mode: show form */
        <>
          {isChangeMode && (
            <button
              onClick={() => setIsChangeMode(false)}
              className="mb-4 text-sm text-gray-600 hover:text-gray-800"
            >
              ← Cancel and keep current
            </button>
          )}
          {/* Setup Guide */}
          <div className="mb-6 rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="w-full flex items-center justify-between px-5 py-4 text-left font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
            >
              <span className="flex items-center gap-2">
                Cal.com setup guide
                <a
                  href="https://cal.com/docs/api-reference/v2/introduction"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary text-sm font-normal flex items-center gap-1 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FiExternalLink className="w-4 h-4" />
                  Docs
                </a>
              </span>
              {showGuide ? <FiChevronUp className="w-5 h-5 text-gray-500" /> : <FiChevronDown className="w-5 h-5 text-gray-500" />}
            </button>
            {showGuide && (
              <div className="px-5 pb-5 pt-0 text-sm text-gray-700 space-y-5 border-t border-gray-100">
                {/* Step 1: API Key */}
                <section>
                  <h3 className="font-semibold text-gray-800 mb-2">1. Get your Cal.com API key</h3>
                  <ol className="list-decimal list-inside space-y-1.5 text-gray-600">
                    <li>Sign in at <a href="https://cal.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">cal.com</a></li>
                    <li>Go to <strong>Settings → Security</strong> (or Developers)</li>
                    <li>Find <strong>API Keys</strong> → <strong>Create New API Key</strong></li>
                    <li>Name it (e.g. &quot;Helios Integration&quot;), set expiration (recommended: Never), click <strong>Save</strong></li>
                    <li><strong>Copy the key immediately</strong> — it’s only shown once. It looks like <code className="bg-gray-100 px-1 rounded">cal_live_xxxx...</code></li>
                  </ol>
                </section>

                {/* Step 2: Availability */}
                <section>
                  <h3 className="font-semibold text-gray-800 mb-2">2. Set your availability</h3>
                  <p className="text-gray-600">
                    After creating the API key, go back in Cal.com, click <strong>Availability</strong> in the sidebar and set your working hours so bookings are flawless.
                  </p>
                </section>

                {/* Step 3: Event types */}
                <section>
                  <h3 className="font-semibold text-gray-800 mb-2">3. Create event types (for booking types)</h3>
                  <ol className="list-decimal list-inside space-y-1.5 text-gray-600">
                    <li>In the sidebar, click <strong>Event Types</strong> → <strong>Create</strong></li>
                    <li>Add a <strong>title</strong> (e.g. 15-min booking, Treatment booking)</li>
                    <li>Go to <strong>Duration</strong> and set the length (e.g. 30 min)</li>
                    <li>Click <strong>Create</strong> or <strong>Save</strong></li>
                  </ol>
                </section>

                {/* Step 4: Booking questions - Phone */}
                <section>
                  <h3 className="font-semibold text-gray-800 mb-2">4. Add phone to booking questions</h3>
                  <p className="text-gray-600 mb-2">After creating the event you’ll be on the event settings page.</p>
                  <ol className="list-decimal list-inside space-y-1.5 text-gray-600">
                    <li>Click <strong>Advanced</strong> and scroll down a little</li>
                    <li>Find the <strong>Booking questions</strong> heading; on the right you’ll see options like Email / Phone number</li>
                    <li>
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 text-amber-900 px-2 py-0.5 font-semibold border border-amber-300">
                        Click <strong>Phone</strong> — very important
                      </span>
                      {" "}We use phone numbers to book appointments.
                    </li>
                    <li>Click <strong>Save</strong></li>
                  </ol>
                  <p className="text-gray-600 mt-2 font-medium text-green-700">That’s it for Cal.com. No other settings are required.</p>
                </section>

                {/* Integrate here */}
                <section className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">How to integrate Cal.com here</h3>
                  <ol className="list-decimal list-inside space-y-1.5 text-gray-600">
                    <li>Paste your Cal.com API key in the field below</li>
                    <li>Click <strong>Fetch Events &amp; Timezone</strong></li>
                    <li>Select the <strong>event type</strong> you want to use from the dropdown</li>
                    <li>Select the <strong>timezone</strong> you want to use for bookings</li>
                    <li>Click <strong>Connect Cal.com</strong> or <strong>Update Integration</strong></li>
                  </ol>
                </section>
              </div>
            )}
          </div>

          {/* API Key Input */}
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-700">Cal.com API Key</label>
            <div className="flex gap-2 flex-wrap">
              <input
                type="password"
                value={calComApiKey}
                onChange={(e) => setCalComApiKey(e.target.value)}
                placeholder="cal_live_xxxxxxxxxxxx"
                className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-lg text-gray-700 outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
              <button
                onClick={handleFetch}
                disabled={fetching || !calComApiKey.trim()}
                className={`px-4 py-3 rounded-lg font-medium text-sm whitespace-nowrap ${
                  fetching || !calComApiKey.trim()
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-primary-400 text-white hover:bg-primary-600"
                }`}
              >
                {fetching ? "Fetching..." : "Fetch Events & Timezone"}
              </button>
            </div>
          </div>

          {/* Event Types & Timezone (shown after fetch) */}
          {eventTypes.length > 0 && (
            <div className="space-y-6 p-4 rounded-lg border border-gray-200 bg-white">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Event Type
                </label>
                <select
                  value={selectedEventType?.id ?? ""}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    const event = eventTypes.find((et) => et.id === id) ?? null;
                    setSelectedEventType(event);
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 outline-none cursor-pointer"
                >
                  <option value="" disabled>
                    Select an event type...
                  </option>
                  {eventTypes.map((et) => (
                    <option key={et.id} value={et.id}>
                      {et.slug} {et.title ? `— ${et.title}` : ""} ({et.length} min)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Timezone</label>
                <select
                  value={selectedTimezone}
                  onChange={(e) => setSelectedTimezone(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 outline-none cursor-pointer"
                >
                  {timezones.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
                {apiTimezone && (
                  <p className="mt-1 text-xs text-gray-500">
                    Your Cal.com timezone ({apiTimezone}) is auto-selected. You can change it above.
                  </p>
                )}
              </div>

              <button
                onClick={handleIntegrate}
                disabled={integrating || !selectedEventType || !selectedTimezone}
                className={`px-4 py-2.5 rounded-lg font-medium text-sm ${
                  integrating || !selectedEventType || !selectedTimezone
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-primary-400 text-white hover:bg-primary-600"
                }`}
              >
                {integrating ? "Updating..." : isChangeMode ? "Update Integration" : "Connect Cal.com"}
              </button>
            </div>
          )}

          {eventTypes.length === 0 && !fetching && (
            <p className="text-sm text-gray-500">
              Enter your Cal.com API key and click &quot;Fetch Events &amp; Timezone&quot; to get
              started.
            </p>
          )}
        </>
      )}
    </div>
  );
}
