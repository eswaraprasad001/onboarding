export const PLAYBOOK_VIEWS_KEY = 'presidio-playbook-views';
export const PLAYBOOK_VIEW_XP = 15;

export function getPlaybookViewEventId(viewId: string) {
  return `playbook:${viewId}`;
}

export function getViewedPlaybookEvents(): Set<string> {
  if (typeof window === 'undefined') {
    return new Set();
  }

  try {
    const saved = localStorage.getItem(PLAYBOOK_VIEWS_KEY);
    return saved ? new Set(JSON.parse(saved) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

export function markPlaybookView(viewId: string): { awarded: boolean; viewedEvents: Set<string> } {
  const viewedEvents = getViewedPlaybookEvents();
  const eventId = getPlaybookViewEventId(viewId);

  if (viewedEvents.has(eventId)) {
    return { awarded: false, viewedEvents };
  }

  viewedEvents.add(eventId);

  if (typeof window !== 'undefined') {
    localStorage.setItem(PLAYBOOK_VIEWS_KEY, JSON.stringify(Array.from(viewedEvents)));
  }

  return { awarded: true, viewedEvents };
}
