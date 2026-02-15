import { useEffect, useState } from "react";
import { api } from "../Helpers/backendRequest";
import { notifyResponse } from "../Helpers/notyf";
import { InfoTooltip } from "./InfoTooltip";
import { Loading } from "./Loading";

interface TwilioCredentials {
  account_sid: string;
  auth_token: string;
  address_sid?: string;
}

interface TwilioCredentialsCardProps {
  onStatusChange?: (connected: boolean) => void;
}

export function TwilioCredentialsCard({ onStatusChange }: TwilioCredentialsCardProps) {
  const [creds, setCreds] = useState<TwilioCredentials>({ account_sid: "", auth_token: "", address_sid: "" });
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [connected, setConnected] = useState(false);

  const fetchCreds = async () => {
    setChecking(true);
    try {
      const { data } = await api.get<TwilioCredentials | { success: false; detail: string }>(
        "/credentials"
      );
      if (data && "account_sid" in data && data.account_sid) {
        setCreds({
          account_sid: data.account_sid || "",
          auth_token: "", // Never show token back
          address_sid: (data as TwilioCredentials).address_sid ?? "",
        });
        setConnected(true);
        onStatusChange?.(true);
      } else {
        setCreds({ account_sid: "", auth_token: "", address_sid: "" });
        setConnected(false);
        onStatusChange?.(false);
      }
    } catch {
      setConnected(false);
      onStatusChange?.(false);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    fetchCreds();
  }, []);

  const upsertCreds = async () => {
    if (!creds.account_sid.trim() || !creds.auth_token.trim()) {
      notifyResponse({ success: false, detail: "Please fill in both Account SID and Auth Token" });
      return;
    }
    setLoading(true);
    try {
      const method = connected ? "PUT" : "POST";
      const payload: Record<string, string> = {
        account_sid: creds.account_sid.trim(),
        auth_token: creds.auth_token.trim(),
      };
      if (creds.address_sid?.trim()) {
        payload.address_sid = creds.address_sid.trim();
      }
      const { data: resData } = method === "POST" ? await api.post<{ success?: boolean; detail?: string }>("/credentials", payload) : await api.put<{ success?: boolean; detail?: string }>("/credentials", payload);
      notifyResponse(resData ?? {});
      if (resData?.success) {
        setCreds(c => ({ ...c, auth_token: "" }));
        setConnected(true);
        onStatusChange?.(true);
      }
    } catch (error) {
      console.error("Error saving Twilio credentials:", error);
      notifyResponse({ success: false, detail: "Failed to save credentials" });
    } finally {
      setLoading(false);
    }
  };

  const deleteCreds = async () => {
    setLoading(true);
    try {
      const { data: resData } = await api.delete<{ success?: boolean; detail?: string }>("/credentials");
      notifyResponse(resData ?? {});
      if (resData?.success) {
        setCreds({ account_sid: "", auth_token: "", address_sid: "" });
        setConnected(false);
        onStatusChange?.(false);
      }
    } catch (error) {
      console.error("Error deleting Twilio credentials:", error);
      notifyResponse({ success: false, detail: "Failed to delete credentials" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900">Twilio Credentials</h2>
          <InfoTooltip
            content={
              <div className="text-xs space-y-2">
                <p>
                  Your Twilio <strong>Account SID</strong> and <strong>Auth Token</strong> are used
                  only to search and purchase phone numbers on your behalf.
                </p>
                <p>
                  They are <strong>encrypted and stored securely</strong>. We never share them with
                  third parties or use them for any purpose other than managing your phone numbers.
                </p>
                <p>
                  <strong>USA &amp; Canada:</strong> You can purchase US and CA numbers without an Address SID.
                </p>
                <p>
                  <strong>International numbers:</strong> Without an Address SID, you can only purchase USA and CA numbers. To purchase international numbers, even with a business Twilio account you must: create a compliant address in Twilio Console (or via API) matching the country&apos;s rules; provide proof/documents if needed (e.g. utility bill, business registration for France); get the Address SID (starts with AD...) and add it here. Check requirements:{" "}
                  <a
                    href="https://www.twilio.com/en-us/guidelines/regulatory"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline hover:no-underline"
                  >
                    Twilio regulatory guidelines
                  </a>
                </p>
                <p>
                  You can remove your credentials at any time, which will immediately stop access to
                  your Twilio account.
                </p>
              </div>
            }
          />
        </div>
        {checking ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loading />
            <span>Checking...</span>
          </div>
        ) : (
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              connected 
                ? "bg-green-50 text-green-700 border border-green-200" 
                : "bg-yellow-50 text-yellow-700 border border-yellow-200"
            }`}
          >
            {connected ? "✓ Connected" : "Not Connected"}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Account SID
          </label>
          <input
            type="text"
            value={creds.account_sid}
            onChange={e => setCreds(c => ({ ...c, account_sid: e.target.value }))}
            placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Auth Token
          </label>
          <input
            type="password"
            value={creds.auth_token}
            onChange={e => setCreds(c => ({ ...c, auth_token: e.target.value }))}
            placeholder="Your Twilio auth token"
            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Address SID <span className="text-gray-500 font-normal">(Optional — for international numbers)</span>
          </label>
          <input
            type="text"
            value={creds.address_sid ?? ""}
            onChange={e => setCreds(c => ({ ...c, address_sid: e.target.value }))}
            placeholder="ADxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
          />
          <p className="text-xs text-gray-500">
            Required only for purchasing international numbers (non‑US/CA). For USA and Canada numbers this is not required. Create a compliant address in Twilio Console and use the Address SID (starts with AD...).{" "}
            <a
              href="https://www.twilio.com/guidelines/fr/regulatory"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Check regulatory requirements
            </a>
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex gap-2">
          <button
            onClick={upsertCreds}
            disabled={loading || checking}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary-400 text-white hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loading />
                {connected ? "Updating..." : "Connecting..."}
              </span>
            ) : (
              connected ? "Update Credentials" : "Connect Twilio"
            )}
          </button>
          {connected && (
            <button
              onClick={deleteCreds}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Remove
            </button>
          )}
        </div>
        <p className="text-[11px] text-gray-500 max-w-xs text-right hidden md:block">
          🔒 All credentials are encrypted at rest and only used to communicate with Twilio on your behalf.
        </p>
      </div>
    </div>
  );
}
