import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-slate-900 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold tracking-tight">
          AI Content Forensics
        </Link>
        <div className="flex gap-6">
          <Link href="/" className="hover:text-blue-300 transition-colors">Dashboard</Link>
          <Link href="/health" className="hover:text-blue-300 transition-colors">System Health</Link>
        </div>
      </div>
    </nav>
  );
}
