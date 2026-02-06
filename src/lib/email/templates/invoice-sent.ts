interface InvoiceSentData {
  clientName: string;
  invoiceNumber: string;
  totalFormatted: string;
  dueDate: string;
  orgName: string;
}

export function invoiceSentSubject(data: InvoiceSentData): string {
  return `Invoice ${data.invoiceNumber} from ${data.orgName}`;
}

export function invoiceSentHtml(data: InvoiceSentData): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
  <div style="border-bottom: 2px solid #c0542e; padding-bottom: 16px; margin-bottom: 24px;">
    <h1 style="font-size: 20px; margin: 0; color: #1a1a1a;">${data.orgName}</h1>
  </div>

  <p>Dear ${data.clientName},</p>

  <p>Please find attached invoice <strong>${data.invoiceNumber}</strong> for <strong>${data.totalFormatted}</strong>.</p>

  <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
    <tr>
      <td style="padding: 8px 0; color: #666;">Invoice Number</td>
      <td style="padding: 8px 0; text-align: right; font-weight: 600;">${data.invoiceNumber}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; color: #666;">Total Amount</td>
      <td style="padding: 8px 0; text-align: right; font-weight: 600;">${data.totalFormatted}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; color: #666;">Due Date</td>
      <td style="padding: 8px 0; text-align: right; font-weight: 600;">${data.dueDate}</td>
    </tr>
  </table>

  <p>If you have any questions, please don't hesitate to reach out.</p>

  <p style="margin-top: 32px; color: #888; font-size: 12px;">
    This email was sent by ${data.orgName} via CreativeFlow PM.
  </p>
</body>
</html>`.trim();
}
