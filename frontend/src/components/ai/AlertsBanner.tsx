'use client';

import { useState } from 'react';

interface Alert {
  type: string;
  severity: 'info' | 'caution' | 'warning' | 'danger';
  message: string;
}

interface CityAlerts {
  city: string;
  cityId: string;
  alerts: Alert[];
}

const severityStyles = {
  info: 'bg-blue-500/20 border-blue-500/40 text-blue-200',
  caution: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-200',
  warning: 'bg-orange-500/20 border-orange-500/40 text-orange-200',
  danger: 'bg-red-500/20 border-red-500/40 text-red-200',
};

const severityIcons = {
  info: 'ℹ️',
  caution: '⚠️',
  warning: '🔶',
  danger: '🚨',
};

export default function AlertsBanner({ alerts }: { alerts: CityAlerts[] }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || alerts.length === 0) return null;

  const allAlerts = alerts.flatMap((ca) =>
    ca.alerts.map((a) => ({ ...a, city: ca.city }))
  );

  const topSeverity = allAlerts.reduce((max, a) => {
    const order = ['info', 'caution', 'warning', 'danger'];
    return order.indexOf(a.severity) > order.indexOf(max) ? a.severity : max;
  }, 'info' as Alert['severity']);

  return (
    <div className={`mb-6 rounded-2xl border p-4 ${severityStyles[topSeverity]}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span>{severityIcons[topSeverity]}</span>
            <span className="font-semibold text-sm">Weather Alerts ({allAlerts.length})</span>
          </div>
          <div className="space-y-1">
            {allAlerts.slice(0, 3).map((alert, i) => (
              <p key={i} className="text-sm opacity-90">
                <span className="font-medium">{alert.city}:</span> {alert.message}
              </p>
            ))}
            {allAlerts.length > 3 && (
              <p className="text-xs opacity-70">+{allAlerts.length - 3} more alerts</p>
            )}
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="opacity-60 hover:opacity-100 text-lg leading-none shrink-0"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
