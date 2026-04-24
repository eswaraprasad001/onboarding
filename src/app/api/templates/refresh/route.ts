import { NextResponse } from 'next/server';
import { MissingTemplateSyncMirrorError, refreshTemplateCatalogFromPrevious } from '@/lib/templateRefresh';
import { loadTemplateCatalog, writePersistedTemplateCatalog } from '@/lib/templateCatalogStore';

export async function POST() {
  try {
    const existingCatalog = await loadTemplateCatalog();
    const result = await refreshTemplateCatalogFromPrevious(existingCatalog.templates);

    await writePersistedTemplateCatalog({
      version: 1,
      savedAt: new Date().toISOString(),
      templates: result.templates,
      newTemplateIds: result.newTemplates.map((template) => template.id),
      summary: result.summary,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Template refresh failed', error);

    if (error instanceof MissingTemplateSyncMirrorError) {
      return NextResponse.json(
        {
          error: error.message,
          code: 'missing-sync-mirror',
          mode: 'local-json',
          helpLink: error.syncLink,
          helpLabel: error.actionLabel,
          attemptedPaths: error.attemptedPaths,
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error: 'Unable to refresh the Template Library from your synced Solution Ownership folder.',
        mode: 'local-json',
      },
      { status: 500 }
    );
  }
}
