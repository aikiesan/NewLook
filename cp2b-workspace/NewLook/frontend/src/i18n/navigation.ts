// Compatibility shim - exports standard Next.js navigation
// This allows existing code to work without i18n
export { default as Link } from 'next/link'
export { usePathname, useRouter } from 'next/navigation'
export { redirect } from 'next/navigation'
