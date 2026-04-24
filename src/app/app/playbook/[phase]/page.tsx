import { notFound } from 'next/navigation';
import PlaybookPhaseView from '@/components/playbook/PlaybookPhaseView';
import {
  getPlaybookCheckpointsForPhase,
  getPlaybookPhase,
  playbookPhases,
} from '@/data/playbook';

interface PlaybookPhasePageProps {
  params: Promise<{
    phase: string;
  }>;
}

export function generateStaticParams() {
  return playbookPhases.map((phase) => ({ phase: phase.id }));
}

export default async function PlaybookPhasePage({ params }: PlaybookPhasePageProps) {
  const { phase: phaseId } = await params;
  const phase = getPlaybookPhase(phaseId);

  if (!phase) {
    notFound();
  }

  const checkpoints = getPlaybookCheckpointsForPhase(phase.id);

  return <PlaybookPhaseView phase={phase} checkpoints={checkpoints} />;
}
