import * as $rdf from "rdflib";
import { solidFetch } from "./auth";
import { CDM } from "./cdmnew";

const EMERGENCY_FILE = "public/emergency.ttl";
const NGO_LIST_FILE = "public/ngoList.ttl";

export type EmergencyData = {
  incidentId: string;
  incidentType: string;
  date: string;
  country: string;
  state: string;
  town: string;
  village: string;
  location: string;
  gps: string;
  description: string;
  medicalImpact: string;
  mentalhealthImpact: string;
  socialImpact: string;
  violencePerpetrated: string;
  reference: string;
  source: string;
  timeRange: string;
  victimId: string;
  victimCategory: string;
  victimAge: string;
  victimGender: string;
  victimMaritalStatus: string;
  victimParentalStatus: string;
  victimDescription: string;
  perpetratorId: string;
  perpetratorCategory: string;
  perpetratorAge: string;
  perpetratorGender: string;
  perpetratorAffiliation: string;
  perpetratorNumber: string;
  perpetratorDescription: string;
  organisationId: string;
  inputBy: string;
  reportNumber: string;
  articleLink: string;
  situationReportLink: string;
};

function addTripleIf(
  store: $rdf.IndexedFormula,
  subject: $rdf.NamedNode,
  predicate: $rdf.NamedNode,
  value: string,
): void {
  if (value) {
    store.add(subject, predicate, $rdf.lit(value));
  }
}

export async function saveEmergencyData(
  podBaseUrl: string,
  data: EmergencyData,
): Promise<string> {
  const fileUrl = `${podBaseUrl}${EMERGENCY_FILE}`;

  const store = $rdf.graph();

  const incidentNode = $rdf.sym(`${fileUrl}#incident`);
  const victimNode = $rdf.sym(`${fileUrl}#victim`);
  const perpetratorNode = $rdf.sym(`${fileUrl}#perpetrator`);
  const organisationNode = $rdf.sym(`${fileUrl}#organisation`);
  const reportNode = $rdf.sym(`${fileUrl}#report`);
  const articleNode = $rdf.sym(`${fileUrl}#article`);
  const situationNode = $rdf.sym(`${fileUrl}#situation`);

  const RDF_TYPE = $rdf.sym("http://www.w3.org/1999/02/22-rdf-syntax-ns#type");

  store.add(incidentNode, RDF_TYPE, CDM.Incident);
  addTripleIf(store, incidentNode, CDM.incidentID, data.incidentId);
  addTripleIf(store, incidentNode, CDM.incidentType, data.incidentType);
  addTripleIf(store, incidentNode, CDM.date, data.date);
  addTripleIf(store, incidentNode, CDM.country, data.country);
  addTripleIf(store, incidentNode, CDM.state, data.state);
  addTripleIf(store, incidentNode, CDM.town, data.town);
  addTripleIf(store, incidentNode, CDM.village, data.village);
  addTripleIf(store, incidentNode, CDM.location, data.location);
  addTripleIf(store, incidentNode, CDM.gps, data.gps);
  addTripleIf(store, incidentNode, CDM.description, data.description);
  addTripleIf(store, incidentNode, CDM.medicalImpact, data.medicalImpact);
  addTripleIf(
    store,
    incidentNode,
    CDM.mentalhealthImpact,
    data.mentalhealthImpact,
  );
  addTripleIf(store, incidentNode, CDM.socialImpact, data.socialImpact);
  addTripleIf(
    store,
    incidentNode,
    CDM.violencePerpetrated,
    data.violencePerpetrated,
  );
  addTripleIf(store, incidentNode, CDM.reference, data.reference);
  addTripleIf(store, incidentNode, CDM.source, data.source);
  addTripleIf(store, incidentNode, CDM.timeRange, data.timeRange);

  store.add(victimNode, RDF_TYPE, CDM.Victim);
  addTripleIf(store, victimNode, CDM.victimID, data.victimId);
  addTripleIf(store, victimNode, CDM.category, data.victimCategory);
  addTripleIf(store, victimNode, CDM.description, data.victimDescription);
  addTripleIf(store, victimNode, CDM.maritalStatus, data.victimMaritalStatus);
  addTripleIf(store, victimNode, CDM.parentalStatus, data.victimParentalStatus);
  addTripleIf(store, victimNode, CDM.age, data.victimAge);
  addTripleIf(store, victimNode, CDM.gender, data.victimGender);
  store.add(victimNode, CDM.isVictimOf, incidentNode);

  store.add(perpetratorNode, RDF_TYPE, CDM.Perpetrator);
  addTripleIf(store, perpetratorNode, CDM.perpetratorID, data.perpetratorId);
  addTripleIf(store, perpetratorNode, CDM.category, data.perpetratorCategory);
  addTripleIf(
    store,
    perpetratorNode,
    CDM.affiliation,
    data.perpetratorAffiliation,
  );
  addTripleIf(store, perpetratorNode, CDM.number, data.perpetratorNumber);
  addTripleIf(
    store,
    perpetratorNode,
    CDM.description,
    data.perpetratorDescription,
  );
  addTripleIf(store, perpetratorNode, CDM.age, data.perpetratorAge);
  addTripleIf(store, perpetratorNode, CDM.gender, data.perpetratorGender);
  store.add(perpetratorNode, CDM.isPerpetratorOf, incidentNode);

  store.add(organisationNode, RDF_TYPE, CDM.Organisation);
  addTripleIf(store, organisationNode, CDM.organisationID, data.organisationId);

  store.add(reportNode, RDF_TYPE, CDM.Report);
  addTripleIf(store, reportNode, CDM.date, data.date);
  addTripleIf(store, reportNode, CDM.inputBy, data.inputBy);
  addTripleIf(store, reportNode, CDM.number, data.reportNumber);

  store.add(articleNode, RDF_TYPE, CDM.Article);
  addTripleIf(store, articleNode, CDM.link, data.articleLink);
  addTripleIf(store, articleNode, CDM.number, data.reportNumber);

  store.add(situationNode, RDF_TYPE, CDM.SituationReport);
  addTripleIf(store, situationNode, CDM.link, data.situationReportLink);

  const serialized = $rdf.serialize(null, store, fileUrl, "text/turtle");

  const response = await solidFetch(fileUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "text/turtle",
    },
    body: serialized,
  });

  if (!response.ok) {
    throw new Error(
      `Failed to save: ${response.status} ${response.statusText}`,
    );
  }

  return fileUrl;
}

export async function loadEmergencyData(
  podBaseUrl: string,
): Promise<EmergencyData | null> {
  const fileUrl = `${podBaseUrl}${EMERGENCY_FILE}`;

  let ttlContent: string;
  try {
    const response = await solidFetch(fileUrl);
    if (!response.ok) {
      return null;
    }
    ttlContent = await response.text();
  } catch {
    return null;
  }

  const store = $rdf.graph();
  try {
    $rdf.parse(ttlContent, store, fileUrl, "text/turtle");
  } catch (error) {
    console.error("Failed to parse RDF:", error);
    return null;
  }

  const incidentNode = $rdf.sym(`${fileUrl}#incident`);
  const victimNode = $rdf.sym(`${fileUrl}#victim`);
  const perpetratorNode = $rdf.sym(`${fileUrl}#perpetrator`);
  const organisationNode = $rdf.sym(`${fileUrl}#organisation`);
  const reportNode = $rdf.sym(`${fileUrl}#report`);
  const articleNode = $rdf.sym(`${fileUrl}#article`);
  const situationNode = $rdf.sym(`${fileUrl}#situation`);

  const getLiteral = (
    subject: $rdf.NamedNode,
    predicate: $rdf.NamedNode,
  ): string => {
    const value = store.any(subject, predicate, null);
    return value?.value || "";
  };

  const incidentId = getLiteral(incidentNode, CDM.incidentID);
  const incidentType = getLiteral(incidentNode, CDM.incidentType);
  const date = getLiteral(incidentNode, CDM.date);
  const country = getLiteral(incidentNode, CDM.country);
  const state = getLiteral(incidentNode, CDM.state);
  const town = getLiteral(incidentNode, CDM.town);
  const village = getLiteral(incidentNode, CDM.village);
  const location = getLiteral(incidentNode, CDM.location);
  const gps = getLiteral(incidentNode, CDM.gps);
  const description = getLiteral(incidentNode, CDM.description);
  const medicalImpact = getLiteral(incidentNode, CDM.medicalImpact);
  const mentalhealthImpact = getLiteral(incidentNode, CDM.mentalhealthImpact);
  const socialImpact = getLiteral(incidentNode, CDM.socialImpact);
  const violencePerpetrated = getLiteral(incidentNode, CDM.violencePerpetrated);
  const reference = getLiteral(incidentNode, CDM.reference);
  const source = getLiteral(incidentNode, CDM.source);
  const timeRange = getLiteral(incidentNode, CDM.timeRange);

  const victimId = getLiteral(victimNode, CDM.victimID);
  const victimCategory = getLiteral(victimNode, CDM.category);
  const victimAge = getLiteral(victimNode, CDM.age);
  const victimGender = getLiteral(victimNode, CDM.gender);
  const victimMaritalStatus = getLiteral(victimNode, CDM.maritalStatus);
  const victimParentalStatus = getLiteral(victimNode, CDM.parentalStatus);
  const victimDescription = getLiteral(victimNode, CDM.description);

  const perpetratorId = getLiteral(perpetratorNode, CDM.perpetratorID);
  const perpetratorCategory = getLiteral(perpetratorNode, CDM.category);
  const perpetratorAge = getLiteral(perpetratorNode, CDM.age);
  const perpetratorGender = getLiteral(perpetratorNode, CDM.gender);
  const perpetratorAffiliation = getLiteral(perpetratorNode, CDM.affiliation);
  const perpetratorNumber = getLiteral(perpetratorNode, CDM.number);
  const perpetratorDescription = getLiteral(perpetratorNode, CDM.description);

  const organisationId = getLiteral(organisationNode, CDM.organisationID);
  const inputBy = getLiteral(reportNode, CDM.inputBy);
  const reportNumber = getLiteral(reportNode, CDM.number);
  const articleLink = getLiteral(articleNode, CDM.link);
  const situationReportLink = getLiteral(situationNode, CDM.link);

  return {
    incidentId,
    incidentType,
    date,
    country,
    state,
    town,
    village,
    location,
    gps,
    description,
    medicalImpact,
    mentalhealthImpact,
    socialImpact,
    violencePerpetrated,
    reference,
    source,
    timeRange,
    victimId,
    victimCategory,
    victimAge,
    victimGender,
    victimMaritalStatus,
    victimParentalStatus,
    victimDescription,
    perpetratorId,
    perpetratorCategory,
    perpetratorAge,
    perpetratorGender,
    perpetratorAffiliation,
    perpetratorNumber,
    perpetratorDescription,
    organisationId,
    inputBy,
    reportNumber,
    articleLink,
    situationReportLink,
  };
}

export async function saveNgoList(
  podBaseUrl: string,
  ngos: string[],
): Promise<string> {
  const fileUrl = `${podBaseUrl}${NGO_LIST_FILE}`;
  const store = $rdf.graph();

  const listNode = $rdf.sym(`${fileUrl}#ngoList`);
  const RDF_TYPE = $rdf.sym("http://www.w3.org/1999/02/22-rdf-syntax-ns#type");
  const HAS_NGO = $rdf.sym("http://example.org/ns/hasNGO");

  store.add(listNode, RDF_TYPE, $rdf.sym("http://example.org/ns/NgoList"));

  ngos.forEach((ngoUri) => {
    store.add(listNode, HAS_NGO, $rdf.sym(ngoUri));
  });

  const serialized = $rdf.serialize(null, store, fileUrl, "text/turtle");

  const response = await solidFetch(fileUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "text/turtle",
    },
    body: serialized,
  });

  if (!response.ok) {
    throw new Error(
      `Failed to save NGO list: ${response.status} ${response.statusText}`,
    );
  }

  return fileUrl;
}

export async function loadNgoList(
  podBaseUrl: string,
): Promise<string[] | null> {
  const fileUrl = `${podBaseUrl}${NGO_LIST_FILE}`;
  let ttlContent: string;
  try {
    const response = await solidFetch(fileUrl);
    if (!response.ok) {
      return null;
    }
    ttlContent = await response.text();
  } catch {
    return null;
  }

  const store = $rdf.graph();
  try {
    $rdf.parse(ttlContent, store, fileUrl, "text/turtle");
  } catch (error) {
    console.error("Failed to parse NGO list RDF:", error);
    return null;
  }

  const listNode = $rdf.sym(`${fileUrl}#ngoList`);
  const HAS_NGO = $rdf.sym("http://example.org/ns/hasNGO");

  const ngos = store.each(listNode, HAS_NGO, null).map((ngo) => ngo.value);

  return ngos;
}
