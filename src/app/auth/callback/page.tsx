'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

/**
 * OAuth redirect landing page.
 *
 * Google/Discord (and any other Supabase OAuth provider) send the user back
 * here after they approve sign-in. Supabase's JS client can pick up the
 * session automatically in most cases (detectSessionInUrl), but some flows
 * come back with a `?code=...` query param instead of a URL hash — that
 * variant needs an explicit exchangeCodeForSession call, which is what this
 * page does before sending the user back into the app.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const finishSignIn = async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            setErrorMsg(error.message);
            return;
          }
        }
        // If there's no `code` param, the client's detectSessionInUrl option
        // will already have picked up a hash-based (#access_token=...) session.
      } catch (err: any) {
        setErrorMsg(err?.message || 'Sign-in could not be completed.');
      } finally {
        router.replace('/');
      }
    };

    finishSignIn();
  }, [router]);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-3 bg-[#07080C] text-white">
      {errorMsg ? (
        <p className="text-sm text-red-400 max-w-xs text-center px-6">{errorMsg}</p>
      ) : (
        <>
          <div className="w-8 h-8 border-2 border-white/20 border-t-[#FA233B] rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Signing you in…</p>
        </>
      )}
    </div>
  );
}
