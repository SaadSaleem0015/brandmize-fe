export interface TwilioCountry {
  code: string;
  name: string;
  type: "area_code" | "contains";
  note: string;
}

export const twilioSupportedCountries: TwilioCountry[] = [
  { code: "US", name: "United States", type: "area_code", note: "3-digit area code (e.g. 415, 212, 218)" },
  { code: "CA", name: "Canada", type: "area_code", note: "3-digit area code (e.g. 416, 604)" },
  { code: "DE", name: "Germany", type: "contains", note: "City/prefix digits (e.g. 30 for Berlin, 89 for Munich)" },
  { code: "GB", name: "United Kingdom", type: "contains", note: "e.g. 20 for London, 121 for Birmingham" },
  { code: "PK", name: "Pakistan", type: "contains", note: "Mobile prefix (e.g. 030, 031, 032, 033)" },
  { code: "IN", name: "India", type: "contains", note: "City codes (e.g. 11 Delhi, 22 Mumbai, 80 Bangalore)" },
  { code: "AU", name: "Australia", type: "contains", note: "State prefixes (e.g. 2 Sydney, 3 Melbourne)" },
  { code: "FR", name: "France", type: "contains", note: "e.g. 1 Paris" },
  { code: "BR", name: "Brazil", type: "contains", note: "e.g. 11 Sao Paulo, 21 Rio" },
  { code: "ES", name: "Spain", type: "contains", note: "e.g. 91 Madrid" },
  { code: "IT", name: "Italy", type: "contains", note: "e.g. 06 Rome" },
  { code: "NL", name: "Netherlands", type: "contains", note: "e.g. 20 Amsterdam" },
  { code: "MX", name: "Mexico", type: "contains", note: "e.g. 55 Mexico City" },
  { code: "ZA", name: "South Africa", type: "contains", note: "e.g. 11 Johannesburg" },
  { code: "NG", name: "Nigeria", type: "contains", note: "Mobile prefixes common" },
];

export default twilioSupportedCountries;
