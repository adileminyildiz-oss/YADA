'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '../lib/api';

export default function Home() {
  const router = useRouter();
  useEffect(() => { router.replace(getToken() ? '/dossiers' : '/login'); }, [router]);
  return <div className="wrap"><p className="muted">Chargement…</p></div>;
}
