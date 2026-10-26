/*
 * Editionen: "free" (nur kostenloser Editor, kein Backend) und "full" (mit Premium und Firmen-Paketen).
 *
 * Code, der nur zu einer Edition gehört, steht zwischen Markierungszeilen:
 *   JS/CSS:  /* @full-start *\/ … /* @full-end *\/      (bzw. @free-start / @free-end)
 *   HTML:    <!-- @full-start --> … <!-- @full-end -->
 * Der Build entfernt Blöcke der jeweils anderen Edition und die Markierungszeilen selbst.
 * So bleibt der Premium-/Firmen-Code im Repo erhalten und lässt sich jederzeit wieder einschalten.
 */

export const EDITIONS = ["free", "full"];

const MARKER = /^\s*(?:\/\*|<!--|\/\/)?\s*@(full|free)-(start|end)\s*(?:\*\/|-->)?\s*$/;

/** Entfernt die Blöcke der nicht aktiven Edition. */
export function stripEdition(text, edition, name = "") {
  const out = [];
  let open = null;
  let lineNo = 0;
  for (const line of String(text).split("\n")) {
    lineNo++;
    const m = line.match(MARKER);
    if (m) {
      const [, ed, kind] = m;
      if (kind === "start") {
        if (open) throw new Error(`${name}:${lineNo}: @${ed}-start innerhalb von @${open}-Block`);
        open = ed;
      } else {
        if (open !== ed) throw new Error(`${name}:${lineNo}: @${ed}-end ohne passendes @${ed}-start`);
        open = null;
      }
      continue;
    }
    if (!open || open === edition) out.push(line);
  }
  if (open) throw new Error(`${name}: @${open}-start ohne @${open}-end`);
  return out.join("\n");
}

/**
 * Inhaltstexte je Edition: Ein Objekt { full: …, free: … } wird durch den Wert der aktiven
 * Edition ersetzt. null/undefined bedeutet „in dieser Edition weglassen“ (in Listen entfernt).
 */
export function resolveEdition(value, edition) {
  if (Array.isArray(value)) {
    return value.map((v) => resolveEdition(v, edition)).filter((v) => v !== null && v !== undefined);
  }
  if (value && typeof value === "object") {
    const keys = Object.keys(value);
    if (keys.length && keys.every((k) => k === "full" || k === "free")) return resolveEdition(value[edition], edition);
    const out = {};
    for (const k of keys) out[k] = resolveEdition(value[k], edition);
    return out;
  }
  return value;
}
