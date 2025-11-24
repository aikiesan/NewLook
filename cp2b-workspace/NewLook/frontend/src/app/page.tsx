import { redirect } from 'next/navigation';

/**
 * Root page - redirects to default locale
 * This ensures users accessing '/' are redirected to '/pt-BR'
 */
export default function RootPage() {
  redirect('/pt-BR');
}

