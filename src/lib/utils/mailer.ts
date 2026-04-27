// src/lib/utils/mailer.ts
// Sends price alert emails via SMTP (nodemailer)

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface AlertEmailOptions {
  to: string;
  assetId: string;
  condition: 'above' | 'below';
  targetPrice: number;
  currentPrice: number;
  currency: string;
}

export async function sendPriceAlertEmail(opts: AlertEmailOptions): Promise<void> {
  const { to, assetId, condition, targetPrice, currentPrice, currency } = opts;
  const conditionText = condition === 'above' ? 'rose above' : 'dropped below';
  const sym = currency === 'EGP' ? 'EGP' : '$';

  const html = `
    <!DOCTYPE html>
    <html dir="ltr">
    <head><meta charset="UTF-8"/></head>
    <body style="font-family:Arial,sans-serif;background:#0a0a0b;color:#f3f4f6;padding:40px 20px;margin:0;">
      <div style="max-width:480px;margin:0 auto;background:#18181b;border-radius:16px;padding:32px;border:1px solid rgba(255,255,255,0.08);">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
          <div style="background:#F59E0B22;border-radius:10px;width:40px;height:40px;display:flex;align-items:center;justify-content:center;font-size:20px;">🔔</div>
          <div>
            <h1 style="margin:0;font-size:18px;color:#fff;">Price Alert Triggered</h1>
            <p style="margin:0;font-size:12px;color:#6b7280;">Souq Markets</p>
          </div>
        </div>

        <p style="color:#d1d5db;line-height:1.6;">
          Your price alert for <strong style="color:#F59E0B;">${assetId.toUpperCase()}</strong> has been triggered.
        </p>

        <div style="background:#0a0a0b;border-radius:12px;padding:20px;margin:20px 0;text-align:center;">
          <p style="margin:0 0 4px;font-size:12px;color:#6b7280;">The price ${conditionText} your target</p>
          <p style="margin:0;font-size:28px;font-weight:700;color:#fff;font-family:monospace;">
            ${sym} ${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p style="margin:8px 0 0;font-size:13px;color:#6b7280;">
            Target: ${sym} ${targetPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <a href="${process.env.NEXT_PUBLIC_BASE_URL ?? 'https://your-domain.com'}"
           style="display:block;background:#F59E0B;color:#0a0a0b;text-align:center;padding:12px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
          View Live Prices →
        </a>

        <p style="margin-top:20px;font-size:11px;color:#374151;text-align:center;">
          This alert has been deactivated. Set a new one at souq markets.
        </p>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"Souq Markets" <${process.env.SMTP_USER}>`,
    to,
    subject: `🔔 ${assetId.toUpperCase()} price alert — ${conditionText} ${sym}${targetPrice}`,
    html,
  });
}

/**
 * Check all active alerts against latest prices and send emails if triggered.
 * Call this after every price refresh.
 */
export async function checkAndFireAlerts(prismaClient: any): Promise<void> {
  const alerts = await prismaClient.priceAlert.findMany({
    where: { triggered: false },
  });

  if (alerts.length === 0) return;

  for (const alert of alerts) {
    let currentPrice: number | null = null;

    try {
      if (alert.assetType === 'metal') {
        const record = await prismaClient.metalPrice.findFirst({
          where: { metal: alert.assetId, currency: 'EGP' },
          orderBy: { createdAt: 'desc' },
        });
        currentPrice = record?.pricePerGram ?? null;
      } else if (alert.assetType === 'crypto') {
        const record = await prismaClient.cryptoPrice.findFirst({
          where: { symbol: alert.assetId },
          orderBy: { createdAt: 'desc' },
        });
        currentPrice = record?.priceUSD ?? null;
      } else if (alert.assetType === 'forex') {
        const record = await prismaClient.forexRate.findFirst({
          where: { pair: alert.assetId },
          orderBy: { createdAt: 'desc' },
        });
        currentPrice = record?.rate ?? null;
      }

      if (currentPrice === null) continue;

      const triggered =
        (alert.condition === 'above' && currentPrice >= alert.targetPrice) ||
        (alert.condition === 'below' && currentPrice <= alert.targetPrice);

      if (triggered) {
        // Mark as triggered first to avoid duplicate emails
        await prismaClient.priceAlert.update({
          where: { id: alert.id },
          data: { triggered: true },
        });

        // Send email (only if SMTP is configured)
        if (process.env.SMTP_USER && process.env.SMTP_PASS) {
          await sendPriceAlertEmail({
            to: alert.email,
            assetId: alert.assetId,
            condition: alert.condition,
            targetPrice: alert.targetPrice,
            currentPrice,
            currency: alert.assetType === 'crypto' ? 'USD' : 'EGP',
          }).catch(err => console.error('[Mailer] Failed to send alert:', err));
        }
      }
    } catch (err) {
      console.error(`[Alerts] Error processing alert ${alert.id}:`, err);
    }
  }
}
