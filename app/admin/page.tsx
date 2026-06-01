'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import BackgroundCarousel from '@/components/BackgroundCarousel';
import Countdown from '@/components/Countdown';
import FlybyWindow from '@/components/FlybyWindow';
import {
  CountdownConfig,
  DEFAULT_CONFIG,
  isoToLocalInput,
  loadConfig,
  localInputToIso,
  saveConfig,
} from '@/lib/config';
import { fileToDataUrl } from '@/lib/imageUpload';

function formatSaveError(err: unknown) {
  return err instanceof Error
    ? `Could not save: ${err.message}. Try removing a few uploaded images.`
    : 'Could not save changes.';
}

export default function AdminPage() {
  const [draft, setDraft] = useState<CountdownConfig>(DEFAULT_CONFIG);
  const [hydrated, setHydrated] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [pwInput, setPwInput] = useState('');
  const [pwError, setPwError] = useState('');
  const [savedFlash, setSavedFlash] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const backgroundAutosaveReadyRef = useRef(false);

  // Hydrate from localStorage
  useEffect(() => {
    const cfg = loadConfig();
    setDraft(cfg);
    setHydrated(true);
    // If admin password is empty, skip the lock
    if (!cfg.adminPassword) setUnlocked(true);
  }, []);

  // Background changes are visually applied immediately in admin, so persist
  // them immediately too. This keeps the main countdown page using the same
  // uploaded photos without requiring a separate save click.
  useEffect(() => {
    if (!hydrated) return;
    if (!backgroundAutosaveReadyRef.current) {
      backgroundAutosaveReadyRef.current = true;
      return;
    }

    try {
      saveConfig({
        ...loadConfig(),
        backgroundImages: draft.backgroundImages,
        backgroundIntervalMs: draft.backgroundIntervalMs,
      });
      setUploadError('');
    } catch (err) {
      setUploadError(formatSaveError(err));
    }
  }, [draft.backgroundImages, draft.backgroundIntervalMs, hydrated]);

  const update = <K extends keyof CountdownConfig>(
    key: K,
    value: CountdownConfig[K],
  ) => setDraft((d) => ({ ...d, [key]: value }));

  const handleSave = () => {
    try {
      saveConfig(draft);
      setSavedFlash(true);
      setUploadError('');
      setTimeout(() => setSavedFlash(false), 1800);
    } catch (err) {
      // Most often: localStorage quota exceeded because of large images.
      setUploadError(formatSaveError(err));
    }
  };

  const handleReset = () => {
    if (!confirm('Reset all countdown settings to defaults?')) return;
    setDraft(DEFAULT_CONFIG);
    saveConfig(DEFAULT_CONFIG);
  };

  const addImage = () => update('backgroundImages', [...draft.backgroundImages, '']);
  const removeImage = (i: number) =>
    update(
      'backgroundImages',
      draft.backgroundImages.filter((_, idx) => idx !== i),
    );
  const setImageAt = (i: number, value: string) =>
    update(
      'backgroundImages',
      draft.backgroundImages.map((v, idx) => (idx === i ? value : v)),
    );

  // Append one or more uploaded files to the backgrounds list.
  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError('');
    try {
      const dataUrls = await Promise.all(
        Array.from(files).map((f) => fileToDataUrl(f)),
      );
      setDraft((d) => ({
        ...d,
        backgroundImages: [...d.backgroundImages, ...dataUrls],
      }));
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : 'Could not read that image.',
      );
    } finally {
      setUploading(false);
    }
  };

  // Replace the image at index `i` with a single uploaded file.
  const handleReplace = async (i: number, file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const dataUrl = await fileToDataUrl(file);
      setDraft((d) => ({
        ...d,
        backgroundImages: d.backgroundImages.map((v, idx) =>
          idx === i ? dataUrl : v,
        ),
      }));
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : 'Could not read that image.',
      );
    } finally {
      setUploading(false);
    }
  };

  if (!hydrated) return null;

  // Lock screen
  if (!unlocked) {
    return (
      <main className="relative min-h-screen w-full overflow-hidden flex items-center justify-center px-5">
        <BackgroundCarousel
          images={draft.backgroundImages}
          intervalMs={draft.backgroundIntervalMs}
        />
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="glass rounded-3xl p-8 md:p-10 w-full max-w-md text-center"
        >
          <div className="text-[10px] uppercase tracking-[0.4em] text-white/65">
            Restricted
          </div>
          <h1 className="font-display text-3xl md:text-4xl shimmer-text mt-2">
            Admin sign-in
          </h1>
          <p className="font-serif italic text-white/70 mt-2">
            Whisper the password.
          </p>
          <form
            className="mt-6 flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (pwInput === draft.adminPassword) {
                setUnlocked(true);
                setPwError('');
              } else {
                setPwError('That is not the password.');
              }
            }}
          >
            <input
              type="password"
              className="field text-center tracking-[0.3em]"
              placeholder="••••••••"
              value={pwInput}
              onChange={(e) => setPwInput(e.target.value)}
              autoFocus
            />
            {pwError && (
              <div className="text-rose-glow text-sm">{pwError}</div>
            )}
            <button type="submit" className="btn-primary mt-2">
              Unlock
            </button>
            <Link
              href="/"
              className="text-white/60 hover:text-white text-xs uppercase tracking-[0.3em] mt-2"
            >
              ← Back to countdown
            </Link>
          </form>
          <p className="text-white/40 text-[11px] mt-6">
            Default password is{' '}
            <code className="text-white/70">ziadan</code> — change it below
            after signing in.
          </p>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      <BackgroundCarousel
        images={draft.backgroundImages}
        intervalMs={draft.backgroundIntervalMs}
      />

      <div className="relative z-10 px-5 py-10 md:py-14 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap mb-10">
          <div>
            <div className="text-[10px] uppercase tracking-[0.4em] text-white/65">
              Settings
            </div>
            <h1 className="font-display text-4xl md:text-5xl shimmer-text">
              Admin
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="btn-ghost text-xs uppercase tracking-[0.3em]">
              ← View countdown
            </Link>
            <button onClick={handleReset} className="btn-ghost text-xs uppercase tracking-[0.3em]">
              Reset
            </button>
            <button onClick={handleSave} className="btn-primary text-sm">
              {savedFlash ? 'Saved ♥' : 'Save changes'}
            </button>
          </div>
        </div>

        {/* Live preview */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="glass rounded-[2rem] p-6 md:p-10 mb-10"
        >
          <div className="text-[10px] uppercase tracking-[0.4em] text-white/65 mb-4 text-center">
            Live preview
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="font-display text-3xl md:text-5xl shimmer-text text-center">
              {draft.title}
            </div>
            <div className="font-serif italic text-white/75 text-center max-w-2xl">
              {draft.subtitle}
            </div>
            <div className="mt-5">
              <Countdown target={draft.reunionDate} size="md" reachedText="The wait is over. ♥" />
            </div>
          </div>
          {draft.flybyEnabled && (
            <div className="mt-8">
              <FlybyWindow
                label={draft.flybyLabel}
                startIso={draft.flybyStart}
                endIso={draft.flybyEnd}
              />
            </div>
          )}
        </motion.section>

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Identity */}
          <section className="glass rounded-3xl p-6 md:p-8">
            <h2 className="font-display text-2xl mb-1">Identity</h2>
            <p className="text-white/60 text-sm mb-5 font-serif italic">
              Who is this for?
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">His name</label>
                <input
                  className="field"
                  value={draft.hisName}
                  onChange={(e) => update('hisName', e.target.value)}
                />
              </div>
              <div>
                <label className="label">Her name</label>
                <input
                  className="field"
                  value={draft.herName}
                  onChange={(e) => update('herName', e.target.value)}
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="label">Title</label>
              <input
                className="field"
                value={draft.title}
                onChange={(e) => update('title', e.target.value)}
              />
            </div>
            <div className="mt-4">
              <label className="label">Subtitle</label>
              <input
                className="field"
                value={draft.subtitle}
                onChange={(e) => update('subtitle', e.target.value)}
              />
            </div>
            <div className="mt-4">
              <label className="label">Love note</label>
              <textarea
                className="field min-h-[110px] resize-y"
                value={draft.message}
                onChange={(e) => update('message', e.target.value)}
              />
            </div>
          </section>

          {/* Primary reunion countdown */}
          <section className="glass rounded-3xl p-6 md:p-8">
            <h2 className="font-display text-2xl mb-1">Reunion countdown</h2>
            <p className="text-white/60 text-sm mb-5 font-serif italic">
              When the distance becomes zero.
            </p>
            <div>
              <label className="label">Label</label>
              <input
                className="field"
                value={draft.reunionLabel}
                onChange={(e) => update('reunionLabel', e.target.value)}
              />
            </div>
            <div className="mt-4">
              <label className="label">Reunion date &amp; time</label>
              <input
                type="datetime-local"
                className="field"
                value={isoToLocalInput(draft.reunionDate)}
                onChange={(e) =>
                  update('reunionDate', localInputToIso(e.target.value))
                }
              />
            </div>
            <div className="mt-5 hairline w-full" />
            <div className="mt-5 flex items-center justify-between">
              <div>
                <h3 className="font-display text-xl">Flyby window</h3>
                <p className="text-white/60 text-sm font-serif italic">
                  A range of dates she might fly down.
                </p>
              </div>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={draft.flybyEnabled}
                  onChange={(e) => update('flybyEnabled', e.target.checked)}
                />
                <span
                  className={`w-11 h-6 rounded-full relative transition-colors ${
                    draft.flybyEnabled ? 'bg-rose-deep' : 'bg-white/15'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      draft.flybyEnabled ? 'translate-x-5' : ''
                    }`}
                  />
                </span>
                <span className="text-sm text-white/75">
                  {draft.flybyEnabled ? 'On' : 'Off'}
                </span>
              </label>
            </div>
            {draft.flybyEnabled && (
              <div className="mt-4 grid grid-cols-1 gap-4">
                <div>
                  <label className="label">Window label</label>
                  <input
                    className="field"
                    value={draft.flybyLabel}
                    onChange={(e) => update('flybyLabel', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Earliest possible</label>
                    <input
                      type="datetime-local"
                      className="field"
                      value={isoToLocalInput(draft.flybyStart)}
                      onChange={(e) =>
                        update('flybyStart', localInputToIso(e.target.value))
                      }
                    />
                  </div>
                  <div>
                    <label className="label">Latest possible</label>
                    <input
                      type="datetime-local"
                      className="field"
                      value={isoToLocalInput(draft.flybyEnd)}
                      onChange={(e) =>
                        update('flybyEnd', localInputToIso(e.target.value))
                      }
                    />
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Background images */}
          <section
            className="glass rounded-3xl p-6 md:p-8 md:col-span-2"
            onDragOver={(e) => {
              e.preventDefault();
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files?.length) {
                handleUpload(e.dataTransfer.files);
              }
            }}
          >
            <div className="flex items-center justify-between flex-wrap gap-3 mb-1">
              <h2 className="font-display text-2xl">Background images</h2>
              <div className="flex items-center gap-2">
                <input
                  ref={uploadInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    handleUpload(e.target.files);
                    // Reset so selecting the same file again still triggers change.
                    e.target.value = '';
                  }}
                />
                <button
                  onClick={() => uploadInputRef.current?.click()}
                  className="btn-ghost text-xs uppercase tracking-[0.3em]"
                  disabled={uploading}
                >
                  {uploading ? 'Uploading…' : '↑ Upload'}
                </button>
                <button onClick={addImage} className="btn-ghost text-xs uppercase tracking-[0.3em]">
                  + Add URL
                </button>
              </div>
            </div>
            <p className="text-white/60 text-sm mb-3 font-serif italic">
              Upload photos from your device, paste any image URL, or drag-and-drop
              images right onto this card. They save automatically and cross-fade
              behind the countdown.
            </p>
            {uploadError && (
              <div className="text-rose-glow text-sm mb-3">{uploadError}</div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {draft.backgroundImages.map((url, i) => {
                const isUploaded = url.startsWith('data:');
                return (
                  <div key={i} className="glass-soft rounded-2xl p-3 flex flex-col gap-3">
                    <div
                      className="h-32 rounded-xl bg-white/5 bg-cover bg-center border border-white/10 relative"
                      style={{
                        backgroundImage: url ? `url(${url})` : 'none',
                      }}
                    >
                      {!url && (
                        <div className="h-full flex items-center justify-center text-white/40 text-xs uppercase tracking-[0.3em]">
                          empty
                        </div>
                      )}
                      {isUploaded && (
                        <div className="absolute top-1 left-1 text-[9px] uppercase tracking-[0.3em] bg-black/40 text-white/80 rounded-full px-2 py-0.5">
                          Uploaded
                        </div>
                      )}
                    </div>
                    <input
                      className="field text-xs"
                      placeholder="https://..."
                      value={isUploaded ? '' : url}
                      disabled={isUploaded}
                      onChange={(e) => setImageAt(i, e.target.value)}
                    />
                    <div className="flex items-center gap-2">
                      <label className="btn-ghost text-[11px] uppercase tracking-[0.3em] flex-1 text-center cursor-pointer">
                        Replace
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            handleReplace(i, e.target.files?.[0]);
                            e.target.value = '';
                          }}
                        />
                      </label>
                      <button
                        onClick={() => removeImage(i)}
                        className="btn-ghost text-[11px] uppercase tracking-[0.3em] flex-1"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-5">
              <label className="label">Rotation interval (seconds)</label>
              <input
                type="number"
                min={2}
                max={120}
                className="field max-w-[180px]"
                value={Math.round(draft.backgroundIntervalMs / 1000)}
                onChange={(e) =>
                  update(
                    'backgroundIntervalMs',
                    Math.max(2000, Number(e.target.value) * 1000),
                  )
                }
              />
            </div>
          </section>

          {/* Security */}
          <section className="glass rounded-3xl p-6 md:p-8 md:col-span-2">
            <h2 className="font-display text-2xl mb-1">Security</h2>
            <p className="text-white/60 text-sm mb-5 font-serif italic">
              Light protection — the admin password is stored in your browser.
            </p>
            <div className="max-w-md">
              <label className="label">Admin password</label>
              <input
                type="text"
                className="field"
                value={draft.adminPassword}
                onChange={(e) => update('adminPassword', e.target.value)}
              />
            </div>
          </section>
        </div>

        {/* Sticky save bar */}
        <div className="sticky bottom-5 mt-10 flex justify-center">
          <div className="glass rounded-full px-3 py-2 flex items-center gap-3">
            <span className="text-xs text-white/65 px-2 hidden sm:inline">
              {savedFlash ? 'All saved ♥' : 'Changes are local to this device.'}
            </span>
            <button onClick={handleReset} className="btn-ghost text-xs uppercase tracking-[0.3em]">
              Reset
            </button>
            <button onClick={handleSave} className="btn-primary text-sm">
              {savedFlash ? 'Saved ♥' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
