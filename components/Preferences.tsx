"use client";
import { useRef, useState } from "react";
import type { Learner } from "@noetherwake/engine";
import { catalog, goals } from "@/lib/catalog";
import { parseImport } from "@/lib/store";
export default function Preferences({
  state,
  onChange,
  onExport,
  onImport,
  onClear,
  onPlacement,
  offlineReady,
  storageError,
}: {
  state: Learner;
  onChange: (s: Learner) => void;
  onExport: () => void;
  onImport: (s: Learner) => Promise<void>;
  onClear: () => Promise<void>;
  onPlacement: () => void;
  offlineReady: boolean;
  storageError: string;
}) {
  const [preview, setPreview] = useState<{
      state: Learner;
      name: string;
    } | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [confirming, setConfirming] = useState(false),
    [word, setWord] = useState(""),
    file = useRef<HTMLInputElement>(null);
  async function readFile(f?: File) {
    setError("");
    setPreview(null);
    if (!f) return;
    try {
      const parsed = parseImport(
        await f.text(),
        new Set(catalog.map((c) => c.id)),
      );
      setPreview({ state: parsed, name: f.name });
    } catch (e) {
      setError(
        `Import did not change your progress: ${e instanceof Error ? e.message : "Invalid file"}`,
      );
    }
    if (file.current) file.current.value = "";
  }
  return (
    <div className="preferences-page">
      <header className="standard-heading">
        <h1>Preferences</h1>
        <p>Your environment and your data.</p>
      </header>
      <section className="preference-section">
        <h2>Reading and practice</h2>
        <div className="preference-row">
          <div>
            <h3>Appearance</h3>
            <p>Light paper, dark blueprint, or your device setting.</p>
          </div>
          <fieldset className="setting-options">
            <legend className="sr-only">Appearance</legend>
            {(["system", "light", "dark"] as const).map((theme) => (
              <button
                key={theme}
                aria-pressed={state.theme === theme}
                onClick={() => onChange({ ...state, theme })}
              >
                {theme[0].toUpperCase() + theme.slice(1)}
              </button>
            ))}
          </fieldset>
        </div>
        <label className="preference-row">
          <span>
            <strong>Accessible reading font</strong>
            <span className="setting-description">
              Use the interface typeface for lesson prose, with more spacing.
            </span>
          </span>
          <input
            type="checkbox"
            checked={state.accessibleFont}
            onChange={(e) =>
              onChange({ ...state, accessibleFont: e.target.checked })
            }
          />
        </label>
        <div className="preference-row">
          <label htmlFor="session-length">
            <strong>Default session length</strong>
            <span className="setting-description">
              The session budget. Unfinished responses are kept open.
            </span>
          </label>
          <select
            id="session-length"
            value={state.minutes}
            onChange={(e) =>
              onChange({
                ...state,
                minutes: Number(e.target.value) as 5 | 15 | 30,
              })
            }
          >
            <option value="5">5 minutes</option>
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
          </select>
        </div>
        <div className="preference-row">
          <label htmlFor="goal-setting">
            <strong>Active route</strong>
            <span className="setting-description">
              Recommendations follow the route and your evidence.
            </span>
          </label>
          <select
            id="goal-setting"
            value={state.goal}
            onChange={(e) => onChange({ ...state, goal: e.target.value })}
          >
            {goals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>
        </div>
        <button className="secondary" onClick={onPlacement}>
          Revisit placement →
        </button>
      </section>
      <section className="preference-section data-section">
        <h2>Your data</h2>
        <p>
          Everything is stored on this device in your browser. Nothing is sent
          anywhere.
        </p>
        <div className="data-action">
          <h3>Export</h3>
          <p>
            Evidence, answers, session reflections, and preferences. Export a
            backup before clearing browser storage.
          </p>
          <button className="primary" onClick={onExport}>
            Export JSON
          </button>
        </div>
        <div className="data-action">
          <h3>Import</h3>
          <p>
            A valid backup replaces the learner data on this device. It is
            validated before anything is changed.
          </p>
          <label className="file-chooser">
            <span>Choose a JSON backup</span>
            <input
              ref={file}
              type="file"
              accept="application/json,.json"
              onChange={(e) => void readFile(e.target.files?.[0])}
            />
          </label>
          {error && (
            <p className="data-error" role="status" aria-live="polite">
              {error}
            </p>
          )}
          {preview && (
            <section
              className="import-preview"
              aria-labelledby="import-preview-title"
            >
              <h3 id="import-preview-title">Import preview</h3>
              <dl>
                <div>
                  <dt>File</dt>
                  <dd>{preview.name}</dd>
                </div>
                <div>
                  <dt>Schema version</dt>
                  <dd>{preview.state.version}</dd>
                </div>
                <div>
                  <dt>Recorded answers</dt>
                  <dd>{preview.state.history.length}</dd>
                </div>
                <div>
                  <dt>Concept records</dt>
                  <dd>{Object.keys(preview.state.knowledge).length}</dd>
                </div>
                <div>
                  <dt>Sessions</dt>
                  <dd>{preview.state.sessions.length}</dd>
                </div>
                <div>
                  <dt>Route</dt>
                  <dd>
                    {goals.find((g) => g.id === preview.state.goal)?.title ??
                      preview.state.goal}
                  </dd>
                </div>
              </dl>
              <p>
                This replaces {state.history.length} answers,{" "}
                {state.sessions.length} sessions, all stored concept estimates,
                and your current preferences.
              </p>
              <div className="actions">
                <button
                  className="primary"
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true);
                    try {
                      await onImport(preview.state);
                      setPreview(null);
                    } catch (e) {
                      setError(
                        e instanceof Error
                          ? e.message
                          : "The backup could not be saved.",
                      );
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  {busy ? "Saving…" : "Import and replace"}
                </button>
                <button
                  className="quiet"
                  disabled={busy}
                  onClick={() => setPreview(null)}
                >
                  Cancel
                </button>
              </div>
            </section>
          )}
        </div>
        <div className="storage-status">
          <p>
            {storageError
              ? "Device storage is unavailable. Export before closing."
              : "Stored in IndexedDB"}
          </p>
          <p>
            {offlineReady ? "Offline copy ready" : "Offline copy not ready"}
          </p>
        </div>
        <div className="data-action clear-data">
          <h3>Clear local data</h3>
          <p>
            This removes the learner records in this browser. The offline
            application remains available.
          </p>
          {!confirming ? (
            <button
              className="text-button destructive"
              onClick={() => setConfirming(true)}
            >
              Clear local data
            </button>
          ) : (
            <section
              className="clear-confirmation"
              aria-label="Clear data confirmation"
            >
              <p>
                {state.history.length} answers, {state.sessions.length}{" "}
                sessions, and {Object.keys(state.knowledge).length} concept
                records will be removed, along with notes and preferences.
              </p>
              <label className="field-label" htmlFor="delete-word">
                Type delete to confirm
              </label>
              <input
                id="delete-word"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                autoComplete="off"
              />
              <div className="actions">
                <button
                  className="destructive"
                  disabled={word !== "delete" || busy}
                  onClick={async () => {
                    setBusy(true);
                    try {
                      await onClear();
                      setWord("");
                      setConfirming(false);
                    } catch (e) {
                      setError(
                        e instanceof Error
                          ? e.message
                          : "The data could not be cleared.",
                      );
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  Delete local data
                </button>
                <button
                  className="quiet"
                  onClick={() => {
                    setConfirming(false);
                    setWord("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </section>
          )}
        </div>
      </section>
    </div>
  );
}
