import { useEffect, useState } from "react";
import { initSession, login, logout, isLoggedIn, getWebId } from "./auth";
import { saveEmergencyData, loadEmergencyData } from "./solidData";
import type { EmergencyData } from "./solidData";
import { getSolidDataset, getThing, getUrlAll } from "@inrupt/solid-client";
import { solidFetch } from "./auth";
import { makeEmergencyPublic, makeEmergencyPrivate } from "./accessControl";

export default function App() {
  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [webId, setWebId] = useState<string | null>(null);
  const [podBaseUrl, setPodBaseUrl] = useState("");

  const [incidentId, setIncidentId] = useState("");
  const [incidentType, setIncidentType] = useState("");
  const [incidentDate, setIncidentDate] = useState("");
  const [country, setCountry] = useState("");
  const [stateRegion, setStateRegion] = useState("");
  const [town, setTown] = useState("");
  const [village, setVillage] = useState("");
  const [locationDesc, setLocationDesc] = useState("");
  const [gps, setGps] = useState("");
  const [incidentDescription, setIncidentDescription] = useState("");
  const [medicalImpact, setMedicalImpact] = useState("");
  const [mentalImpact, setMentalImpact] = useState("");
  const [socialImpact, setSocialImpact] = useState("");
  const [violencePerpetrated, setViolencePerpetrated] = useState("");
  const [reference, setReference] = useState("");
  const [source, setSource] = useState("");
  const [timeRange, setTimeRange] = useState("");

  const [victimId, setVictimId] = useState("");
  const [victimCategory, setVictimCategory] = useState("");
  const [victimAge, setVictimAge] = useState("");
  const [victimGender, setVictimGender] = useState("");
  const [victimMaritalStatus, setVictimMaritalStatus] = useState("");
  const [victimParentalStatus, setVictimParentalStatus] = useState("");
  const [victimDescription, setVictimDescription] = useState("");

  const [perpetratorId, setPerpetratorId] = useState("");
  const [perpetratorCategory, setPerpetratorCategory] = useState("");
  const [perpetratorAge, setPerpetratorAge] = useState("");
  const [perpetratorGender, setPerpetratorGender] = useState("");
  const [perpetratorAffiliation, setPerpetratorAffiliation] = useState("");
  const [perpetratorNumber, setPerpetratorNumber] = useState("");
  const [perpetratorDescription, setPerpetratorDescription] = useState("");

  const [organisationId, setOrganisationId] = useState("");
  const [inputBy, setInputBy] = useState("");
  const [reportNumber, setReportNumber] = useState("");
  const [articleLink, setArticleLink] = useState("");
  const [situationReportLink, setSituationReportLink] = useState("");

  const [status, setStatus] = useState("");
  const [rawRdf, setRawRdf] = useState("");
  const [loadedEntry, setLoadedEntry] = useState<EmergencyData | null>(null);

  useEffect(() => {
    (async () => {
      await initSession();
      const ok = isLoggedIn();
      setLoggedIn(ok);
      const id = getWebId() ?? null;
      setWebId(id);
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!webId) return;
      try {
        const profileDoc = webId.split("#")[0];
        const ds = await getSolidDataset(profileDoc, { fetch: solidFetch });
        const me = getThing(ds, webId);
        if (!me) return;
        const storages = getUrlAll(
          me,
          "http://www.w3.org/ns/pim/space#storage",
        );
        const base = storages[0]
          ? storages[0].endsWith("/")
            ? storages[0]
            : storages[0] + "/"
          : "";
        if (base) setPodBaseUrl(base);
      } catch (err) {
        console.warn("Error while detecting storage", err);
      }
    })();
  }, [webId]);

  async function onLogin() {
    await login();
  }

  async function onLogout() {
    await logout();
    setLoggedIn(false);
    setWebId(null);
    setPodBaseUrl("");
    setStatus("");
    setRawRdf("");
    setLoadedEntry(null);
  }

  function toEmergencyData(): EmergencyData {
    return {
      incidentId,
      incidentType,
      date: incidentDate,
      country,
      state: stateRegion,
      town,
      village,
      location: locationDesc,
      gps,
      description: incidentDescription,
      medicalImpact,
      mentalhealthImpact: mentalImpact,
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

  function applyLoadedData(data: EmergencyData) {
    setIncidentId(data.incidentId);
    setIncidentType(data.incidentType);
    setIncidentDate(data.date);
    setCountry(data.country);
    setStateRegion(data.state);
    setTown(data.town);
    setVillage(data.village);
    setLocationDesc(data.location);
    setGps(data.gps);
    setIncidentDescription(data.description);
    setMedicalImpact(data.medicalImpact);
    setMentalImpact(data.mentalhealthImpact);
    setSocialImpact(data.socialImpact);
    setViolencePerpetrated(data.violencePerpetrated);
    setReference(data.reference);
    setSource(data.source);
    setTimeRange(data.timeRange);
    setVictimId(data.victimId);
    setVictimCategory(data.victimCategory);
    setVictimAge(data.victimAge);
    setVictimGender(data.victimGender);
    setVictimMaritalStatus(data.victimMaritalStatus);
    setVictimParentalStatus(data.victimParentalStatus);
    setVictimDescription(data.victimDescription);
    setPerpetratorId(data.perpetratorId);
    setPerpetratorCategory(data.perpetratorCategory);
    setPerpetratorAge(data.perpetratorAge);
    setPerpetratorGender(data.perpetratorGender);
    setPerpetratorAffiliation(data.perpetratorAffiliation);
    setPerpetratorNumber(data.perpetratorNumber);
    setPerpetratorDescription(data.perpetratorDescription);
    setOrganisationId(data.organisationId);
    setInputBy(data.inputBy);
    setReportNumber(data.reportNumber);
    setArticleLink(data.articleLink);
    setSituationReportLink(data.situationReportLink);
  }

  async function handleSave() {
    try {
      setStatus("saving…");
      const url = await saveEmergencyData(podBaseUrl, toEmergencyData());
      setStatus(`saved: ${url}`);
      const loaded = await loadEmergencyData(podBaseUrl);
      if (loaded) {
        setLoadedEntry(loaded);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setStatus(`error: ${msg}`);
    }
  }

  async function handleLoad() {
    try {
      setStatus("loading…");
      const data = await loadEmergencyData(podBaseUrl);
      if (!data) {
        setLoadedEntry(null);
        setStatus("no data");
        return;
      }
      setLoadedEntry(data);
      applyLoadedData(data);
      setStatus("loaded");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setStatus(`error: ${msg}`);
    }
  }

  async function handlePreviewRdf() {
    try {
      setStatus("fetching rdf…");
      const res = await solidFetch(`${podBaseUrl}public/emergency.ttl`);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const txt = await res.text();
      setRawRdf(txt);
      setStatus("rdf loaded");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setStatus(`error: ${msg}`);
    }
  }

  async function handleMakePublic() {
    try {
      setStatus("updating access: public…");
      const url = await makeEmergencyPublic(podBaseUrl);
      setStatus(`file is PUBLIC: ${url}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setStatus(`error: ${msg}`);
    }
  }

  async function handleMakePrivate() {
    try {
      setStatus("updating access: private…");
      const url = await makeEmergencyPrivate(podBaseUrl);
      setStatus(`file is PRIVATE (no public read): ${url}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setStatus(`error: ${msg}`);
    }
  }

  if (!ready) return <div style={{ padding: 24 }}>Loading…</div>;

  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        padding: 24,
        maxWidth: 1040,
      }}
    >
      <h1>Solid SORD CDM Demo</h1>

      {!loggedIn ? (
        <>
          <p>You are not logged in.</p>
          <button onClick={onLogin}>Login with Solid</button>
        </>
      ) : (
        <>
          <p>
            <strong>Logged in</strong>
          </p>
          <p>
            Your WebID: <code>{webId}</code>
          </p>
          <button onClick={onLogout}>Logout</button>

          <hr style={{ margin: "24px 0" }} />

          <h3>Pod and file</h3>
          <input
            value={podBaseUrl}
            onChange={(e) => setPodBaseUrl(e.target.value)}
            placeholder="Pod base URL"
            style={{ width: "100%", marginBottom: 16 }}
          />

          <h2>Incident</h2>
          <input
            value={incidentId}
            onChange={(e) => setIncidentId(e.target.value)}
            placeholder="Incident ID"
            style={{ width: "100%", marginBottom: 8 }}
          />
          <input
            value={incidentType}
            onChange={(e) => setIncidentType(e.target.value)}
            placeholder="Incident type"
            style={{ width: "100%", marginBottom: 8 }}
          />
          <input
            value={incidentDate}
            onChange={(e) => setIncidentDate(e.target.value)}
            placeholder="Date (YYYY-MM-DD)"
            style={{ width: "100%", marginBottom: 8 }}
          />
          <input
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="Country"
            style={{ width: "100%", marginBottom: 8 }}
          />
          <input
            value={stateRegion}
            onChange={(e) => setStateRegion(e.target.value)}
            placeholder="State / Region"
            style={{ width: "100%", marginBottom: 8 }}
          />
          <input
            value={town}
            onChange={(e) => setTown(e.target.value)}
            placeholder="Town / City"
            style={{ width: "100%", marginBottom: 8 }}
          />
          <input
            value={village}
            onChange={(e) => setVillage(e.target.value)}
            placeholder="Village"
            style={{ width: "100%", marginBottom: 8 }}
          />
          <input
            value={locationDesc}
            onChange={(e) => setLocationDesc(e.target.value)}
            placeholder="Location description"
            style={{ width: "100%", marginBottom: 8 }}
          />
          <input
            value={gps}
            onChange={(e) => setGps(e.target.value)}
            placeholder="GPS coordinates"
            style={{ width: "100%", marginBottom: 8 }}
          />
          <textarea
            value={incidentDescription}
            onChange={(e) => setIncidentDescription(e.target.value)}
            placeholder="Incident description"
            style={{ width: "100%", marginBottom: 8, height: 80 }}
          />
          <input
            value={medicalImpact}
            onChange={(e) => setMedicalImpact(e.target.value)}
            placeholder="Medical impact"
            style={{ width: "100%", marginBottom: 8 }}
          />
          <input
            value={mentalImpact}
            onChange={(e) => setMentalImpact(e.target.value)}
            placeholder="Mental health impact"
            style={{ width: "100%", marginBottom: 8 }}
          />
          <input
            value={socialImpact}
            onChange={(e) => setSocialImpact(e.target.value)}
            placeholder="Social impact"
            style={{ width: "100%", marginBottom: 8 }}
          />
          <input
            value={violencePerpetrated}
            onChange={(e) => setViolencePerpetrated(e.target.value)}
            placeholder="Violence perpetrated"
            style={{ width: "100%", marginBottom: 8 }}
          />
          <input
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="Reference"
            style={{ width: "100%", marginBottom: 8 }}
          />
          <input
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="Source"
            style={{ width: "100%", marginBottom: 8 }}
          />
          <input
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            placeholder="Time range"
            style={{ width: "100%", marginBottom: 16 }}
          />

          <h2>Victim</h2>
          <input
            value={victimId}
            onChange={(e) => setVictimId(e.target.value)}
            placeholder="Victim ID"
            style={{ width: "100%", marginBottom: 8 }}
          />
          <input
            value={victimCategory}
            onChange={(e) => setVictimCategory(e.target.value)}
            placeholder="Victim category (individual/group)"
            style={{ width: "100%", marginBottom: 8 }}
          />
          <input
            value={victimAge}
            onChange={(e) => setVictimAge(e.target.value)}
            placeholder="Victim age"
            style={{ width: "100%", marginBottom: 8 }}
          />
          <input
            value={victimGender}
            onChange={(e) => setVictimGender(e.target.value)}
            placeholder="Victim gender"
            style={{ width: "100%", marginBottom: 8 }}
          />
          <input
            value={victimMaritalStatus}
            onChange={(e) => setVictimMaritalStatus(e.target.value)}
            placeholder="Marital status"
            style={{ width: "100%", marginBottom: 8 }}
          />
          <input
            value={victimParentalStatus}
            onChange={(e) => setVictimParentalStatus(e.target.value)}
            placeholder="Parental status"
            style={{ width: "100%", marginBottom: 8 }}
          />
          <textarea
            value={victimDescription}
            onChange={(e) => setVictimDescription(e.target.value)}
            placeholder="Victim description"
            style={{ width: "100%", marginBottom: 16, height: 60 }}
          />

          <h2>Perpetrator</h2>
          <input
            value={perpetratorId}
            onChange={(e) => setPerpetratorId(e.target.value)}
            placeholder="Perpetrator ID"
            style={{ width: "100%", marginBottom: 8 }}
          />
          <input
            value={perpetratorCategory}
            onChange={(e) => setPerpetratorCategory(e.target.value)}
            placeholder="Perpetrator category (individual/group)"
            style={{ width: "100%", marginBottom: 8 }}
          />
          <input
            value={perpetratorAge}
            onChange={(e) => setPerpetratorAge(e.target.value)}
            placeholder="Perpetrator age"
            style={{ width: "100%", marginBottom: 8 }}
          />
          <input
            value={perpetratorGender}
            onChange={(e) => setPerpetratorGender(e.target.value)}
            placeholder="Perpetrator gender"
            style={{ width: "100%", marginBottom: 8 }}
          />
          <input
            value={perpetratorAffiliation}
            onChange={(e) => setPerpetratorAffiliation(e.target.value)}
            placeholder="Perpetrator affiliation"
            style={{ width: "100%", marginBottom: 8 }}
          />
          <input
            value={perpetratorNumber}
            onChange={(e) => setPerpetratorNumber(e.target.value)}
            placeholder="Perpetrator record number"
            style={{ width: "100%", marginBottom: 8 }}
          />
          <textarea
            value={perpetratorDescription}
            onChange={(e) => setPerpetratorDescription(e.target.value)}
            placeholder="Perpetrator description"
            style={{ width: "100%", marginBottom: 16, height: 60 }}
          />

          <h2>Organisation and Report</h2>
          <input
            value={organisationId}
            onChange={(e) => setOrganisationId(e.target.value)}
            placeholder="Organisation ID"
            style={{ width: "100%", marginBottom: 8 }}
          />
          <input
            value={inputBy}
            onChange={(e) => setInputBy(e.target.value)}
            placeholder="Input by (name/WebID)"
            style={{ width: "100%", marginBottom: 8 }}
          />
          <input
            value={reportNumber}
            onChange={(e) => setReportNumber(e.target.value)}
            placeholder="Report or situation number"
            style={{ width: "100%", marginBottom: 8 }}
          />
          <input
            value={articleLink}
            onChange={(e) => setArticleLink(e.target.value)}
            placeholder="Article/Publication link"
            style={{ width: "100%", marginBottom: 8 }}
          />
          <input
            value={situationReportLink}
            onChange={(e) => setSituationReportLink(e.target.value)}
            placeholder="Situation report link"
            style={{ width: "100%", marginBottom: 16 }}
          />

          <div
            style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}
          >
            <button onClick={handleSave}>Save to Pod</button>
            <button onClick={handleLoad}>Load from Pod</button>
            <button onClick={handlePreviewRdf}>Preview RDF</button>
            <button onClick={handleMakePublic}>Make Public</button>
            <button onClick={handleMakePrivate}>Make Private</button>
          </div>

          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>
            {status}
          </div>

          {loadedEntry && (
            <div
              style={{
                marginTop: 12,
                padding: 12,
                border: "1px solid #e5e7eb",
                borderRadius: 6,
                background: "#fafafa",
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 6 }}>
                Loaded from Pod
              </div>
              <div>Incident ID: {loadedEntry.incidentId || "—"}</div>
              <div>Incident type: {loadedEntry.incidentType || "—"}</div>
              <div>Date: {loadedEntry.date || "—"}</div>
              <div>Country: {loadedEntry.country || "—"}</div>
              <div>State/Region: {loadedEntry.state || "—"}</div>
              <div>Town: {loadedEntry.town || "—"}</div>
              <div>Village: {loadedEntry.village || "—"}</div>
              <div>Location: {loadedEntry.location || "—"}</div>
              <div>GPS: {loadedEntry.gps || "—"}</div>
              <div>Description: {loadedEntry.description || "—"}</div>
              <div>Medical impact: {loadedEntry.medicalImpact || "—"}</div>
              <div>
                Mental health impact: {loadedEntry.mentalhealthImpact || "—"}
              </div>
              <div>Social impact: {loadedEntry.socialImpact || "—"}</div>
              <div>
                Violence perpetrated: {loadedEntry.violencePerpetrated || "—"}
              </div>
              <div>Reference: {loadedEntry.reference || "—"}</div>
              <div>Source: {loadedEntry.source || "—"}</div>
              <div>Time range: {loadedEntry.timeRange || "—"}</div>
              <div>Victim ID: {loadedEntry.victimId || "—"}</div>
              <div>Victim category: {loadedEntry.victimCategory || "—"}</div>
              <div>Victim age: {loadedEntry.victimAge || "—"}</div>
              <div>Victim gender: {loadedEntry.victimGender || "—"}</div>
              <div>
                Marital status: {loadedEntry.victimMaritalStatus || "—"}
              </div>
              <div>
                Parental status: {loadedEntry.victimParentalStatus || "—"}
              </div>
              <div>
                Victim description: {loadedEntry.victimDescription || "—"}
              </div>
              <div>Perpetrator ID: {loadedEntry.perpetratorId || "—"}</div>
              <div>
                Perpetrator category: {loadedEntry.perpetratorCategory || "—"}
              </div>
              <div>Perpetrator age: {loadedEntry.perpetratorAge || "—"}</div>
              <div>
                Perpetrator gender: {loadedEntry.perpetratorGender || "—"}
              </div>
              <div>
                Perpetrator affiliation:{" "}
                {loadedEntry.perpetratorAffiliation || "—"}
              </div>
              <div>
                Perpetrator number: {loadedEntry.perpetratorNumber || "—"}
              </div>
              <div>
                Perpetrator description:{" "}
                {loadedEntry.perpetratorDescription || "—"}
              </div>
              <div>Organisation ID: {loadedEntry.organisationId || "—"}</div>
              <div>Input by: {loadedEntry.inputBy || "—"}</div>
              <div>Report number: {loadedEntry.reportNumber || "—"}</div>
              <div>Article link: {loadedEntry.articleLink || "—"}</div>
              <div>
                Situation report link: {loadedEntry.situationReportLink || "—"}
              </div>
            </div>
          )}

          {rawRdf && (
            <pre
              style={{
                whiteSpace: "pre-wrap",
                background: "#f6f8fa",
                padding: 12,
                borderRadius: 6,
                marginTop: 12,
              }}
            >
              {rawRdf}
            </pre>
          )}
        </>
      )}

      <hr style={{ margin: "24px 0" }} />
      <p>
        This demo stores one Incident, Victim and related CDM fields as RDF in
        your Solid Pod, following the SORD Common Data Model.
      </p>
    </div>
  );
}
