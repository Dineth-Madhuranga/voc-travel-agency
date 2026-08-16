import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

type InquiryPayload = {
  id?: string;
  kind: "booking" | "contact";
  name: string;
  email: string;
  phone?: string | null;
  package_name?: string | null;
  arrival_date?: string | null;
  travelers?: number | null;
  message?: string | null;
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const resendApiKey = Deno.env.get("RESEND_API_KEY");

const fromEmail = "bookings@voiceofindigenous.com";
const teamEmail = "hello@voiceofindigenous.com";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildEmailHtml(inquiry: InquiryPayload, recipientLabel: string): string {
  const rows = [
    ["Name", inquiry.name],
    ["Email", inquiry.email],
    ["Phone", inquiry.phone ?? "—"],
    inquiry.kind === "booking" ? ["Journey", inquiry.package_name || "Not sure yet"] : ["Type", "Contact message"],
    inquiry.kind === "booking" ? ["Arrival date", inquiry.arrival_date ?? "—"] : null,
    inquiry.kind === "booking" ? ["Travelers", String(inquiry.travelers ?? "—")] : null,
  ].filter(Boolean) as [string, string][];

  const detailsHtml = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#5a6b60;font-weight:500;">${escapeHtml(label)}</td><td style="padding:6px 0;">${escapeHtml(value)}</td></tr>`
    )
    .join("");

  const messageBlock = inquiry.message
    ? `<div style="margin-top:24px;padding:16px 20px;background:#f6f1e6;border-radius:8px;color:#1c1c1a;line-height:1.6;">${escapeHtml(inquiry.message)}</div>`
    : "";

  const heading =
    inquiry.kind === "booking"
      ? "New journey enquiry"
      : "New contact message";

  return `<!doctype html>
<html><body style="margin:0;background:#14201a;font-family:Inter,Arial,sans-serif;">
  <div style="max-width:560px;margin:24px auto;background:#ffffff;border-radius:12px;overflow:hidden;">
    <div style="background:#1d2b22;padding:28px 32px;color:#f6f1e6;">
      <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#d9b585;font-weight:600;">Voice of Indigenous Travel</div>
      <div style="font-family:Georgia,serif;font-size:22px;margin-top:6px;">${escapeHtml(heading)}</div>
    </div>
    <div style="padding:28px 32px;color:#1c1c1a;">
      <p style="margin:0 0 16px;color:#5a6b60;">${escapeHtml(recipientLabel)},</p>
      <table style="border-collapse:collapse;font-size:14px;color:#1c1c1a;">${detailsHtml}</table>
      ${messageBlock}
      <p style="margin-top:28px;font-size:13px;color:#5a6b60;line-height:1.6;">We look forward to crafting this journey. Reply to this email to reach the guest directly.</p>
    </div>
    <div style="padding:18px 32px;background:#f6f1e6;font-size:11px;color:#5a6b60;">© 2026 Voice of Indigenous Travel · Ceylon Travels</div>
  </div>
</body></html>`;
}

function buildEmailText(inquiry: InquiryPayload): string {
  const lines = [
    inquiry.kind === "booking" ? "NEW JOURNEY ENQUIRY" : "NEW CONTACT MESSAGE",
    "",
    `Name: ${inquiry.name}`,
    `Email: ${inquiry.email}`,
    `Phone: ${inquiry.phone ?? "—"}`,
  ];
  if (inquiry.kind === "booking") {
    lines.push(`Journey: ${inquiry.package_name || "Not sure yet"}`);
    lines.push(`Arrival date: ${inquiry.arrival_date ?? "—"}`);
    lines.push(`Travelers: ${inquiry.travelers ?? "—"}`);
  }
  if (inquiry.message) lines.push("", "Message:", inquiry.message);
  return lines.join("\n");
}

async function sendEmails(inquiry: InquiryPayload) {
  if (!resendApiKey) {
    return { skipped: true, reason: "RESEND_API_KEY not configured" };
  }

  const teamHtml = buildEmailHtml(inquiry, "Hi travel team");
  const guestHtml = buildEmailHtml(inquiry, `Hi ${inquiry.name.split(" ")[0] || "there"}`);
  const textVersion = buildEmailText(inquiry);

  const teamPayload = {
    from: fromEmail,
    to: teamEmail,
    subject: inquiry.kind === "booking"
      ? `New booking enquiry — ${inquiry.name}${inquiry.package_name ? ` · ${inquiry.package_name}` : ""}`
      : `New contact message — ${inquiry.name}`,
    html: teamHtml,
    text: textVersion,
    reply_to: inquiry.email,
  };

  const guestPayload = {
    from: fromEmail,
    to: inquiry.email,
    subject: "We received your enquiry — Voice of Indigenous Travel",
    html: guestHtml,
    text: `Hi ${inquiry.name},\n\nThank you for reaching out. Our travel team has received your enquiry and will be in touch soon with thoughtful next steps.\n\nWith care,\nVoice of Indigenous Travel`,
  };

  const responses = await Promise.allSettled(
    [teamPayload, guestPayload].map(async (payload) => {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Resend ${payload.to} failed ${res.status}: ${body}`);
      }
      return res.json();
    })
  );

  const failed = responses
    .map((r, i) => (r.status === "rejected" ? { to: i === 0 ? teamEmail : inquiry.email, error: String(r.reason) } : null))
    .filter(Boolean);

  if (failed.length > 0) {
    throw new Error(`Some emails failed: ${JSON.stringify(failed)}`);
  }

  return { sent: true, recipients: [teamEmail, inquiry.email] };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const inquiry: InquiryPayload = await req.json();

    if (!inquiry?.email || !inquiry?.name) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let persisted = inquiry;
    if (!inquiry.id && supabaseUrl && serviceRoleKey) {
      const serviceClient = createClient(supabaseUrl, serviceRoleKey);
      const { data, error } = await serviceClient
        .from("travel_inquiries")
        .insert({
          kind: inquiry.kind,
          name: inquiry.name,
          email: inquiry.email,
          phone: inquiry.phone ?? null,
          package_name: inquiry.package_name ?? null,
          arrival_date: inquiry.arrival_date ?? null,
          travelers: inquiry.travelers ?? null,
          message: inquiry.message ?? null,
          status: "new",
        })
        .select("id")
        .single();
      if (!error && data) {
        persisted = { ...inquiry, id: data.id as string };
      }
    }

    const emailResult = await sendEmails(persisted);

    return new Response(
      JSON.stringify({ ok: true, inquiryId: persisted.id ?? null, email: emailResult }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("send-inquiry-email failed", err);
    return new Response(
      JSON.stringify({ error: "Could not process the enquiry. Please try again later." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
