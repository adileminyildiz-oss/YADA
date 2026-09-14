'use client';
import { useRouter } from 'next/navigation';
import { setToken } from '../../lib/api';

export default function Header({ right }: { right?: React.ReactNode }) {
  const router = useRouter();
  return (
    <div className="top">
      <div className="brand"><span className="mk">Y</span> YADA Administration</div>
      <div className="row">
        {right}
        <button className="sm" onClick={() => { setToken(null); router.push('/login'); }}>Déconnexion</button>
      </div>
    </div>
  );
}
