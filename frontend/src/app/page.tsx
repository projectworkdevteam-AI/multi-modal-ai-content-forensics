import Link from 'next/link';
import { fetchHealth } from "@/lib/api";

export default async function Home() {
  const gatewayHealth = await fetchHealth("api-gateway");
  const authHealth = await fetchHealth("auth-service");

  const services = [
    { name: "API Gateway", status: gatewayHealth.status || "error" },
    { name: "Auth Service", status: authHealth.status || "error" },
    { name: "Text Service", status: "pending" },
    { name: "Image Service", status: "pending" },
    { name: "Audio Service", status: "pending" },
    { name: "Report Service", status: "pending" }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-10 rounded-2xl shadow-lg">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Multi-Modal AI Content Forensics</h1>
        <p className="text-lg md:text-xl text-slate-300 max-w-3xl leading-relaxed">
          A distributed software platform integrating independent ML inference pipelines (Text, Image, Audio) 
          under a shared API gateway, providing robust deepfake detection and explainable AI insights.
        </p>
      </div>

      <div>
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-2xl font-bold text-slate-800">Platform Services</h2>
          <Link href="/health" className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
            View detailed health &rarr;
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {services.map(s => (
            <div key={s.name} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-slate-700">{s.name}</h3>
              <div className="flex items-center gap-2 mt-auto">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  s.status === 'healthy' ? 'bg-green-500' : 
                  s.status === 'error' ? 'bg-red-500' : 'bg-amber-400'
                }`}></span>
                <span className="text-sm font-medium text-slate-600 capitalize">
                  {s.status === 'error' ? 'Unavailable' : s.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
