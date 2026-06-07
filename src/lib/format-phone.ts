/**
 * Formats a phone number as +x (xxx) xxx-xxxx (US/NA default when 10 digits).
 * Returns the original string when parsing fails.
 */
export function formatPhoneNumber(input: string | null | undefined): string {
  if (!input?.trim()) return "";

  const trimmed = input.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (!digits.length) return trimmed;

  let countryCode: string;
  let national: string;

  if (digits.length === 10) {
    countryCode = "1";
    national = digits;
  } else if (digits.length === 11 && digits.startsWith("1")) {
    countryCode = "1";
    national = digits.slice(1);
  } else if (digits.length > 10) {
    countryCode = digits.slice(0, digits.length - 10);
    national = digits.slice(-10);
  } else {
    return trimmed;
  }

  if (national.length !== 10) return trimmed;

  return `+${countryCode} (${national.slice(0, 3)}) ${national.slice(3, 6)}-${national.slice(6)}`;
}
