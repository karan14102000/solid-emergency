import {
  getSolidDataset,
  getThing,
  setThing,
  saveSolidDatasetAt,
  createSolidDataset,
  buildThing,
  getStringNoLocale,
} from "@inrupt/solid-client";
import { rdf, schema } from "rdf-namespaces";
import { solidFetch } from "./auth";

export type EmergencyData = { name: string; phone: string; bloodType: string };

const EMERGENCY_FILE = "public/emergency.ttl";
const EMERGENCY_NS = "https://solid-emergency.app/ns#";
const P_BLOOD_TYPE = `${EMERGENCY_NS}bloodType`;

export async function saveEmergencyData(
  podBaseUrl: string,
  data: EmergencyData,
): Promise<string> {
  const fileUrl = `${podBaseUrl}${EMERGENCY_FILE}`;

  let dataset;
  try {
    dataset = await getSolidDataset(fileUrl, { fetch: solidFetch });
  } catch {
    dataset = createSolidDataset();
  }

  const emergencyThing = buildThing(
    getThing(dataset, fileUrl + "#emergency") ?? {
      url: fileUrl + "#emergency",
    },
  )
    .addUrl(rdf.type, schema.Person)
    .setStringNoLocale(schema.name, data.name)
    .setStringNoLocale(schema.telephone, data.phone)
    .setStringNoLocale(P_BLOOD_TYPE, data.bloodType)
    .build();

  const updatedDataset = setThing(dataset, emergencyThing);
  await saveSolidDatasetAt(fileUrl, updatedDataset, { fetch: solidFetch });

  return fileUrl;
}

export async function loadEmergencyData(
  podBaseUrl: string,
): Promise<EmergencyData | null> {
  const fileUrl = `${podBaseUrl}${EMERGENCY_FILE}`;

  const dataset = await getSolidDataset(fileUrl, { fetch: solidFetch });
  const thing = getThing(dataset, fileUrl + "#emergency");
  if (!thing) return null;

  return {
    name: getStringNoLocale(thing, schema.name) || "",
    phone: getStringNoLocale(thing, schema.telephone) || "",
    bloodType: getStringNoLocale(thing, P_BLOOD_TYPE) || "",
  };
}
