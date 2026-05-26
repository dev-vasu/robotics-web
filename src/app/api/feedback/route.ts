import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { neon } from '@neondatabase/serverless';
import { setupDatabase } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, feature, feedback } = await req.json();

    // 0. Ensure Table Exists & Save to Database
    if (process.env.DATABASE_URL) {
      try {
        await setupDatabase();
        const sql = neon(process.env.DATABASE_URL);
        await sql`
          INSERT INTO message_records (type, email, subject, content)
          VALUES ('FEEDBACK', ${email}, ${'FEEDBACK: ' + feature}, ${feedback})
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
          content: "⚠️ **NEW_USER_FEEDBACK_RECEIVED**",
          embeds: [
            {
              title: `VIBE CHECK: ${feature}`,
              color: 0xffaa00, // Cyber-Yellow/Orange for feedback
              fields: [
                { name: "USER_NODE", value: email, inline: true },
                { name: "TARGET_MODULE", value: feature, inline: true },
                { name: "DIAGNOSTIC_DATA", value: feedback },
              ],
              footer: { text: "ROBOVIBE_FEEDBACK_SYSTEMS" },
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

    // 3. AUTO-REPLY TO CLIENT (Thanking them for feedback)
    await transporter.sendMail({
      from: `"ROBOVIBE_SYSTEMS" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "FEEDBACK_LOGGED // ROBOVIBE",
      html: `
        <div style="background-color: #000; color: #fff; font-family: 'Courier New', Courier, monospace; padding: 40px; border: 4px solid #ffaa00; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #ffaa00; font-style: italic; text-transform: uppercase; letter-spacing: -2px; font-size: 32px; margin-bottom: 20px;">
            DIAGNOSTIC_LOGGED
          </h1>
          <p style="font-size: 18px; font-weight: bold; margin-bottom: 20px;">
            YO, THANKS FOR THE INTEL.
          </p>
          <p style="line-height: 1.6; color: #888;">
            YOUR FEEDBACK ON <span style="color: #00f0ff;">${feature}</span> HAS BEEN INGESTED BY OUR CORE. WE APPRECIATE YOU HELPING US OPTIMIZE THE VIBE.
          </p>
          
          <h3 style="color: #fff; margin-top: 40px; font-style: italic;">RETURN_TO_PLAYGROUND:</h3>
          <div style="margin-bottom: 30px;">
            <a href="https://robotics-web-psi.vercel.app/playground" style="display: inline-block; background-color: #ffaa00; color: #000; padding: 12px 24px; text-decoration: none; font-weight: bold; text-transform: uppercase; margin-right: 10px; border: 2px solid #ffaa00;">
              >_CONTINUE_TESTING
            </a>
          </div>

          <hr style="border: 0; border-top: 1px solid #222; margin: 30px 0;" />
          <p style="font-size: 10px; color: #444; text-align: center;">
            © 2026 ROBOVIBE_SYSTEMS_GLOBAL // FEEDBACK_MODULE
          </p>
        </div>
      `,
    });

    // 4. OWNER NOTIFICATION
    if (process.env.CONTACT_EMAIL) {
      await transporter.sendMail({
        from: `"ROBOVIBE_ALERTS" <${process.env.SMTP_USER}>`,
        to: process.env.CONTACT_EMAIL,
        subject: `[FEEDBACK] ${feature} - from ${email}`,
        text: `Target: ${feature}\nEmail: ${email}\nFeedback: ${feedback}`,
      });
    }

    return NextResponse.json({ message: "Feedback logged successfully" }, { status: 200 });
  } catch (error) {
    console.error("Feedback error:", error);
    return NextResponse.json({ error: "Failed to log feedback" }, { status: 500 });
  }
}
