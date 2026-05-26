import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { neon } from '@neondatabase/serverless';
import { setupDatabase } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    // 0. Ensure Table Exists & Save to Database
    if (process.env.DATABASE_URL) {
      try {
        await setupDatabase();
        const sql = neon(process.env.DATABASE_URL);
        await sql`
          INSERT INTO message_records (type, email, subject, content)
          VALUES ('NEWSLETTER', ${email}, 'New Newsletter Subscription', 'User joined the squad.')
        `;
      } catch (dbError) {
        console.error("DB Save Error:", dbError);
      }
    }

    // 1. DISCORD NOTIFICATION
    if (process.env.DISCORD_WEBHOOK_URL) {
      await fetch(process.env.DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: "🔥 **NEW_SQUAD_MEMBER_JOINED**",
          embeds: [
            {
              title: "NEWSLETTER_SUBSCRIPTION",
              color: 0xccff00, // Electric-Volt
              fields: [
                { name: "MEMBER_NODE", value: email },
              ],
              footer: { text: "ROBOVIBE_INTEL_SYSTEMS" },
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

    // 3. WELCOME EMAIL TO USER
    await transporter.sendMail({
      from: `"ROBOVIBE_INTEL" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "WELCOME_TO_THE_SQUAD // ACCESS_GRANTED",
      text: `YO,\n\nWELCOME TO THE INNER CIRCLE. YOUR SUBSCRIPTION TO ROBOVIBE INTEL IS CONFIRMED. PREPARE FOR THE FUTURE.\n\n-- ROBOVIBE_CORE`,
      html: `
        <div style="background-color: #000; color: #fff; font-family: 'Courier New', Courier, monospace; padding: 40px; border: 4px solid #ccff00; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #ccff00; font-style: italic; text-transform: uppercase; letter-spacing: -2px; font-size: 32px; margin-bottom: 20px;">
            SQUAD_ACCESS_GRANTED
          </h1>
          <p style="font-size: 18px; font-weight: bold; margin-bottom: 20px;">
            YO NEW MEMBER,
          </p>
          <p style="line-height: 1.6; color: #888;">
            YOU HAVE SUCCESSFULLY LINKED YOUR NODE TO <span style="color: #ff007a;">ROBOVIBE_INTEL</span>. 
            PREPARE FOR EXCLUSIVE DATA DROPS ON ROBOTICS AND AUTOMATION.
          </p>
          <div style="background: #111; padding: 20px; border: 1px solid #333; margin: 30px 0;">
            <code style="color: #ff007a; font-size: 12px;">
              [ STATUS: ENROLLED ]<br/>
              [ CHANNEL: SECURE ]<br/>
              [ VIBE_CHECK: OPTIMAL ]
            </code>
          </div>
          
          <h3 style="color: #fff; margin-top: 40px; font-style: italic;">RE-ESTABLISH_CONNECTION:</h3>
          <div style="margin-bottom: 30px;">
            <a href="https://robotics-web-psi.vercel.app/" style="display: inline-block; background-color: #ff007a; color: #000; padding: 12px 24px; text-decoration: none; font-weight: bold; text-transform: uppercase; margin-right: 10px; border: 2px solid #ff007a;">
              >_ENTER_VIBE_LABS
            </a>
            <a href="https://robotics-web-psi.vercel.app/game" style="display: inline-block; background-color: transparent; color: #ccff00; padding: 12px 24px; text-decoration: none; font-weight: bold; text-transform: uppercase; border: 2px solid #ccff00;">
              >_BOOT_ARCADE
            </a>
          </div>

          <p style="font-size: 14px; color: #ccff00; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">
            THE FUTURE DOESN'T WAIT.
          </p>
          <hr style="border: 0; border-top: 1px solid #222; margin: 30px 0;" />
          <p style="font-size: 10px; color: #444; text-align: center;">
            © 2026 ROBOVIBE_SYSTEMS_GLOBAL // NEWSLETTER_MODULE
          </p>
        </div>
      `,
    });

    // 4. OWNER NOTIFICATION
    if (process.env.CONTACT_EMAIL) {
      await transporter.sendMail({
        from: `"ROBOVIBE_ALERTS" <${process.env.SMTP_USER}>`,
        to: process.env.CONTACT_EMAIL,
        subject: `[SQUAD] New Newsletter Signup: ${email}`,
        text: `A new user has joined the squad: ${email}`,
      });
    }

    return NextResponse.json({ message: "Newsletter signup successful" }, { status: 200 });
  } catch (error) {
    console.error("Newsletter error:", error);
    return NextResponse.json({ error: "Failed to process signup" }, { status: 500 });
  }
}
