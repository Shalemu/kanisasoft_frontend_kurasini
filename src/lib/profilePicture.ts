type ProfilePicture = {
  profile_picture_url?: string | null;
  profile_picture_path?: string | null;
};

function isAbsoluteUrl(value: string) {
  return /^(?:https?:|blob:|data:)/i.test(value);
}

export function getProfilePictureUrl(profile?: ProfilePicture | null) {
  const directUrl = profile?.profile_picture_url?.trim();
  const storedPath = profile?.profile_picture_path?.trim();
  const value = directUrl || storedPath;

  if (!value || isAbsoluteUrl(value)) return value || "";

  const origin = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/api\/?$/, "");
  if (!origin) return value;

  const cleanPath = value.replace(/^\/+/, "");

  if (directUrl || cleanPath.startsWith("storage/")) {
    return `${origin}/${cleanPath}`;
  }

  return `${origin}/storage/${cleanPath}`;
}
