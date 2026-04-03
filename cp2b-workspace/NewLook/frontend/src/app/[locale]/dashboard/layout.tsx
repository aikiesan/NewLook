import UnifiedHeader from '@/components/layout/UnifiedHeader'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <UnifiedHeader variant="authenticated" />
      {children}
    </>
  )
}
