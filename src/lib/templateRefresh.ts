import { access, readdir, stat } from 'fs/promises';
import path from 'path';
import { buildTemplateCatalog, templateSyncResources, templates, TemplateSyncEntry } from '@/data/templates';
import { Template } from '@/types';

const SOLUTION_OWNERSHIP_SHAREPOINT_URL = 'https://presidio.sharepoint.com/:f:/r/teams/365-team-digital-delivery/Shared%20Documents/Solution%20Ownership?csf=1&web=1&e=8uClGk';
const DEFAULT_SYNC_FOLDER_NAME = 'Digital-delivery (Global) - Solution Ownership';
const LEGACY_COMPANY_FOLDER = 'OneDrive - Presidio Network Solutions';

const IGNORED_SOURCE_ITEMS = new Set([
  'For Consideration',
  'Powerpoint template Ideas.pptx',
  'Presidio-PPT-Template-FULL.potx',
  'UPSIS_App Modernization - WSR_06.11 [Auto-saved] - Copy.pptx',
  'Sample-Blackstraw',
  'Sample - Case Study',
]);

export interface TemplateRefreshSummary {
  mode: 'local-json';
  detected: number;
  added: number;
  updated: number;
  removed: number;
  skipped: number;
  message: string;
  refreshedAt: string;
}

export interface TemplateRefreshResult {
  mode: 'local-json';
  templates: Template[];
  newTemplates: Template[];
  summary: TemplateRefreshSummary;
}

export class MissingTemplateSyncMirrorError extends Error {
  readonly syncLink = SOLUTION_OWNERSHIP_SHAREPOINT_URL;
  readonly actionLabel = 'Open Solution Ownership in SharePoint';

  constructor(readonly attemptedPaths: string[]) {
    super(
      'The Template Library refresh could not find your locally synced Solution Ownership folder. Follow the steps below to sync the folder to your OneDrive, then click Refresh from SharePoint again.'
    );
    this.name = 'MissingTemplateSyncMirrorError';
  }
}

interface DiscoveredFile {
  absolutePath: string;
  relativeSegments: string[];
  name: string;
}

function dedupeTemplatesById(items: Template[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

const DISCOVERABLE_EXTENSIONS = new Set(['.pptx', '.docx', '.xlsx', '.pdf', '.mp4', '.dotx']);

function toRelativeKey(segments: string[]) {
  return segments.join('/');
}

function normalizeTitle(input: string) {
  return input
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\bwsr\b/gi, 'WSR')
    .trim();
}

function toCollectionTitle(folderName: string) {
  if (folderName.startsWith('Samples - ')) return `${folderName.replace('Samples - ', '').trim()} Samples`;
  if (folderName.startsWith('Sample - ')) return `${folderName.replace('Sample - ', '').trim()} Samples`;
  if (folderName.startsWith('Template - ')) return `${folderName.replace('Template - ', '').trim()} Collection`;
  return `${normalizeTitle(folderName)} Collection`;
}

function getFormatFromExtension(fileName: string): Template['format'] {
  const extension = path.extname(fileName).toLowerCase();
  if (extension === '.docx' || extension === '.dotx') return 'Word';
  if (extension === '.xlsx') return 'Excel';
  if (extension === '.pdf') return 'PDF';
  if (extension === '.mp4') return 'Video';
  return 'PowerPoint';
}

function inferCategory(relativeSegments: string[]) {
  const joined = relativeSegments.join(' ').toLowerCase();
  if (joined.includes('kickoff')) return 'Kickoff Decks';
  if (joined.includes('requirement') || joined.includes('use case') || joined.includes('raci')) return 'Requirements';
  if (joined.includes('status') || joined.includes('steerco') || joined.includes('raid')) return 'Status Reports';
  if (joined.includes('financial') || joined.includes('budget') || joined.includes('capacity')) return 'Financial Trackers';
  if (joined.includes('timeline') || joined.includes('roadmap')) return 'Roadmaps';
  if (joined.includes('training') || joined.includes('guide')) return 'Training Materials';
  return 'Delivery Templates';
}

function inferWorkflowContext(relativeSegments: string[], isCollection: boolean) {
  const joined = relativeSegments.join(' ').toLowerCase();
  if (joined.includes('kickoff')) return 'Best fit during engagement kickoff and early stakeholder alignment.';
  if (joined.includes('requirement') || joined.includes('use case')) return 'Most useful during scope definition and early delivery planning.';
  if (joined.includes('status') || joined.includes('steerco') || joined.includes('raid')) return 'Most useful during active delivery governance and recurring status cadences.';
  if (joined.includes('financial') || joined.includes('budget')) return 'Most useful during financial tracking, forecast review, and delivery governance.';
  if (joined.includes('timeline') || joined.includes('roadmap')) return 'Best fit during planning, sequencing, and milestone alignment.';
  if (joined.includes('pcr')) return 'Most relevant during PCR drafting, review, and change-governance work.';
  if (joined.includes('handoff') || joined.includes('close out')) return 'Most useful near delivery completion, final review, and transition planning.';
  return isCollection
    ? 'Use this collection when you need to browse related examples from your synced Solution Ownership library.'
    : 'Use this artifact when you need newly detected source material from your synced Solution Ownership library.';
}

function inferKeyContents(relativeSegments: string[], isCollection: boolean) {
  const joined = relativeSegments.join(' ').toLowerCase();
  if (joined.includes('kickoff')) return isCollection
    ? ['Kickoff deck examples', 'Meeting structure patterns', 'Stakeholder alignment framing']
    : ['Kickoff presentation structure', 'Stakeholder alignment framing', 'Opening delivery expectations'];
  if (joined.includes('requirement')) return isCollection
    ? ['Requirements examples', 'Documentation structures', 'Supporting analysis patterns']
    : ['Requirements structure', 'Scope detail organization', 'Supporting analysis fields'];
  if (joined.includes('raid')) return ['RAID log structures', 'Risk and issue tracking patterns', 'Governance-ready examples'];
  if (joined.includes('status') || joined.includes('steerco')) return ['Status update patterns', 'SteerCo communication examples', 'Executive-ready governance structure'];
  if (joined.includes('financial') || joined.includes('budget')) return ['Budget tracking structure', 'Forecast and actuals visibility', 'Financial review baseline'];
  if (joined.includes('timeline') || joined.includes('roadmap')) return ['Milestone sequencing', 'Roadmap or timeline structure', 'Planning visual baseline'];
  if (joined.includes('pcr')) return ['PCR examples or templates', 'Approval-ready framing', 'Change-governance support'];
  return isCollection
    ? ['Related examples from the source collection', 'Reusable reference material', 'SharePoint-backed sample set']
    : ['Source-backed artifact', 'Reusable reference material', 'SharePoint-backed template or sample'];
}

function getSharePointSourceUrl(relativeSegments: string[], resourceType: 'file' | 'folder') {
  if (resourceType === 'folder') {
    const serverRelativePath = `/teams/365-team-digital-delivery/Shared Documents/Solution Ownership/Templates and Samples/${relativeSegments.join('/')}`;
    return `https://presidio.sharepoint.com/teams/365-team-digital-delivery/Shared%20Documents/Forms/AllItems.aspx?id=${encodeURIComponent(serverRelativePath)}`;
  }

  const encodedPath = ['teams', '365-team-digital-delivery', 'Shared Documents', 'Solution Ownership', 'Templates and Samples', ...relativeSegments]
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  return `https://presidio.sharepoint.com/${encodedPath}`;
}

function buildDiscoveredArtifact(file: DiscoveredFile, lastUpdated: string): Template {
  const format = getFormatFromExtension(file.name);
  const title = normalizeTitle(file.name);
  const category = inferCategory(file.relativeSegments);

  return {
    id: `sharepoint-${toRelativeKey(file.relativeSegments).replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()}`,
    title,
    description: `Newly detected ${format} artifact from the synced Solution Ownership Templates and Samples source.`,
    category,
    format,
    lastUpdated,
    author: 'SharePoint Sync',
    downloads: 0,
    rating: 0,
    cardType: 'artifact',
    tags: ['sharepoint-sync', 'new-source-item'],
    resourceUrl: getSharePointSourceUrl(file.relativeSegments, 'file'),
    resourceType: 'file',
    syncSource: 'templates-and-samples',
    sourcePathSegments: file.relativeSegments,
    discoveredFromSharePoint: true,
    preview: {
      hasPreview: true,
      artifactType: `${format} artifact`,
      summary: `Newly detected source artifact based on ${file.relativeSegments[file.relativeSegments.length - 2] ?? 'the Templates and Samples library'}.`,
      whenToUse: 'Use Preview first to decide whether this artifact is relevant before opening the source file.',
      workflowContext: inferWorkflowContext(file.relativeSegments, false),
      keyContents: inferKeyContents(file.relativeSegments, false),
      sourceUrl: getSharePointSourceUrl(file.relativeSegments, 'file'),
      downloadUrl: getSharePointSourceUrl(file.relativeSegments, 'file'),
    },
  };
}

function buildDiscoveredCollection(relativeSegments: string[], lastUpdated: string): Template {
  const folderName = relativeSegments[relativeSegments.length - 1];

  return {
    id: `sharepoint-${toRelativeKey(relativeSegments).replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()}`,
    title: toCollectionTitle(folderName),
    description: 'Newly detected collection that groups related templates or samples from the synced Solution Ownership library.',
    category: inferCategory(relativeSegments),
    format: 'Mixed',
    lastUpdated,
    author: 'SharePoint Sync',
    downloads: 0,
    rating: 0,
    cardType: 'collection',
    tags: ['sharepoint-sync', 'new-source-item'],
    resourceUrl: getSharePointSourceUrl(relativeSegments, 'folder'),
    resourceType: 'folder',
    resourceLabel: 'Browse Collection',
    syncSource: 'templates-and-samples',
    sourcePathSegments: relativeSegments,
    discoveredFromSharePoint: true,
    preview: {
      hasPreview: true,
      artifactType: 'Sample collection',
      summary: `Newly detected collection for ${normalizeTitle(folderName)}.`,
      whenToUse: 'Use this collection when you want to browse related examples instead of opening a single file directly.',
      workflowContext: inferWorkflowContext(relativeSegments, true),
      keyContents: inferKeyContents(relativeSegments, true),
      sourceUrl: getSharePointSourceUrl(relativeSegments, 'folder'),
      downloadUrl: getSharePointSourceUrl(relativeSegments, 'folder'),
    },
  };
}

function getCandidateSyncRoots() {
  const explicitRoot = process.env.TEMPLATE_LIBRARY_SYNC_ROOT?.trim();
  const oneDriveCommercial = process.env.OneDriveCommercial?.trim();
  const oneDrive = process.env.OneDrive?.trim();
  const userProfile = process.env.USERPROFILE?.trim();

  const candidates = [
    explicitRoot,
    oneDriveCommercial ? path.join(oneDriveCommercial, DEFAULT_SYNC_FOLDER_NAME, 'Templates and Samples') : null,
    oneDriveCommercial ? path.join(oneDriveCommercial, 'Solution Ownership', 'Templates and Samples') : null,
    oneDrive ? path.join(oneDrive, DEFAULT_SYNC_FOLDER_NAME, 'Templates and Samples') : null,
    userProfile ? path.join(userProfile, LEGACY_COMPANY_FOLDER, DEFAULT_SYNC_FOLDER_NAME, 'Templates and Samples') : null,
    userProfile ? path.join(userProfile, LEGACY_COMPANY_FOLDER, 'Solution Ownership', 'Templates and Samples') : null,
  ].filter((value): value is string => !!value);

  return Array.from(new Set(candidates));
}

async function resolveTemplateSyncRoot() {
  const candidates = getCandidateSyncRoots();

  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Try next candidate.
    }
  }

  throw new MissingTemplateSyncMirrorError(candidates);
}

async function getUsefulFilesInDirectory(absolutePath: string, relativeSegments: string[]): Promise<DiscoveredFile[]> {
  const entries = await readdir(absolutePath, { withFileTypes: true });
  const files: DiscoveredFile[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith('~$')) continue;

    const nextRelativeSegments = [...relativeSegments, entry.name];
    const nextAbsolutePath = path.join(absolutePath, entry.name);

    if (entry.isDirectory()) {
      const nestedFiles = await getUsefulFilesInDirectory(nextAbsolutePath, nextRelativeSegments);
      files.push(...nestedFiles);
      continue;
    }

    if (!DISCOVERABLE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) continue;

    files.push({
      absolutePath: nextAbsolutePath,
      relativeSegments: nextRelativeSegments,
      name: entry.name,
    });
  }

  return files;
}

async function discoverSharePointTemplates(syncRoot: string): Promise<Template[]> {
  const curatedKnownRelativePaths = new Set(Object.values(templateSyncResources).map((resource) => toRelativeKey(resource.sourcePathSegments)));
  const coveredCollectionPaths = new Set(
    templates
      .filter((template) => template.cardType === 'collection')
      .map((template) => templateSyncResources[template.id]?.sourcePathSegments)
      .filter((segments): segments is string[] => Array.isArray(segments))
      .map((segments) => toRelativeKey(segments))
  );

  const rootEntries = await readdir(syncRoot, { withFileTypes: true });
  const discoveredTemplates: Template[] = [];

  for (const entry of rootEntries) {
    if (IGNORED_SOURCE_ITEMS.has(entry.name) || entry.name.startsWith('~$')) continue;

    const relativeSegments = [entry.name];
    const relativeKey = toRelativeKey(relativeSegments);
    const absolutePath = path.join(syncRoot, entry.name);

    if (coveredCollectionPaths.has(relativeKey)) {
      continue;
    }

    if (entry.isDirectory()) {
      if (curatedKnownRelativePaths.has(relativeKey)) {
        const usefulFiles = await getUsefulFilesInDirectory(absolutePath, relativeSegments);
        for (const file of usefulFiles) {
          if (!curatedKnownRelativePaths.has(toRelativeKey(file.relativeSegments))) {
            discoveredTemplates.push(buildDiscoveredArtifact(file, await getLastUpdated(file.absolutePath)));
          }
        }
        continue;
      }

      const usefulFiles = await getUsefulFilesInDirectory(absolutePath, relativeSegments);
      if (usefulFiles.length === 0) continue;

      if (usefulFiles.length <= 3) {
        for (const file of usefulFiles) {
          if (!curatedKnownRelativePaths.has(toRelativeKey(file.relativeSegments))) {
            discoveredTemplates.push(buildDiscoveredArtifact(file, await getLastUpdated(file.absolutePath)));
          }
        }
        continue;
      }

      discoveredTemplates.push(buildDiscoveredCollection(relativeSegments, await getLastUpdated(absolutePath)));
      continue;
    }

    if (!DISCOVERABLE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) continue;
    if (curatedKnownRelativePaths.has(relativeKey)) continue;

    discoveredTemplates.push(buildDiscoveredArtifact({
      absolutePath,
      relativeSegments,
      name: entry.name,
    }, await getLastUpdated(absolutePath)));
  }

  return discoveredTemplates;
}

async function pathExists(targetPath: string) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function getLastUpdated(targetPath: string) {
  const targetStats = await stat(targetPath);
  return targetStats.mtime.toISOString().slice(0, 10);
}

async function collectSkippedCount(syncRoot: string) {
  try {
    const sourceItems = await readdir(syncRoot);
    return sourceItems.filter((item) => IGNORED_SOURCE_ITEMS.has(item)).length;
  } catch {
    return 0;
  }
}

export async function refreshTemplateCatalog(): Promise<TemplateRefreshResult> {
  return refreshTemplateCatalogFromPrevious(templates);
}

export async function refreshTemplateCatalogFromPrevious(previousCatalogTemplates: Template[]): Promise<TemplateRefreshResult> {
  const syncRoot = await resolveTemplateSyncRoot();
  const syncedEntries: Record<string, TemplateSyncEntry> = {};

  await Promise.all(
    Object.entries(templateSyncResources).map(async ([id, resource]) => {
      const targetPath = path.join(syncRoot, ...resource.sourcePathSegments);
      const available = await pathExists(targetPath);

      syncedEntries[id] = {
        available,
        lastUpdated: available ? await getLastUpdated(targetPath) : undefined,
      };
    })
  );

  const refreshedSeedTemplates = buildTemplateCatalog({ syncedEntries });
  const discoveredTemplates = dedupeTemplatesById(await discoverSharePointTemplates(syncRoot));
  const refreshedTemplates = dedupeTemplatesById([...refreshedSeedTemplates, ...discoveredTemplates]);
  const previousTemplates = previousCatalogTemplates;
  const previousById = new Map(previousTemplates.map((template) => [template.id, template]));
  const refreshedById = new Map(refreshedTemplates.map((template) => [template.id, template]));
  const previousDiscoveredIds = new Set(
    previousTemplates
      .filter((template) => template.discoveredFromSharePoint)
      .map((template) => template.id)
  );

  const added = refreshedTemplates.filter((template) => !previousById.has(template.id)).length;
  const updated = refreshedTemplates.filter((template) => {
    const previous = previousById.get(template.id);
    return previous && previous.lastUpdated !== template.lastUpdated;
  }).length;
  const removed = previousTemplates.filter((template) => !refreshedById.has(template.id)).length;
  const skipped = await collectSkippedCount(syncRoot);
  const newTemplates = dedupeTemplatesById(
    discoveredTemplates.filter((template) => !previousDiscoveredIds.has(template.id))
  );
  const detected = newTemplates.length;
  const refreshedAt = new Date().toISOString();

  const message = detected === 0 && added === 0 && updated === 0 && removed === 0
    ? 'No new artifacts found. The curated library is already up to date.'
    : `${detected} newly detected, ${updated} updated, ${removed} removed, ${skipped} skipped.`;

  return {
    mode: 'local-json',
    templates: refreshedTemplates,
    newTemplates,
    summary: {
      mode: 'local-json',
      detected,
      added,
      updated,
      removed,
      skipped,
      message,
      refreshedAt,
    },
  };
}

export { SOLUTION_OWNERSHIP_SHAREPOINT_URL };
