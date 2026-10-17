export interface AssStyle {
  name: string;
  fields: Record<string, string>;
}

export interface AssEvent {
  type: 'Dialogue' | 'Comment';
  layer: string;
  start: string;
  end: string;
  style: string;
  name: string;
  text: string;
  fields: Record<string, string>;
}

export interface AssScript {
  /** `[Script Info]` key/value pairs (case preserved). */
  info: Record<string, string>;
  styles: AssStyle[];
  events: AssEvent[];
}

export const DEFAULT_EVENT_FORMAT = [
  'Layer',
  'Start',
  'End',
  'Style',
  'Name',
  'MarginL',
  'MarginR',
  'MarginV',
  'Effect',
  'Text',
];

const SECTION_RE = /^\[(.+)\]$/;

/**
 * Parse an Advanced SubStation Alpha script.
 *
 * Format-driven: it honours whatever column order the `Format:` lines declare,
 * which covers both `[V4+ Styles]` and the legacy `[V4 Styles]`. The `Text`
 * column is the last field in practice and is allowed to contain commas.
 */
export function parseAss(content: string): AssScript {
  const info: Record<string, string> = {};
  const styles: AssStyle[] = [];
  const events: AssEvent[] = [];

  let section = '';
  let styleFormat: string[] = [];
  let eventFormat: string[] = [];

  for (const rawLine of content.replace(/^\uFEFF/, '').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line === '' || line.startsWith(';') || line.startsWith('!:')) continue;

    const sectionMatch = SECTION_RE.exec(line);
    if (sectionMatch) {
      section = sectionMatch[1].trim().toLowerCase();
      continue;
    }

    const colon = line.indexOf(':');
    if (colon === -1) continue;

    const key = line.slice(0, colon).trim();
    const value = line.slice(colon + 1).replace(/^\s/, '');
    const lowerKey = key.toLowerCase();

    switch (section) {
      case 'script info':
        info[key] = value.trim();
        break;

      case 'v4+ styles':
      case 'v4 styles':
        if (lowerKey === 'format') styleFormat = splitList(value);
        else if (lowerKey === 'style') styles.push(toStyle(styleFormat, value));
        break;

      case 'events':
        if (lowerKey === 'format') {
          eventFormat = splitList(value);
        } else if (lowerKey === 'dialogue' || lowerKey === 'comment') {
          const format = eventFormat.length > 0 ? eventFormat : DEFAULT_EVENT_FORMAT;
          events.push(toEvent(format, value, lowerKey === 'comment' ? 'Comment' : 'Dialogue'));
        }
        break;

      default:
        break;
    }
  }

  return { info, styles, events };
}

function splitList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item !== '');
}

/** Split the first `count - 1` commas, letting the final field keep the rest. */
function splitFields(value: string, count: number): string[] {
  const parts: string[] = [];
  let rest = value;

  for (let i = 0; i < count - 1; i += 1) {
    const comma = rest.indexOf(',');
    if (comma === -1) {
      parts.push(rest);
      rest = '';
      continue;
    }
    parts.push(rest.slice(0, comma));
    rest = rest.slice(comma + 1);
  }
  parts.push(rest);

  return parts;
}

function assign(format: string[], parts: string[]): Record<string, string> {
  const fields: Record<string, string> = {};
  format.forEach((name, index) => {
    fields[name] = (parts[index] ?? '').trim();
  });
  return fields;
}

function toStyle(format: string[], value: string): AssStyle {
  const parts = value.split(',').map((part) => part.trim());
  const fields = assign(format, parts);
  return { name: fields.Name || parts[0] || '', fields };
}

function toEvent(format: string[], value: string, type: 'Dialogue' | 'Comment'): AssEvent {
  const parts = splitFields(value, format.length);
  const fields = assign(format, parts);
  const textIndex = format.findIndex((name) => name.toLowerCase() === 'text');
  const text = textIndex >= 0 ? parts[textIndex] ?? '' : parts[parts.length - 1] ?? '';

  return {
    type,
    layer: fields.Layer ?? '',
    start: fields.Start ?? '',
    end: fields.End ?? '',
    style: fields.Style ?? '',
    name: fields.Name ?? '',
    text,
    fields,
  };
}
