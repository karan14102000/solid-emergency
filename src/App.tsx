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
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bloodType, setBloodType] = useState("");
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
      } catch {
        // Ignore if auto-detect fails
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
    setRawRdf("");
    setLoadedEntry(null);
    setStatus("");
    setName("");
    setPhone("");
    setBloodType("");
  }

  async function handleSave() {
    try {
      setStatus("saving…");
      const url = await saveEmergencyData(podBaseUrl, {
        name,
        phone,
        bloodType,
      });
      setStatus(`saved: ${url}`);
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
        maxWidth: 750,
      }}
    >
      <h1>Solid Emergency App</h1>

      {!loggedIn ? (
        <>
          <p>You are not logged in.</p>
          <button onClick={onLogin}>Login with Solid</button>
        </>
      ) : (
        <>
          <p>
            <strong>Logged in!</strong>
          </p>
          <p>
            Your WebID: <code>{webId}</code>
          </p>
          <button onClick={onLogout}>Logout</button>

          <hr style={{ margin: "24px 0" }} />

          <h3>Emergency info</h3>
          <input
            value={podBaseUrl}
            onChange={(e) => setPodBaseUrl(e.target.value)}
            placeholder="Pod base URL (e.g. https://yourpod.example/)"
            style={{ width: "100%", marginBottom: 8 }}
          />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            style={{ width: "100%", marginBottom: 8 }}
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone"
            style={{ width: "100%", marginBottom: 8 }}
          />
          <input
            value={bloodType}
            onChange={(e) => setBloodType(e.target.value)}
            placeholder="Blood type (e.g. O+)"
            style={{ width: "100%", marginBottom: 8 }}
          />

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
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
                Loaded entry
              </div>
              <div>Name: {loadedEntry.name || "—"}</div>
              <div>Phone: {loadedEntry.phone || "—"}</div>
              <div>Blood type: {loadedEntry.bloodType || "—"}</div>
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
        After login, we complete the redirect and restore your session
        automatically.
      </p>
    </div>
  );
}
