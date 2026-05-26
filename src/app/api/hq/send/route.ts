import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { neon } from '@neondatabase/serverless';
import { setupDatabase } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { passcode, to, subject, message } = await req.json();

    // 1. SECURITY CHECK: Ensure only the owner can send emails from here.
    // If ADMIN_PASSCODE is not set in .env, default to a fallback for testing.
    const validPasscode = process.env.ADMIN_PASSCODE || "ROBOVIBE7749";
    
    if (passcode !== validPasscode) {
      return NextResponse.json({ error: "UNAUTHORIZED_ACCESS: Invalid Passcode" }, { status: 401 });
    }

    if (!to || !subject || !message) {
      return NextResponse.json({ error: "MISSING_DATA: Fill all fields" }, { status: 400 });
    }

    // 1.5 Ensure Table Exists & Save to Database
    if (process.env.DATABASE_URL) {
      try {
        await setupDatabase();
        const sql = neon(process.env.DATABASE_URL);
        await sql`
          INSERT INTO message_records (type, email, subject, content)
          VALUES ('SENT', ${to}, ${subject}, ${message})
        `;
      } catch (dbError) {
        console.error("DB Save Error:", dbError);
      }
    }

    // 2. FORMAT THE MESSAGE (Convert line breaks to HTML <br/>)
    const formattedMessage = message.replace(/\n/g, "<br/>");

    // 3. NODEMAILER SETUP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // 4. SEND THE STYLIZED EMAIL TO THE CLIENT
    await transporter.sendMail({
      from: `"ROBOVIBE_HQ" <${process.env.SMTP_USER}>`,
      to: to,
      subject: subject,
      text: message, // Fallback plain text
      html: `
        <div style="background-color: #000; color: #fff; font-family: 'Courier New', Courier, monospace; padding: 40px; border: 4px solid #00f0ff; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #00f0ff; font-style: italic; text-transform: uppercase; letter-spacing: -2px; font-size: 32px; margin-bottom: 5px;">
            TRANSMISSION_INCOMING
          </h1>
          <p style="color: #888; font-size: 12px; margin-bottom: 30px; border-bottom: 1px solid #333; padding-bottom: 10px;">
            [ SECURE_CHANNEL_OPENED // AUTH: ROBOVIBE_ADMIN ]
          </p>
          
          <div style="font-size: 16px; line-height: 1.6; margin-bottom: 40px; color: #fff;">
            ${formattedMessage}
          </div>
          
          <div style="background: #111; padding: 20px; border: 1px solid #333; margin: 30px 0;">
            <code style="color: #00f0ff; font-size: 12px;">
              [ SYSTEM_NOTE ]<br/>
              [ END_OF_TRANSMISSION ]
            </code>
          </div>
          
          <h3 style="color: #fff; margin-top: 40px; font-style: italic;">RE-ESTABLISH_CONNECTION:</h3>
          <div style="margin-bottom: 30px;">
            <a href="https://robotics-web.vercel.app/" style="display: inline-block; background-color: #00f0ff; color: #000; padding: 12px 24px; text-decoration: none; font-weight: bold; text-transform: uppercase; margin-right: 10px; border: 2px solid #00f0ff;">
              >_ENTER_VIBE_LABS
            </a>
            <a href="https://robotics-web.vercel.app/game" style="display: inline-block; background-color: transparent; color: #ff007a; padding: 12px 24px; text-decoration: none; font-weight: bold; text-transform: uppercase; border: 2px solid #ff007a;">
              >_BOOT_ARCADE
            </a>
          </div>

          <hr style="border: 0; border-top: 1px solid #222; margin: 30px 0;" />
          <p style="font-size: 10px; color: #444; text-align: center;">
            © 2026 ROBOVIBE_SYSTEMS_GLOBAL // HQ_COMM_MODULE
          </p>
        </div>
      `,
    });

    return NextResponse.json({ message: "Transmission Sent Successfully" }, { status: 200 });
  } catch (error) {
    console.error("HQ Transmission error:", error);
    return NextResponse.json({ error: "Transmission Failed" }, { status: 500 });
  }
}
