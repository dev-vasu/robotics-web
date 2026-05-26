import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { neon } from '@neondatabase/serverless';
import { setupDatabase } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, feature, feedback } = await req.json();
    
    // Generate Unique Ticket ID
    const ticketId = "TKT-" + Math.random().toString(36).substring(2, 8).toUpperCase();

    // 0. Ensure Table Exists & Save to Database
    if (process.env.DATABASE_URL) {
      try {
        await setupDatabase();
        const sql = neon(process.env.DATABASE_URL);
        await sql`
          INSERT INTO message_records (type, email, subject, content)
          VALUES ('FEEDBACK', ${email}, ${`[${ticketId}] REPORT: ` + feature}, ${feedback})
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
          content: `⚠️ **NEW_PROBLEM_REPORTED [${ticketId}]**`,
          embeds: [
            {
              title: `TICKET: ${ticketId} // ${feature}`,
              color: 0xffaa00, // Cyber-Yellow/Orange for feedback
              fields: [
                { name: "USER_NODE", value: email, inline: true },
                { name: "TARGET_MODULE", value: feature, inline: true },
                { name: "DIAGNOSTIC_DATA", value: feedback },
              ],
              footer: { text: "ROBOVIBE_SUPPORT_SYSTEMS" },
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

    // 3. AUTO-REPLY TO CLIENT (Including Ticket ID)
    await transporter.sendMail({
      from: `"ROBOVIBE_SUPPORT" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `[${ticketId}] ISSUE_LOGGED // ROBOVIBE`,
      html: `
        <div style="background-color: #000; color: #fff; font-family: 'Courier New', Courier, monospace; padding: 40px; border: 4px solid #ffaa00; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #ffaa00; font-style: italic; text-transform: uppercase; letter-spacing: -2px; font-size: 32px; margin-bottom: 20px;">
            PROBLEM_REPORT_RECEIVED
          </h1>
          <p style="font-size: 18px; font-weight: bold; margin-bottom: 20px;">
            YO, THANKS FOR THE INTEL.
          </p>
          <p style="line-height: 1.6; color: #888;">
            YOUR REPORT REGARDING <span style="color: #00f0ff;">${feature}</span> HAS BEEN INGESTED BY OUR CORE. WE APPRECIATE YOU HELPING US FIX THE BUGS.
          </p>
          
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
          
          <h3 style="color: #fff; margin-top: 40px; font-style: italic;">RETURN_TO_PLAYGROUND:</h3>
          <div style="margin-bottom: 30px;">
            <a href="https://robotics-web-psi.vercel.app/playground" style="display: inline-block; background-color: #ffaa00; color: #000; padding: 12px 24px; text-decoration: none; font-weight: bold; text-transform: uppercase; margin-right: 10px; border: 2px solid #ffaa00;">
              >_CONTINUE_TESTING
            </a>
          </div>

          <hr style="border: 0; border-top: 1px solid #222; margin: 30px 0;" />
          <p style="font-size: 10px; color: #444; text-align: center;">
            © 2026 ROBOVIBE_SYSTEMS_GLOBAL // SUPPORT_MODULE
          </p>
        </div>
      `,
    });

    // 4. OWNER NOTIFICATION
    if (process.env.CONTACT_EMAIL) {
      await transporter.sendMail({
        from: `"ROBOVIBE_ALERTS" <${process.env.SMTP_USER}>`,
        to: process.env.CONTACT_EMAIL,
        subject: `[${ticketId}] NEW BUG REPORT: ${feature}`,
        text: `Ticket: ${ticketId}\nTarget: ${feature}\nEmail: ${email}\nFeedback: ${feedback}`,
      });
    }

    return NextResponse.json({ message: "Feedback logged successfully", ticketId }, { status: 200 });
  } catch (error) {
    console.error("Feedback error:", error);
    return NextResponse.json({ error: "Failed to log feedback" }, { status: 500 });
  }
}
