import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { neon } from '@neondatabase/serverless';
import { setupDatabase } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, feature, feedback, type } = await req.json();
    
    // Only generate Ticket ID for Bug Reports
    const isBug = type === "BUG_REPORT";
    const ticketId = isBug ? Math.floor(100000 + Math.random() * 900000).toString() : null;
    const dbType = isBug ? "TICKET" : "FEEDBACK";

    // 0. Ensure Table Exists & Save to Database
    if (process.env.DATABASE_URL) {
      try {
        await setupDatabase();
        const sql = neon(process.env.DATABASE_URL);
        await sql`
          INSERT INTO message_records (type, email, subject, content)
          VALUES (${dbType}, ${email}, ${isBug ? `[${ticketId}] REPORT: ` + feature : `FEEDBACK: ` + feature}, ${feedback})
        `;
      } catch (dbError) {
        console.error("DB Save Error:", dbError);
      }
    }

    // 1. DISCORD WEBHOOK AUTOMATION
    if (process.env.DISCORD_WEBHOOK_URL) {
      await fetch(process.env.DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: isBug ? `⚠️ **NEW_PROBLEM_REPORTED [${ticketId}]**` : `💡 **NEW_FEEDBACK_RECEIVED**`,
          embeds: [
            {
              title: isBug ? `TICKET: ${ticketId} // ${feature}` : `VIBE_CHECK // ${feature}`,
              color: isBug ? 0xffaa00 : 0x00f0ff,
              fields: [
                { name: "USER_NODE", value: email, inline: true },
                { name: "TARGET_MODULE", value: feature, inline: true },
                { name: "DIAGNOSTIC_DATA", value: feedback },
              ],
              footer: { text: isBug ? "ROBOVIBE_SUPPORT_SYSTEMS" : "ROBOVIBE_FEEDBACK_SYSTEMS" },
              timestamp: new Date().toISOString(),
            },
          ],
        }),
      });
    }

    // 2. NODEMAILER SETUP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // 3. AUTO-REPLY TO CLIENT
    await transporter.sendMail({
      from: `"ROBOVIBE_SYSTEMS" <${process.env.SMTP_USER}>`,
      to: email,
      subject: isBug ? `[${ticketId}] ISSUE_LOGGED // ROBOVIBE` : "FEEDBACK_LOGGED // ROBOVIBE",
      html: `
        <div style="background-color: #000; color: #fff; font-family: 'Courier New', Courier, monospace; padding: 40px; border: 4px solid ${isBug ? '#ffaa00' : '#00f0ff'}; max-width: 600px; margin: 0 auto;">
          <h1 style="color: ${isBug ? '#ffaa00' : '#00f0ff'}; font-style: italic; text-transform: uppercase; letter-spacing: -2px; font-size: 32px; margin-bottom: 20px;">
            ${isBug ? 'PROBLEM_REPORT_RECEIVED' : 'FEEDBACK_INGESTED'}
          </h1>
          <p style="font-size: 18px; font-weight: bold; margin-bottom: 20px;">
            YO, THANKS FOR THE INTEL.
          </p>
          <p style="line-height: 1.6; color: #888;">
            YOUR ${isBug ? 'REPORT' : 'FEEDBACK'} REGARDING <span style="color: #ff007a;">${feature}</span> HAS BEEN INGESTED BY OUR CORE. WE APPRECIATE YOU HELPING US OPTIMIZE THE VIBE.
          </p>
          
          ${isBug ? `
          <div style="background: #111; padding: 20px; border: 1px solid #333; margin: 30px 0;">
            <code style="color: #ffaa00; font-size: 14px; font-weight: bold;">
              [ TICKET_ID: ${ticketId} ]<br/>
              [ STATUS: OPEN_INVESTIGATION ]<br/>
              [ PRIORITY: HIGH ]
            </code>
          </div>
          <p style="line-height: 1.6; color: #888; margin-bottom: 30px;">
            Keep this Ticket ID for your records. If our engineers need more data, they will reply directly to this thread.
          </p>
          ` : ''}
          
          <h3 style="color: #fff; margin-top: 40px; font-style: italic;">RETURN_TO_PLAYGROUND:</h3>
          <div style="margin-bottom: 30px;">
            <a href="https://robotics-web-psi.vercel.app/playground" style="display: inline-block; background-color: ${isBug ? '#ffaa00' : '#00f0ff'}; color: #000; padding: 12px 24px; text-decoration: none; font-weight: bold; text-transform: uppercase; margin-right: 10px; border: 2px solid ${isBug ? '#ffaa00' : '#00f0ff'};">
              >_CONTINUE_TESTING
            </a>
          </div>

          <hr style="border: 0; border-top: 1px solid #222; margin: 30px 0;" />
          <p style="font-size: 10px; color: #444; text-align: center;">
            © 2026 ROBOVIBE_SYSTEMS_GLOBAL // ${isBug ? 'SUPPORT' : 'FEEDBACK'}_MODULE
          </p>
        </div>
      `,
    });

    // 4. OWNER NOTIFICATION
    if (process.env.CONTACT_EMAIL) {
      await transporter.sendMail({
        from: `"ROBOVIBE_ALERTS" <${process.env.SMTP_USER}>`,
        to: process.env.CONTACT_EMAIL,
        subject: isBug ? `[${ticketId}] NEW BUG REPORT: ${feature}` : `[FEEDBACK] New Intel: ${feature}`,
        text: `Type: ${type}\nTicket: ${ticketId || 'N/A'}\nTarget: ${feature}\nEmail: ${email}\nFeedback: ${feedback}`,
      });
    }

    return NextResponse.json({ message: "Success", ticketId }, { status: 200 });
  } catch (error) {
    console.error("Feedback error:", error);
    return NextResponse.json({ error: "Failed to process" }, { status: 500 });
  }
}
