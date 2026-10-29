import { Suspense } from 'react';
import { LoginCard } from './LoginCard';

export default function LoginPage() {
  return (
    <main className="login-page">
      <Suspense>
        <LoginCard />
      </Suspense>
    </main>
  );
}
