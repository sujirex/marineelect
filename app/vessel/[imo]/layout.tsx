// Required for Next.js static export — pre-generates demo vessel paths.
// Client-side navigation to user-added vessels still works normally.
export function generateStaticParams() {
  return [
    { imo: "9876543" },
    { imo: "9234567" },
  ]
}

export default function VesselLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
