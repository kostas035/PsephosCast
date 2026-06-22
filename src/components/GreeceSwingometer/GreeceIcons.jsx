
export const IconGear = ({ size=12 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>);
export const IconColumns = ({ size=14 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="8" height="18" rx="1"/><rect x="13" y="3" width="8" height="18" rx="1"/></svg>);
export const IconPeople = ({ size=14 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>);
export const IconChevron = ({ dir="up", size=10 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">{dir==="up"?<polyline points="18 15 12 9 6 15"/>:<polyline points="6 9 12 15 18 9"/>}</svg>);
export const IconZoomReset = ({ size=12 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>);
export const IconEye = ({ size=12 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>);
export const IconEyeOff = ({ size=12 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>);
export const IconSun = ({ size=14 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>);
export const IconMoon = ({ size=14 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>);
export const IconTrash = ({ size=12 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>);
export const IconPlus = ({ size=12 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>);
export const IconArrowLeft = ({ size=14 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>);
export const IconCamera = ({ size=14 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>);
export const IconPalette = ({ size=14 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>);
export const IconCheck = ({ size=12 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>);

// ───────────────────────────────────────────────────────────────────────────
//  Added icons — replacements for the emoji glyphs used across the Greece app
//  and the Correlations engine. All inherit colour via `currentColor` and
//  share the 2px round-stroke language of the originals (except the two flags,
//  which carry their official colours).
// ───────────────────────────────────────────────────────────────────────────

// Classical / parliament building (was 🏛️)
export const IconBuilding = ({ size=14 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3 2 8h20L12 3z"/><line x1="3" y1="11" x2="21" y2="11"/><line x1="5" y1="11" x2="5" y2="19"/><line x1="9.5" y1="11" x2="9.5" y2="19"/><line x1="14.5" y1="11" x2="14.5" y2="19"/><line x1="19" y1="11" x2="19" y2="19"/><line x1="3" y1="19" x2="21" y2="19"/><line x1="2" y1="22" x2="22" y2="22"/></svg>);

// Calendar (was 📅 — Pick a scenario)
export const IconCalendar = ({ size=14 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>);

// Sliders (was 🎚️ — Change the vote)
export const IconSliders = ({ size=14 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>);

// Padlock (was 🔒 — Lock a party)
export const IconLock = ({ size=14 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>);

// Pencil (was ✏️ — Edit parties)
export const IconPencil = ({ size=14 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>);

// Balance scale (was ⚖️ — Electoral threshold)
export const IconScale = ({ size=14 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="3" x2="12" y2="21"/><line x1="5" y1="7" x2="19" y2="7"/><path d="M5 7 2 13a3 3 0 0 0 6 0L5 7z"/><path d="M19 7l-3 6a3 3 0 0 0 6 0l-3-6z"/><line x1="7" y1="21" x2="17" y2="21"/></svg>);

// Refresh / reset (was 🔄 — Reset)
export const IconRefresh = ({ size=14 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"/><path d="M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>);

// Folded map (was 🗺️ — Hover any district)
export const IconMap = ({ size=14 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>);

// Bar chart (was 📊 — Results table / XLSX / empty state)
export const IconBarChart = ({ size=14 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="21" x2="21" y2="21"/><line x1="6" y1="21" x2="6" y2="13"/><line x1="12" y1="21" x2="12" y2="5"/><line x1="18" y1="21" x2="18" y2="9"/></svg>);

// Line / trend chart (was 📈 — Metric cards)
export const IconLineChart = ({ size=14 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 17 9 11 13 15 21 7"/><polyline points="15 7 21 7 21 13"/></svg>);

// Die (was 🎲 — Monte Carlo forecast)
export const IconDice = ({ size=14 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><line x1="8" y1="8" x2="8.01" y2="8"/><line x1="16" y1="8" x2="16.01" y2="8"/><line x1="12" y1="12" x2="12.01" y2="12"/><line x1="8" y1="16" x2="8.01" y2="16"/><line x1="16" y1="16" x2="16.01" y2="16"/></svg>);

// Handshake (was 🤝 — Coalition builder)
export const IconHandshake = ({ size=14 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/><path d="m21 3 1 11h-2"/><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/><path d="M3 4h8"/></svg>);

// Newspaper (was 📰 — Opinion polls)
export const IconNewspaper = ({ size=14 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8z"/></svg>);

// Contrast / appearance (was 🌗 — Theme & colours)
export const IconContrast = ({ size=14 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20z" fill="currentColor" stroke="none"/></svg>);

// Ruler (was 📐 — Methodology)
export const IconRuler = ({ size=14 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0z"/><path d="m14.5 12.5 2-2"/><path d="m11.5 9.5 2-2"/><path d="m8.5 6.5 2-2"/><path d="m17.5 15.5 2-2"/></svg>);

// Close / dismiss (was ✕)
export const IconClose = ({ size=14 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>);

// Elderly person + cane (was 👴 — Age 65+)
export const IconElder = ({ size=14 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="4" r="2.5"/><path d="M9 6.5v5"/><path d="M9 11.5 7 21"/><path d="M9 11.5 11 21"/><path d="M9 8l3.5 1.5"/><path d="M13.5 9.5V21"/><path d="M13.5 9.5h2"/></svg>);

// Graduation cap (was 🎓 — Tertiary Education)
export const IconGraduation = ({ size=14 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1 2.7 3 6 3s6-2 6-3v-5"/><line x1="22" y1="10" x2="22" y2="15"/></svg>);

// Briefcase (was 💼 — Unemployment)
export const IconBriefcase = ({ size=14 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><line x1="2" y1="13" x2="22" y2="13"/></svg>);

// Globe (was 🌐 — Foreign Citizens)
export const IconGlobe = ({ size=14 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>);

// City skyline (was 🏙️ — Urbanisation)
export const IconCityscape = ({ size=14 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="2" y1="21" x2="22" y2="21"/><rect x="3" y="11" width="5" height="10"/><rect x="9.5" y="5" width="5" height="16"/><rect x="16" y="14" width="5" height="7"/></svg>);

// Ballot box (was 🗳️ — Turnout Rate)
export const IconBallot = ({ size=14 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="12" width="18" height="9" rx="1"/><rect x="8" y="3" width="8" height="9" rx="1"/><polyline points="10 7 11.3 8.3 14 5.5"/><line x1="9" y1="12" x2="15" y2="12"/></svg>);

// Island + palm (was 🏝️ — Is Island)
export const IconIsland = ({ size=14 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19c0-1.7 3.6-2.6 8-2.6s8 .9 8 2.6-3.6 2.6-8 2.6-8-.9-8-2.6z"/><path d="M12 16.4V8"/><path d="M12 8C10.5 5.5 7.5 5.5 6 7"/><path d="M12 8c1.5-2.5 4.5-2.5 6-1"/><path d="M12 8c-.7-2.5.8-4.5 2.8-5"/></svg>);

// Office tower (was 🏢 — Is Urban Center)
export const IconOffice = ({ size=14 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="1"/><line x1="9" y1="6" x2="9.01" y2="6"/><line x1="14" y1="6" x2="14.01" y2="6"/><line x1="9" y1="10" x2="9.01" y2="10"/><line x1="14" y1="10" x2="14.01" y2="10"/><line x1="9" y1="14" x2="9.01" y2="14"/><line x1="14" y1="14" x2="14.01" y2="14"/><path d="M10 22v-4h4v4"/></svg>);

// Microscope (was 🔬 — Analysis engine header)
export const IconMicroscope = ({ size=14 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h2"/><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2z"/><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/></svg>);

// Rocket (was 🚀 — Run Analytics)
export const IconRocket = ({ size=14 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91 0z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>);

// Clipboard (was 📋 — PDF report)
export const IconClipboard = ({ size=14 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>);

// Document with text (was 📝 — Word/DOCX export)
export const IconDocument = ({ size=14 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>);

// Database / archive (was 🗄️ — CSV matrix)
export const IconDatabase = ({ size=14 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 5v6c0 1.66-4 3-9 3s-9-1.34-9-3V5"/><path d="M21 11v6c0 1.66-4 3-9 3s-9-1.34-9-3v-6"/></svg>);

// ── Flags (official colours, not currentColor) ──────────────────────────────

// Hellenic Republic flag (was 🇬🇷)
export const IconFlagGR = ({ size=20 }) => (<svg width={size} height={size*0.667} viewBox="0 0 27 18" xmlns="http://www.w3.org/2000/svg"><defs><clipPath id="grflag"><rect width="27" height="18" rx="2"/></clipPath></defs><g clipPath="url(#grflag)"><rect width="27" height="18" fill="#0D5EAF"/><rect y="2" width="27" height="2" fill="#fff"/><rect y="6" width="27" height="2" fill="#fff"/><rect y="10" width="27" height="2" fill="#fff"/><rect y="14" width="27" height="2" fill="#fff"/><rect width="10" height="10" fill="#0D5EAF"/><rect x="4" width="2" height="10" fill="#fff"/><rect y="4" width="10" height="2" fill="#fff"/></g><rect width="27" height="18" rx="2" fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="1"/></svg>);

// Republic of Cyprus flag (was 🇨🇾) — white field, copper island, olive branches
export const IconFlagCY = ({ size=20 }) => (<svg width={size} height={size*0.667} viewBox="0 0 27 18" xmlns="http://www.w3.org/2000/svg"><defs><clipPath id="cyflag"><rect width="27" height="18" rx="2"/></clipPath></defs><g clipPath="url(#cyflag)"><rect width="27" height="18" fill="#fff"/><path d="M7 7.5c1.5-1 4-1.2 6-.6 1.6.5 3.2.3 4.8.8 1.1.3 2 .2 2.7.9.4.4-.1.9-.7.9-1.4 0-2.3.5-3.6.5-1.7 0-3.2-.5-4.9-.4-1.3.1-2.6.5-3.9.2-.7-.2-1.2-.7-1.2-1.4 0-.6.4-1.1 1-1.3z" fill="#D47600"/><path d="M9.5 11.2c1.2.6 2.6.7 4 .6" fill="none" stroke="#4E9A06" strokeWidth="0.9" strokeLinecap="round"/><path d="M13.5 11.2c1.2.6 2.6.7 4 .6" fill="none" stroke="#4E9A06" strokeWidth="0.9" strokeLinecap="round"/><circle cx="10" cy="11" r="0.7" fill="#4E9A06"/><circle cx="11.6" cy="11.6" r="0.7" fill="#4E9A06"/><circle cx="15.4" cy="11.6" r="0.7" fill="#4E9A06"/><circle cx="17" cy="11" r="0.7" fill="#4E9A06"/></g><rect width="27" height="18" rx="2" fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="1"/></svg>);
