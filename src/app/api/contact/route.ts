import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { neon } from '@neondatabase/serverless';
import { setupDatabase } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    // 0. Ensure Table Exists & Save to Database
    if (process.env.DATABASE_URL) {
      try {
        await setupDatabase();
        const sql = neon(process.env.DATABASE_URL);
        await sql`
          INSERT INTO message_records (type, email, subject, content)
          VALUES ('RECEIVED', ${email}, ${'Contact Form Query from ' + name}, ${message})
        `;
      } catch (dbError) {
        console.error("DB Save Error:", dbError);
      }
    }

    // 1. DISCORD WEBHOOK AUTOMATION (Real-time notification for the owner)
    if (process.env.DISCORD_WEBHOOK_URL) {
      await fetch(process.env.DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: "🚀 **NEW_UPLINK_RECEIVED**",
          embeds: [
            {
              title: "INCOMING DATA PAYLOAD",
              color: 0xff007a, // Hyper-Pink
              fields: [
                { name: "SENDER_ID", value: name, inline: true },
                { name: "UPLINK_NODE", value: email, inline: true },
                { name: "MESSAGE_CONTENT", value: message },
              ],
              footer: { text: "ROBOVIBE_CORE_SYSTEMS" },
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

    // 3. AUTO-REPLY TO CLIENT (Cyber-Vapor Style)
    await transporter.sendMail({
      from: `"ROBOVIBE_SYSTEMS" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "CONNECTION_STABLISHED // ROBOVIBE_UPLINK",
      text: `HEYYY ${name.toUpperCase()},\n\nWE GOT YOUR DATA. OUR SYSTEMS ARE PROCESSING YOUR QUERY RIGHT NOW. STAY VIBEY.\n\n-- ROBOVIBE_CORE`,
      html: `
        <div style="background-color: #000; color: #fff; font-family: 'Courier New', Courier, monospace; padding: 40px; border: 4px solid #ff007a; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #ff007a; font-style: italic; text-transform: uppercase; letter-spacing: -2px; font-size: 32px; margin-bottom: 20px;">
            UPLINK_CONFIRMED
          </h1>
          <p style="font-size: 18px; font-weight: bold; margin-bottom: 20px;">
            YO <span style="color: #ccff00;">${name.toUpperCase()}</span>,
          </p>
          <p style="line-height: 1.6; color: #888;">
            YOUR DATA STREAM HAS BEEN RECEIVED BY OUR CENTRAL CORE. 
            WE ARE ANALYZING YOUR QUERY AT <span style="color: #00f0ff;">MAX_VELOCITY</span>.
          </p>
          <div style="background: #111; padding: 20px; border: 1px solid #333; margin: 30px 0;">
            <code style="color: #ccff00; font-size: 12px;">
              [ STATUS: QUEUED ]<br/>
              [ PRIORITY: HIGH ]<br/>
              [ RESPONSE_NODE: ACTIVE ]
            </code>
          </div>
          
          <h3 style="color: #fff; margin-top: 40px; font-style: italic;">RE-ESTABLISH_CONNECTION:</h3>
          <div style="margin-bottom: 30px;">
            <a href="https://robotics-web-psi.vercel.app/" style="display: inline-block; background-color: #00f0ff; color: #000; padding: 12px 24px; text-decoration: none; font-weight: bold; text-transform: uppercase; margin-right: 10px; border: 2px solid #00f0ff;">
              >_ENTER_VIBE_LABS
            </a>
            <a href="https://robotics-web-psi.vercel.app/game" style="display: inline-block; background-color: transparent; color: #ff007a; padding: 12px 24px; text-decoration: none; font-weight: bold; text-transform: uppercase; border: 2px solid #ff007a;">
              >_BOOT_ARCADE
            </a>
          </div>

          <p style="font-size: 14px; color: #ff007a; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">
            DON'T WAIT. EVOLVE.
          </p>
          <hr style="border: 0; border-top: 1px solid #222; margin: 30px 0;" />
          <p style="font-size: 10px; color: #444; text-align: center;">
            © 2026 ROBOVIBE_SYSTEMS_GLOBAL // AUTO_RESPONSE_MODULE
          </p>
        </div>
      `,
    });

    // 4. BACKUP NOTIFICATION TO OWNER (Traditional Email)
    if (process.env.CONTACT_EMAIL) {
      await transporter.sendMail({
        from: `"ROBOVIBE_ALERTS" <${process.env.SMTP_USER}>`,
        to: process.env.CONTACT_EMAIL,
        subject: `[ALERT] New Query from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
      });
    }

    return NextResponse.json({ message: "Automation triggered successfully" }, { status: 200 });
  } catch (error) {
    console.error("Automation error:", error);
    return NextResponse.json({ error: "Failed to trigger automation" }, { status: 500 });
  }
}
