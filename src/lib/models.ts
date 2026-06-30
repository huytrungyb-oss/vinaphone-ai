export const AVAILABLE_MODELS = [
  { id: "gpt-4o-mini", label: "GPT-4o mini (Nhanh)", provider: "openai", pro: false },
  { id: "gpt-4o", label: "GPT-4o (Mạnh mẽ)", provider: "openai", pro: true },
  { id: "gpt-4-turbo", label: "GPT-4 Turbo", provider: "openai", pro: true },
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash (Nhanh)", provider: "gemini", pro: false },
  { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro (Mạnh mẽ)", provider: "gemini", pro: true },
  { id: "deepseek-chat", label: "DeepSeek Chat", provider: "deepseek", pro: false },
  { id: "deepseek-reasoner", label: "DeepSeek Reasoner (Suy luận sâu)", provider: "deepseek", pro: true },
] as const;

export type ModelId = (typeof AVAILABLE_MODELS)[number]["id"];
export type Provider = (typeof AVAILABLE_MODELS)[number]["provider"];

export function getProviderForModel(modelId: string): Provider {
  return AVAILABLE_MODELS.find((m) => m.id === modelId)?.provider ?? "openai";
}

export function isProModel(modelId: string): boolean {
  return AVAILABLE_MODELS.find((m) => m.id === modelId)?.pro ?? false;
}

export const DEFAULT_GUEST_MODEL: ModelId = "gpt-4o-mini";
