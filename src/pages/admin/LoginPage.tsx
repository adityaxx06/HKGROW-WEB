import { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PageMeta } from '@/components/ui/PageMeta';

export function LoginPage() {
  const signIn = useAuthStore((s) => s.signIn);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    const from = (location.state as { from?: string } | null)?.from ?? '/admin';
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error: signInError } = await signIn(email, password);

    setIsSubmitting(false);

    if (signInError) {
      setError('Incorrect email or password. Please try again.');
      return;
    }

    const from = (location.state as { from?: string } | null)?.from ?? '/admin';
    navigate(from, { replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <PageMeta title="Admin Login | HK Grow Infra" description="Admin sign in." noindex />
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-8 shadow-card">
        <div className="mb-6 flex items-center gap-2">
          <img src="/logo.png" alt="HK Grow Infra" className="h-10 w-10 rounded-md object-contain" />
          <div>
            <p className="text-base font-bold text-navy-700">HK Grow Infra</p>
            <p className="text-xs text-ink-secondary">Admin Panel</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}
