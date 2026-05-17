import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw } from 'lucide-react';

const LogViewer = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await axios.get('/loki/loki/api/v1/query_range', {
        params: {
          query: '{service_name=~".+"}',
          limit: 100,
          direction: 'backward'
        }
      });

      const processedLogs = res.data.data.result.flatMap(stream => 
        stream.values.map(val => ({
          timestamp: new Date(val[0] / 1000000).toLocaleString(),
          message: val[1],
          service: stream.stream.service_name || 'unknown',
          severity: val[1].includes('ERROR') ? 'ERROR' : 'INFO'
        }))
      ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setLogs(processedLogs);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching logs:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchLogs, 5000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">System Logs</h1>
          <p className="text-slate-500 text-sm">Real-time backend logs from Loki</p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-600 cursor-pointer">
            <input 
              type="checkbox" 
              checked={autoRefresh} 
              onChange={() => setAutoRefresh(!autoRefresh)}
              className="w-4 h-4 rounded text-indigo-600"
            />
            Auto-refresh
          </label>
          <button 
            onClick={fetchLogs}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-800 font-mono text-sm h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar">
        {logs.length === 0 && !loading ? (
          <div className="text-slate-500 text-center py-20">No logs found. Ensure services are running and OTEL is enabled.</div>
        ) : (
          <div className="space-y-1">
            {logs.map((log, i) => (
              <div key={i} className="flex gap-4 border-b border-slate-800/50 py-1 hover:bg-slate-800/30 transition-colors">
                <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                <span className={`shrink-0 font-bold ${log.service === 'user-management-services' ? 'text-indigo-400' : 'text-emerald-400'}`}>
                  {log.service.split('-')[0].toUpperCase()}
                </span>
                <span className={`shrink-0 font-bold ${log.severity === 'ERROR' ? 'text-red-400' : 'text-blue-400'}`}>
                  {log.severity}
                </span>
                <span className="text-slate-300 break-all">{log.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LogViewer;
