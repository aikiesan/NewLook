/**
 * Root page - This should never be rendered in production
 * Cloudflare Pages _redirects file handles the redirect to /pt-BR
 * This is just a fallback in case someone accesses the root directly
 */
export default function RootPage() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <h1>Redirecting...</h1>
        <p>If you are not redirected automatically, <a href="/pt-BR">click here</a>.</p>
      </div>
    </div>
  );
}

