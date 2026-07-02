import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

function unsubscribeFooter(to: string): string {
  return `
    <div style="background:#f8fafc;padding:16px 32px;border-top:1px solid #e5e7eb">
      <p style="color:#9ca3af;font-size:12px;margin:0;text-align:center">
        Bu e-postayı almak istemiyorsanız
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?email=${encodeURIComponent(to)}" style="color:#6b7280">buraya tıklayın</a>.
      </p>
    </div>`
}

function trackingPixel(logId: string): string {
  return `<img src="${process.env.NEXT_PUBLIC_APP_URL}/api/track/open/${logId}" width="1" height="1" style="display:none" alt="" />`
}

function trackedClickUrl(logId: string): string {
  return `${process.env.NEXT_PUBLIC_APP_URL}/api/track/click/${logId}`
}

export async function sendDemoEmail(opts: {
  to: string
  firmName: string
  demoUrl: string
  logId: string
  senderName?: string
}) {
  const { to, firmName, demoUrl, logId, senderName = "LeadAuto" } = opts
  void demoUrl // real destination is resolved server-side by the click-tracking redirect

  const html = `
<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:560px;margin:40px auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1)">
    <div style="background:#2563eb;padding:32px;text-align:center">
      <div style="color:white;font-size:22px;font-weight:700">⚡ Web Siteniz Hazır!</div>
    </div>
    <div style="padding:32px">
      <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 16px">
        Sayın <strong>${firmName}</strong> yetkilisi,
      </p>
      <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px">
        İşletmeniz için <strong>ücretsiz bir demo web sitesi</strong> hazırladık.
        Müşterileriniz sizi kolayca bulabilsin, iletişime geçebilsin diye tasarladık.
      </p>
      <div style="text-align:center;margin:32px 0">
        <a href="${trackedClickUrl(logId)}"
           style="display:inline-block;background:#2563eb;color:white;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:16px;font-weight:600">
          Demo Sitenizi Görüntüleyin →
        </a>
      </div>
      <p style="color:#6b7280;font-size:13px;line-height:1.6;margin:24px 0 0">
        Bu sitenin sizin için özelleştirilmesi, kendi alan adınıza taşınması ve
        Google'da çıkması için cevap vermeniz yeterli.
      </p>
    </div>
    ${unsubscribeFooter(to)}
  </div>
  ${trackingPixel(logId)}
</body>
</html>`

  const info = await transporter.sendMail({
    from: `"${senderName}" <${process.env.GMAIL_USER}>`,
    to,
    subject: `${firmName} — Web siteniz hazır, ücretsiz inceleyin`,
    html,
  })

  return info.messageId
}

export async function sendFollowupEmail(opts: {
  to: string
  firmName: string
  demoUrl: string
  logId: string
  senderName?: string
}) {
  const { to, firmName, logId, senderName = "LeadAuto" } = opts

  const html = `
<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:560px;margin:40px auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1)">
    <div style="background:#2563eb;padding:32px;text-align:center">
      <div style="color:white;font-size:22px;font-weight:700">👋 Hatırlatma</div>
    </div>
    <div style="padding:32px">
      <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 16px">
        Sayın <strong>${firmName}</strong> yetkilisi,
      </p>
      <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px">
        Birkaç gün önce sizin için hazırladığımız <strong>ücretsiz demo web sitesini</strong> incelediniz mi?
        Beğenirseniz kendi alan adınıza taşıyıp yayına alabiliriz.
      </p>
      <div style="text-align:center;margin:32px 0">
        <a href="${trackedClickUrl(logId)}"
           style="display:inline-block;background:#2563eb;color:white;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:16px;font-weight:600">
          Demo Sitenizi Görüntüleyin →
        </a>
      </div>
    </div>
    ${unsubscribeFooter(to)}
  </div>
  ${trackingPixel(logId)}
</body>
</html>`

  const info = await transporter.sendMail({
    from: `"${senderName}" <${process.env.GMAIL_USER}>`,
    to,
    subject: `${firmName} — Demo web siteniz hâlâ hazır bekliyor`,
    html,
  })

  return info.messageId
}
