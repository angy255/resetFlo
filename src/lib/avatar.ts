export const avatarColorOptions = ["slate", "indigo", "emerald", "amber"] as const;

export type AvatarColor = (typeof avatarColorOptions)[number];

export const defaultAvatarColor: AvatarColor = "slate";

export const avatarColorClassMap: Record<AvatarColor, string> = {
  slate: "bg-slate text-light",
  indigo: "bg-indigo-600 text-white",
  emerald: "bg-emerald-600 text-white",
  amber: "bg-amber-500 text-navy-dark",
};
