import AppShell from '@/components/layout/AppShell';

export default function InternalAppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppShell>{children}</AppShell>;
}
