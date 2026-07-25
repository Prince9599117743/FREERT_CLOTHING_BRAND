// Brevo Transactional Email Service
// Sends emails via Brevo API v3 from order@freert.in

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

export interface EmailPayload {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
  sender?: { email: string; name: string };
}

export async function sendTransactionalEmail(payload: EmailPayload): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    console.error('[Brevo] BREVO_API_KEY is not set in environment variables.');
    return { success: false, error: 'Email service not configured.' };
  }

  const body = {
    sender: payload.sender || {
      email: 'freertofficial@gmail.com',
      name: 'FREERT'
    },
    to: payload.to,
    subject: payload.subject,
    htmlContent: payload.htmlContent
  };

  try {
    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const msg = (errorData as any)?.message || `Brevo API error: ${response.status}`;
      console.error('[Brevo] Email send failed:', msg);
      return { success: false, error: msg };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[Brevo] Network error:', err.message);
    return { success: false, error: err.message };
  }
}
