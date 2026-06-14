import { fetchHealth } from "@/lib/api";

export default async function HealthPage() {
  const gatewayHealth = await fetchHealth("api-gateway");
  const authHealth = await fetchHealth("auth-service");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-slate-800 border-b pb-2">System Health</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        <HealthCard title="API Gateway" port="8000" data={gatewayHealth} />
        <HealthCard title="Auth Service" port="8006" data={authHealth} />
      </div>
    </div>
  );
}

interface HealthData {
  status?: string;
  error?: string;
  service?: string;
  version?: string;
  timestamp?: string;
  dependencies?: Record<string, unknown>;
}

function HealthCard({ title, port, data }: { title: string, port: string, data: HealthData }) {
  const isHealthy = data.status === "healthy";
  return (
    <div className={`p-5 rounded-lg border shadow-sm ${isHealthy ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
      <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">
        <span className={`w-3 h-3 rounded-full ${isHealthy ? 'bg-green-500' : 'bg-red-500'}`}></span>
        {title}
      </h2>
      <p className="text-sm text-slate-500 mb-3">Port: {port}</p>
      
      {data.error ? (
        <div className="text-red-700 bg-red-100 p-3 rounded text-sm font-mono whitespace-pre-wrap">
          Connection Failed: {data.error}
        </div>
      ) : (
        <pre className="text-sm bg-white p-4 rounded border border-slate-200 overflow-x-auto text-slate-700">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}
