const VN_PHONE_REGEX = /^(0|\+84)(3|5|7|8|9)\d{8}$/;

export function normalizePhone(raw: string): string | null {
  const trimmed = raw.trim().replace(/[\s.-]/g, "");
  if (!VN_PHONE_REGEX.test(trimmed)) return null;

  if (trimmed.startsWith("+84")) {
    return "0" + trimmed.slice(3);
  }
  return trimmed;
}
