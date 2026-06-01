import { useMemo } from 'react';

interface SmsLog {
  id: number;
  recipient: string;
  message: string;
  status: string;
  sent_at: string;
}

export function useSmsStats(logs: SmsLog[]) {

  return useMemo(() => {

    const deliveredStatuses = [
      'success',
      'sent',
      'delivered',
      'imetumwa',
    ];

    const delivered = logs.filter(log =>
      deliveredStatuses.some(s =>
        log.status?.toLowerCase().includes(s)
      )
    );

    const now = new Date();

    const monthly = delivered.filter(log => {
      const d = new Date(log.sent_at);
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth()
      );
    });

    return {
      smsSentThisMonth: monthly.length,
      smsSentAllTime: delivered.length,
    };

  }, [logs]);
}