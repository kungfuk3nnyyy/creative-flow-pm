interface PaymentReminderData {
  clientName: string;
  invoiceNumber: string;
  balanceFormatted: string;
  dueDate: string;
  orgName: string;
}

export function paymentReminderSubject(data: PaymentReminderData): string {
  return `Payment reminder: Invoice ${data.invoiceNumber} due ${data.dueDate}`;
}

export function paymentReminderHtml(data: PaymentReminderData): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
  <div style="border-bottom: 2px solid #c0542e; padding-bottom: 16px; margin-bottom: 24px;">
    <h1 style="font-size: 20px; margin: 0; color: #1a1a1a;">${data.orgName}</h1>
  </div>

  <p>Dear ${data.clientName},</p>

  <p>This is a friendly reminder that invoice <strong>${data.invoiceNumber}</strong> is due on <strong>${data.dueDate}</strong>.</p>

  <div style="background: #faf8f5; border-radius: 8px; padding: 16px; margin: 24px 0;">
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 4px 0; color: #666;">Invoice</td>
        <td style="padding: 4px 0; text-align: right; font-weight: 600;">${data.invoiceNumber}</td>
      </tr>
      <tr>
        <td style="padding: 4px 0; color: #666;">Balance Due</td>
        <td style="padding: 4px 0; text-align: right; font-weight: 600;">${data.balanceFormatted}</td>
      </tr>
      <tr>
        <td style="padding: 4px 0; color: #666;">Due Date</td>
        <td style="padding: 4px 0; text-align: right; font-weight: 600;">${data.dueDate}</td>
      </tr>
    </table>
  </div>

  <p>Please ensure payment is made by the due date. If you have already sent payment, please disregard this reminder.</p>

  <p style="margin-top: 32px; color: #888; font-size: 12px;">
    This email was sent by ${data.orgName} via CreativeFlow PM.
  </p>
</body>
</html>`.trim();
}
