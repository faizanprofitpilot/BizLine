import "server-only";

import { formatPhoneNumber } from "@/lib/format-phone";

export function parseBusinessFormData(formData: FormData) {
  const servicesRaw = String(formData.get("services") ?? "");
  const services = servicesRaw
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    business_name: String(formData.get("business_name") ?? "").trim(),
    hours: String(formData.get("hours") ?? "").trim(),
    phone: formatPhoneNumber(String(formData.get("phone") ?? "").trim()),
    address: String(formData.get("address") ?? "").trim(),
    additional_context: String(formData.get("additional_context") ?? "").trim(),
    first_message: String(formData.get("first_message") ?? "").trim(),
    system_prompt: String(formData.get("system_prompt") ?? "").trim(),
    services,
  };
}
