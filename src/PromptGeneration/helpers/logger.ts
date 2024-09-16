const Enabled = true;

export function customizedLogger (pos: string, txt: string) {
  if (!Enabled) return;
  console.log(`${pos}: ${txt}`)
}