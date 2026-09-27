// Inline SVG icon sprite. Rendered once in the root layout; icons reference it via <use>.
export function Sprite() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden
      dangerouslySetInnerHTML={{ __html: `<defs>
  <symbol id="i-dash" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></symbol>
  <symbol id="i-file" viewBox="0 0 24 24"><path d="M6 2h8l4 4v16H6z"/><path d="M14 2v4h4"/><path d="M9 12h6M9 16h6"/></symbol>
  <symbol id="i-tag" viewBox="0 0 24 24"><path d="M4 4h7.5L20 12.5 12.5 20 4 11.5z"/><circle cx="8" cy="8" r="1.2"/></symbol>
  <symbol id="i-users" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.2"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0"/><path d="M16.5 5.6a3.2 3.2 0 0 1 0 6.1"/><path d="M17.5 20a5.5 5.5 0 0 0-3-4.9"/></symbol>
  <symbol id="i-settings" viewBox="0 0 24 24"><path d="M4 8h9M18 8h2M4 16h2M11 16h9"/><circle cx="15" cy="8" r="2.3"/><circle cx="8" cy="16" r="2.3"/></symbol>
  <symbol id="i-logout" viewBox="0 0 24 24"><path d="M10 4H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4"/><path d="M15 8l4 4-4 4M19 12H9"/></symbol>
  <symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6"/><path d="M20 20l-3.6-3.6"/></symbol>
  <symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></symbol>
  <symbol id="i-check" viewBox="0 0 24 24"><path d="M5 12l4.5 4.5L19 7"/></symbol>
  <symbol id="i-send" viewBox="0 0 24 24"><path d="M22 3L11 14"/><path d="M22 3l-7 19-4-8-8-4z"/></symbol>
  <symbol id="i-card" viewBox="0 0 24 24"><rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19M6 15h4"/></symbol>
  <symbol id="i-pen" viewBox="0 0 24 24"><path d="M15 4l5 5M4 20l1.2-4.2L16 5l3 3L8.2 18.8z"/></symbol>
  <symbol id="i-shield" viewBox="0 0 24 24"><path d="M12 3l7 3v6c0 4-3 6.8-7 8-4-1.2-7-4-7-8V6z"/><path d="M9 12l2 2 4-4"/></symbol>
  <symbol id="i-building" viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M10 21v-3h4v3"/></symbol>
  <symbol id="i-image" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="M21 16l-5-5-7 7"/></symbol>
  <symbol id="i-bank" viewBox="0 0 24 24"><path d="M3 9.5l9-5.5 9 5.5"/><path d="M5 10v8M19 10v8M9.5 10v8M14.5 10v8"/><path d="M3 21h18"/></symbol>
  <symbol id="i-arrow" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></symbol>
  <symbol id="i-doc" viewBox="0 0 24 24"><path d="M6 2h8l4 4v16H6z"/><path d="M14 2v4h4M9 12h6M9 16h4"/></symbol>
  <symbol id="i-wifi-off" viewBox="0 0 24 24"><path d="M3 8a15 15 0 0 1 18 0M6 12a10 10 0 0 1 12 0M9 16a5 5 0 0 1 6 0"/><path d="M12 20h.01"/></symbol>
</defs>` }} />
  );
}
