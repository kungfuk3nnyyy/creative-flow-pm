interface OverdueNoticeData {
  clientName: string;
  invoiceNumber: string;
  balanceFormatted: string;
  dueDate: string;
  daysOverdue: number;
  orgName: string;
}

export function overdueNoticeSubject(data: OverdueNoticeData): string {
  return `Overdue: Invoice ${data.invoiceNumber} - payment required`;
}

export function overdueNoticeHtml(data: OverdueNoticeData): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
  <div style="border-bottom: 2px solid #c0542e; padding-bottom: 16px; margin-bottom: 24px;">
    <h1 style="font-size: 20px; margin: 0; color: #1a1a1a;">${data.orgName}</h1>
  </div>

  <p>Dear ${data.clientName},</p>

  <p>Invoice <strong>${data.invoiceNumber}</strong> was due on <strong>${data.dueDate}</strong> and is now <strong>${data.daysOverdue} day${data.daysOverdue === 1 ? "" : "s"} overdue</strong>.</p>

  <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 24px 0;">
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 4px 0; color: #666;">Invoice</td>
        <td style="padding: 4px 0; text-align: right; font-weight: 600;">${data.invoiceNumber}</td>
      </tr>
      <tr>
        <td style="padding: 4px 0; color: #666;">Outstanding Balance</td>
        <td style="padding: 4px 0; text-align: right; font-weight: 600; color: #dc2626;">${data.balanceFormatted}</td>
      </tr>
      <tr>
        <td style="padding: 4px 0; color: #666;">Due Date</td>
        <td style="padding: 4px 0; text-align: right; font-weight: 600;">${data.dueDate}</td>
      </tr>
      <tr>
        <td style="padding: 4px 0; color: #666;">Days Overdue</td>
        <td style="padding: 4px 0; text-align: right; font-weight: 600; color: #dc2626;">${data.daysOverdue}</td>
      </tr>
    </table>
  </div>

  <p>Please arrange payment at your earliest convenience. If you have any questions or need to discuss payment terms, please contact us.</p>

  <p style="margin-top: 32px; color: #888; font-size: 12px;">
    This email was sent by ${data.orgName} via CreativeFlow PM.
  </p>
</body>
</html>`.trim();
}
