import { universalAccess } from "@inrupt/solid-client";
import { solidFetch } from "./auth";

const EMERGENCY_FILE = "public/emergency.ttl";

function getEmergencyFileUrl(podBaseUrl: string): string {
  return `${podBaseUrl}${EMERGENCY_FILE}`;
}

export async function makeEmergencyPublic(podBaseUrl: string): Promise<string> {
  const fileUrl = getEmergencyFileUrl(podBaseUrl);
  const updated = await universalAccess.setPublicAccess(
    fileUrl,
    { read: true, append: false, write: false },
    { fetch: solidFetch },
  );
  if (!updated) {
    throw new Error("Failed to set public access");
  }
  return fileUrl;
}

export async function makeEmergencyPrivate(
  podBaseUrl: string,
): Promise<string> {
  const fileUrl = getEmergencyFileUrl(podBaseUrl);
  const updated = await universalAccess.setPublicAccess(
    fileUrl,
    { read: false, append: false, write: false },
    { fetch: solidFetch },
  );
  if (!updated) {
    throw new Error("Failed to remove public access");
  }
  return fileUrl;
}
