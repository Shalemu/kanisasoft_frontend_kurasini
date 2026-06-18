import { useMemo } from 'react';

interface SmsLog {
  id: number;
  recipient: string;
  message: string;
  status: string;
  sent_at: string;
  receiver: string;
}

export function useSmsStats(logs: SmsLog[]) {
  return useMemo(() => {
    const deliveredStatuses = [
      'success',
      'sent',
      'delivered',
      'imetumwa',
    ];

    const delivered = logs.filter((log) =>
      deliveredStatuses.some((status) =>
        log.status?.toLowerCase().includes(status)
      )
    );

    const now = new Date();

    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const previousMonthDate = new Date(
      currentYear,
      currentMonth - 1,
      1
    );

    const smsSentThisMonth = delivered.filter((log) => {
      const d = new Date(log.sent_at);

      return (
        d.getFullYear() === currentYear &&
        d.getMonth() === currentMonth
      );
    }).length;

    const smsSentLastMonth = delivered.filter((log) => {
      const d = new Date(log.sent_at);

      return (
        d.getFullYear() === previousMonthDate.getFullYear() &&
        d.getMonth() === previousMonthDate.getMonth()
      );
    }).length;

    const smsSentAllTime = delivered.length;

    return {
      smsSentThisMonth,
      smsSentLastMonth,
      smsSentAllTime,
    };
  }, [logs]);
}