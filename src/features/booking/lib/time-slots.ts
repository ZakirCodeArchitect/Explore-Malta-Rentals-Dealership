/** 30-minute slots — European-style 24h labels */
export const TIME_SLOTS: readonly string[] = (() => {
  const out: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      out.push(`${String(h).padStart(2, "0")}:${m === 0 ? "00" : "30"}`);
    }
  }
  return out;
})();

/** Next 30-minute slot at least `bufferMinutes` ahead — for “smart” default */
export function nextRoundedSlot(bufferMinutes = 90): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() + bufferMinutes, 0, 0);
  const mins = d.getMinutes();
  if (mins > 0 && mins <= 30) d.setMinutes(30, 0, 0);
  else if (mins > 30) {
    d.setHours(d.getHours() + 1, 0, 0, 0);
  }
  const h = String(d.getHours()).padStart(2, "0");
  const m = d.getMinutes() === 30 ? "30" : "00";
  return `${h}:${m}`;
}
