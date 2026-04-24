import { mkdir, readFile, rename, writeFile } from 'fs/promises';
import path from 'path';
import { templates } from '@/data/templates';
import { Template } from '@/types';
import { TemplateRefreshSummary } from '@/lib/templateRefresh';

const STORE_DIR = path.join(process.cwd(), '.local-data');
const STORE_PATH = path.join(STORE_DIR, 'template-catalog.json');
const STORE_VERSION = 1;

export interface PersistedTemplateCatalog {
  version: number;
  savedAt: string;
  templates: Template[];
  newTemplateIds: string[];
  summary: TemplateRefreshSummary | null;
}

function dedupeTemplatesById(items: Template[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) {
      return false;
    }
    seen.add(item.id);
    return true;
  });
}

function normalizePersistedTemplateCatalog(catalog: PersistedTemplateCatalog): PersistedTemplateCatalog {
  const templates = dedupeTemplatesById(catalog.templates);
  const validTemplateIds = new Set(templates.map((template) => template.id));
  const newTemplateIds = Array.from(new Set(catalog.newTemplateIds.filter((id) => validTemplateIds.has(id))));

  return {
    ...catalog,
    templates,
    newTemplateIds,
  };
}

function isValidTemplateCatalog(value: unknown): value is PersistedTemplateCatalog {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as PersistedTemplateCatalog;
  return (
    candidate.version === STORE_VERSION &&
    Array.isArray(candidate.templates) &&
    Array.isArray(candidate.newTemplateIds)
  );
}

export function createDefaultTemplateCatalog(): PersistedTemplateCatalog {
  return {
    version: STORE_VERSION,
    savedAt: new Date().toISOString(),
    templates,
    newTemplateIds: [],
    summary: null,
  };
}

export async function readPersistedTemplateCatalog(): Promise<PersistedTemplateCatalog | null> {
  try {
    const raw = await readFile(STORE_PATH, 'utf8');
    const parsed = JSON.parse(raw) as unknown;
    return isValidTemplateCatalog(parsed) ? normalizePersistedTemplateCatalog(parsed) : null;
  } catch {
    return null;
  }
}

export async function loadTemplateCatalog(): Promise<PersistedTemplateCatalog> {
  return (await readPersistedTemplateCatalog()) ?? createDefaultTemplateCatalog();
}

export async function writePersistedTemplateCatalog(payload: PersistedTemplateCatalog): Promise<void> {
  await mkdir(STORE_DIR, { recursive: true });

  const tempPath = `${STORE_PATH}.tmp`;
  await writeFile(tempPath, JSON.stringify(normalizePersistedTemplateCatalog(payload), null, 2), 'utf8');
  await rename(tempPath, STORE_PATH);
}

export function selectNewTemplates(catalog: PersistedTemplateCatalog): Template[] {
  const newIds = new Set(catalog.newTemplateIds);
  return catalog.templates.filter((template) => newIds.has(template.id));
}

export { STORE_PATH as TEMPLATE_CATALOG_STORE_PATH };
