import { universalAccess } from "@inrupt/solid-client";
import { solidFetch } from "./auth";

const EMERGENCY_FILE_PATH = "public/emergency.ttl";

function getEmergencyFileUrl(podBaseUrl: string): string {
  return `${podBaseUrl}${EMERGENCY_FILE_PATH}`;
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

export const grantAccessToSelectedNGOs = async (
  selectedNGOs: string[], // List of selected NGOs (WebIDs/URLs)
  podBaseUrl: string, // Base URL for the Solid pod
) => {
  try {
    const emergencyFileUrl = getEmergencyFileUrl(podBaseUrl);

    for (const ngoWebId of selectedNGOs) {
      console.log(
        `Attempting to grant access to ${ngoWebId} for ${emergencyFileUrl}`,
      );
      const updatedAccess = await universalAccess.setAgentAccess(
        emergencyFileUrl,
        ngoWebId,
        { read: true, append: false, write: false },
        { fetch: solidFetch },
      );

      if (updatedAccess === null) {
        console.warn(
          `Failed to grant access to ${ngoWebId} for resource ${emergencyFileUrl}. It's possible the NGO's WebID is invalid or the operation encountered an issue.`,
        );
      } else {
        console.log(`Access granted for ${ngoWebId} to ${emergencyFileUrl}.`);
      }
    }

    console.log("Finished attempting to grant access to all selected NGOs.");
  } catch (error) {
    console.error("Error granting access to NGOs:", error);
    throw error;
  }
};
