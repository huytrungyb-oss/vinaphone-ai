export const AVAILABLE_MODELS = [
  { id: "gpt-4o-mini", label: "GPT-4o mini (Nhanh)" },
  { id: "gpt-4o", label: "GPT-4o (Mạnh mẽ)" },
  { id: "gpt-4-turbo", label: "GPT-4 Turbo" },
] as const;

export type ModelId = (typeof AVAILABLE_MODELS)[number]["id"];
