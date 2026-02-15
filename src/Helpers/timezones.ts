// Get all IANA timezone identifiers.
// Uses Intl.supportedValuesOf when available (Chrome 99+, Firefox 93+, Safari 15.4+),
// otherwise falls back to a comprehensive list.
export function getAllTimezones(): string[] {
  if (typeof Intl !== "undefined" && "supportedValuesOf" in Intl) {
    try {
      return (Intl as any).supportedValuesOf("timeZone").sort();
    } catch {
      // Fallback if supportedValuesOf fails
    }
  }
  // Fallback: common IANA timezones
  return [
    "Africa/Abidjan", "Africa/Accra", "Africa/Addis_Ababa", "Africa/Algiers", "Africa/Cairo",
    "Africa/Casablanca", "Africa/Johannesburg", "Africa/Lagos", "Africa/Nairobi", "Africa/Tunis",
    "America/Anchorage", "America/Argentina/Buenos_Aires", "America/Chicago", "America/Denver",
    "America/Los_Angeles", "America/Mexico_City", "America/New_York", "America/Phoenix",
    "America/Sao_Paulo", "America/Toronto", "America/Vancouver", "Asia/Bangkok", "Asia/Dubai",
    "Asia/Hong_Kong", "Asia/Kolkata", "Asia/Seoul", "Asia/Singapore", "Asia/Tokyo",
    "Australia/Melbourne", "Australia/Perth", "Australia/Sydney", "Europe/Amsterdam",
    "Europe/Berlin", "Europe/London", "Europe/Moscow", "Europe/Paris", "Europe/Rome",
    "Pacific/Auckland", "Pacific/Fiji", "Pacific/Guam", "UTC",
  ].sort();
}
