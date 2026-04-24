import { NextResponse } from 'next/server';
import { loadTemplateCatalog, selectNewTemplates } from '@/lib/templateCatalogStore';

export async function GET() {
  try {
    const catalog = await loadTemplateCatalog();

    return NextResponse.json({
      mode: 'local-json',
      templates: catalog.templates,
      newTemplates: selectNewTemplates(catalog),
      summary: catalog.summary,
      savedAt: catalog.savedAt,
    });
  } catch (error) {
    console.error('Unable to load template catalog', error);
    return NextResponse.json(
      {
        error: 'Unable to load the local template catalog.',
        mode: 'local-json',
      },
      { status: 500 }
    );
  }
}
