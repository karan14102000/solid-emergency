import {
  createSolidDataset,
  getSolidDataset,
  saveSolidDatasetAt,
  setThing,
  getThing,
  getThingAll,
  removeThing,
  buildThing,
  getStringNoLocale,
} from "@inrupt/solid-client";
import type { ThingBuilder, Thing } from "@inrupt/solid-client";
import { rdf, foaf } from "rdf-namespaces";
import { solidFetch } from "./auth";
import { CDM } from "./cdm";

const EMERGENCY_FILE = "public/emergency.ttl";

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

function addStringIf<T extends ThingBuilder<Thing>>(
  builder: T,
  predicate: string,
  value: string,
): T {
  return value ? (builder.addStringNoLocale(predicate, value) as T) : builder;
}

export async function saveEmergencyData(
  podBaseUrl: string,
  data: EmergencyData,
): Promise<string> {
  const fileUrl = `${podBaseUrl}${EMERGENCY_FILE}`;

  let dataset;
  try {
    dataset = await getSolidDataset(fileUrl, { fetch: solidFetch });
    const things = getThingAll(dataset);
    for (const thing of things) {
      dataset = removeThing(dataset, thing);
    }
  } catch {
    dataset = createSolidDataset();
  }

  const incidentUrl = `${fileUrl}#incident`;
  const victimUrl = `${fileUrl}#victim`;
  const perpetratorUrl = `${fileUrl}#perpetrator`;
  const organisationUrl = `${fileUrl}#organisation`;
  const reportUrl = `${fileUrl}#report`;
  const articleUrl = `${fileUrl}#article`;
  const situationUrl = `${fileUrl}#situation`;

  let incidentBuilder = buildThing({ url: incidentUrl }).addUrl(
    rdf.type,
    CDM.Incident,
  );

  incidentBuilder = addStringIf(
    incidentBuilder,
    CDM.incidentID,
    data.incidentId,
  );
  incidentBuilder = addStringIf(
    incidentBuilder,
    CDM.incidentType,
    data.incidentType,
  );
  incidentBuilder = addStringIf(incidentBuilder, CDM.date, data.date);
  incidentBuilder = addStringIf(incidentBuilder, CDM.country, data.country);
  incidentBuilder = addStringIf(incidentBuilder, CDM.state, data.state);
  incidentBuilder = addStringIf(incidentBuilder, CDM.town, data.town);
  incidentBuilder = addStringIf(incidentBuilder, CDM.village, data.village);
  incidentBuilder = addStringIf(incidentBuilder, CDM.location, data.location);
  incidentBuilder = addStringIf(incidentBuilder, CDM.gps, data.gps);
  incidentBuilder = addStringIf(
    incidentBuilder,
    CDM.description,
    data.description,
  );
  incidentBuilder = addStringIf(
    incidentBuilder,
    CDM.medicalImpact,
    data.medicalImpact,
  );
  incidentBuilder = addStringIf(
    incidentBuilder,
    CDM.mentalhealthImpact,
    data.mentalhealthImpact,
  );
  incidentBuilder = addStringIf(
    incidentBuilder,
    CDM.socialImpact,
    data.socialImpact,
  );
  incidentBuilder = addStringIf(
    incidentBuilder,
    CDM.violencePerpetrated,
    data.violencePerpetrated,
  );
  incidentBuilder = addStringIf(incidentBuilder, CDM.reference, data.reference);
  incidentBuilder = addStringIf(incidentBuilder, CDM.source, data.source);
  incidentBuilder = addStringIf(incidentBuilder, CDM.timeRange, data.timeRange);

  const incident = incidentBuilder.build();

  let victimBuilder = buildThing({ url: victimUrl }).addUrl(
    rdf.type,
    CDM.Victim,
  );

  victimBuilder = addStringIf(victimBuilder, CDM.victimID, data.victimId);
  victimBuilder = addStringIf(victimBuilder, CDM.category, data.victimCategory);
  victimBuilder = addStringIf(
    victimBuilder,
    CDM.description,
    data.victimDescription,
  );
  victimBuilder = addStringIf(
    victimBuilder,
    CDM.maritalStatus,
    data.victimMaritalStatus,
  );
  victimBuilder = addStringIf(
    victimBuilder,
    CDM.parentalStatus,
    data.victimParentalStatus,
  );
  if (data.victimAge) {
    victimBuilder = victimBuilder.addStringNoLocale(foaf.age, data.victimAge);
  }
  if (data.victimGender) {
    victimBuilder = victimBuilder.addStringNoLocale(
      foaf.gender,
      data.victimGender,
    );
  }
  victimBuilder = victimBuilder.addUrl(CDM.isVictimOf, incidentUrl);

  const victim = victimBuilder.build();

  let perpetratorBuilder = buildThing({ url: perpetratorUrl }).addUrl(
    rdf.type,
    CDM.Perpetrator,
  );

  perpetratorBuilder = addStringIf(
    perpetratorBuilder,
    CDM.perpetratorID,
    data.perpetratorId,
  );
  perpetratorBuilder = addStringIf(
    perpetratorBuilder,
    CDM.category,
    data.perpetratorCategory,
  );
  perpetratorBuilder = addStringIf(
    perpetratorBuilder,
    CDM.affiliation,
    data.perpetratorAffiliation,
  );
  perpetratorBuilder = addStringIf(
    perpetratorBuilder,
    CDM.number,
    data.perpetratorNumber,
  );
  perpetratorBuilder = addStringIf(
    perpetratorBuilder,
    CDM.description,
    data.perpetratorDescription,
  );
  if (data.perpetratorAge) {
    perpetratorBuilder = perpetratorBuilder.addStringNoLocale(
      foaf.age,
      data.perpetratorAge,
    );
  }
  if (data.perpetratorGender) {
    perpetratorBuilder = perpetratorBuilder.addStringNoLocale(
      foaf.gender,
      data.perpetratorGender,
    );
  }
  perpetratorBuilder = perpetratorBuilder.addUrl(
    CDM.isPerpetratorOf,
    incidentUrl,
  );

  const perpetrator = perpetratorBuilder.build();

  let organisationBuilder = buildThing({ url: organisationUrl }).addUrl(
    rdf.type,
    CDM.Organisation,
  );
  organisationBuilder = addStringIf(
    organisationBuilder,
    CDM.organisationID,
    data.organisationId,
  );
  const organisation = organisationBuilder.build();

  let reportBuilder = buildThing({ url: reportUrl }).addUrl(
    rdf.type,
    CDM.Report,
  );
  reportBuilder = addStringIf(reportBuilder, CDM.date, data.date);
  reportBuilder = addStringIf(reportBuilder, CDM.inputBy, data.inputBy);
  reportBuilder = addStringIf(reportBuilder, CDM.number, data.reportNumber);
  const report = reportBuilder.build();

  let articleBuilder = buildThing({ url: articleUrl }).addUrl(
    rdf.type,
    CDM.Article,
  );
  articleBuilder = addStringIf(articleBuilder, CDM.link, data.articleLink);
  articleBuilder = addStringIf(articleBuilder, CDM.number, data.reportNumber);
  const article = articleBuilder.build();

  let situationBuilder = buildThing({ url: situationUrl }).addUrl(
    rdf.type,
    CDM.SituationReport,
  );
  situationBuilder = addStringIf(
    situationBuilder,
    CDM.link,
    data.situationReportLink,
  );
  const situation = situationBuilder.build();

  let updated = dataset;
  updated = setThing(updated, incident);
  updated = setThing(updated, victim);
  updated = setThing(updated, perpetrator);
  updated = setThing(updated, organisation);
  updated = setThing(updated, report);
  updated = setThing(updated, article);
  updated = setThing(updated, situation);

  await saveSolidDatasetAt(fileUrl, updated, { fetch: solidFetch });
  return fileUrl;
}

export async function loadEmergencyData(
  podBaseUrl: string,
): Promise<EmergencyData | null> {
  const fileUrl = `${podBaseUrl}${EMERGENCY_FILE}`;

  let dataset;
  try {
    dataset = await getSolidDataset(fileUrl, { fetch: solidFetch });
  } catch {
    return null;
  }

  const incidentUrl = `${fileUrl}#incident`;
  const victimUrl = `${fileUrl}#victim`;
  const perpetratorUrl = `${fileUrl}#perpetrator`;
  const organisationUrl = `${fileUrl}#organisation`;
  const reportUrl = `${fileUrl}#report`;
  const articleUrl = `${fileUrl}#article`;
  const situationUrl = `${fileUrl}#situation`;

  const incident = getThing(dataset, incidentUrl);
  const victim = getThing(dataset, victimUrl);

  if (!incident || !victim) {
    return null;
  }

  const perpetrator = getThing(dataset, perpetratorUrl);
  const organisation = getThing(dataset, organisationUrl);
  const report = getThing(dataset, reportUrl);
  const article = getThing(dataset, articleUrl);
  const situation = getThing(dataset, situationUrl);

  const incidentId = getStringNoLocale(incident, CDM.incidentID) || "";
  const incidentType = getStringNoLocale(incident, CDM.incidentType) || "";
  const date = getStringNoLocale(incident, CDM.date) || "";
  const country = getStringNoLocale(incident, CDM.country) || "";
  const state = getStringNoLocale(incident, CDM.state) || "";
  const town = getStringNoLocale(incident, CDM.town) || "";
  const village = getStringNoLocale(incident, CDM.village) || "";
  const location = getStringNoLocale(incident, CDM.location) || "";
  const gps = getStringNoLocale(incident, CDM.gps) || "";
  const description = getStringNoLocale(incident, CDM.description) || "";
  const medicalImpact = getStringNoLocale(incident, CDM.medicalImpact) || "";
  const mentalhealthImpact =
    getStringNoLocale(incident, CDM.mentalhealthImpact) || "";
  const socialImpact = getStringNoLocale(incident, CDM.socialImpact) || "";
  const violencePerpetrated =
    getStringNoLocale(incident, CDM.violencePerpetrated) || "";
  const reference = getStringNoLocale(incident, CDM.reference) || "";
  const source = getStringNoLocale(incident, CDM.source) || "";
  const timeRange = getStringNoLocale(incident, CDM.timeRange) || "";

  const victimId = getStringNoLocale(victim, CDM.victimID) || "";
  const victimCategory = getStringNoLocale(victim, CDM.category) || "";
  const victimAge = getStringNoLocale(victim, foaf.age) || "";
  const victimGender = getStringNoLocale(victim, foaf.gender) || "";
  const victimMaritalStatus =
    getStringNoLocale(victim, CDM.maritalStatus) || "";
  const victimParentalStatus =
    getStringNoLocale(victim, CDM.parentalStatus) || "";
  const victimDescription = getStringNoLocale(victim, CDM.description) || "";

  const perpetratorId = perpetrator
    ? getStringNoLocale(perpetrator, CDM.perpetratorID) || ""
    : "";
  const perpetratorCategory = perpetrator
    ? getStringNoLocale(perpetrator, CDM.category) || ""
    : "";
  const perpetratorAge = perpetrator
    ? getStringNoLocale(perpetrator, foaf.age) || ""
    : "";
  const perpetratorGender = perpetrator
    ? getStringNoLocale(perpetrator, foaf.gender) || ""
    : "";
  const perpetratorAffiliation = perpetrator
    ? getStringNoLocale(perpetrator, CDM.affiliation) || ""
    : "";
  const perpetratorNumber = perpetrator
    ? getStringNoLocale(perpetrator, CDM.number) || ""
    : "";
  const perpetratorDescription = perpetrator
    ? getStringNoLocale(perpetrator, CDM.description) || ""
    : "";

  const organisationId = organisation
    ? getStringNoLocale(organisation, CDM.organisationID) || ""
    : "";

  const inputBy = report ? getStringNoLocale(report, CDM.inputBy) || "" : "";
  const reportNumber = report
    ? getStringNoLocale(report, CDM.number) || ""
    : "";

  const articleLink = article ? getStringNoLocale(article, CDM.link) || "" : "";

  const situationReportLink = situation
    ? getStringNoLocale(situation, CDM.link) || ""
    : "";

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
