// Sends via Meta WhatsApp Cloud API. Business-initiated messages outside the
// 24h customer-service window require a pre-approved message template —
// set WHATSAPP_TEMPLATE_NAME to the template's name (must accept 2 body
// params: firm name and demo URL) once it's approved in Meta Business Manager.

function normalizeTrPhone(raw: string): string {
  const digits = raw.replace(/[^\d+]/g, "")
  if (digits.startsWith("+")) return digits.slice(1)
  if (digits.startsWith("0")) return `90${digits.slice(1)}`
  if (digits.startsWith("90")) return digits
  return `90${digits}`
}

export async function sendWhatsappTemplate(opts: {
  to: string
  firmName: string
  demoUrl: string
}): Promise<string> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME

  if (!phoneNumberId || !accessToken || !templateName) {
    throw new Error("WhatsApp not configured (WHATSAPP_PHONE_NUMBER_ID / WHATSAPP_ACCESS_TOKEN / WHATSAPP_TEMPLATE_NAME)")
  }

  const to = normalizeTrPhone(opts.to)

  const res = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: templateName,
        language: { code: "tr" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: opts.firmName },
              { type: "text", text: opts.demoUrl },
            ],
          },
        ],
      },
    }),
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(`WhatsApp send failed: ${JSON.stringify(data)}`)
  }

  return data.messages?.[0]?.id ?? ""
}
