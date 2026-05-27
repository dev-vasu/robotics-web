import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { neon } from '@neondatabase/serverless';
import { setupDatabase } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { passcode, subject, message } = await req.json();
    const validPasscode = process.env.ADMIN_PASSCODE || "ROBOVIBE7749";

    if (passcode !== validPasscode) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    if (!subject || !message) {
      return NextResponse.json({ error: "MISSING_FIELDS" }, { status: 400 });
    }

    await setupDatabase();
    const sql = neon(process.env.DATABASE_URL!);
    
    // Fetch all unique emails from newsletter subs
    const subscribers = await sql`
      SELECT DISTINCT email 
      FROM message_records 
      WHERE type = 'NEWSLETTER'
    `;

    if (subscribers.length === 0) {
      return NextResponse.json({ message: "NO_SUBSCRIBERS_FOUND" }, { status: 200 });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const formattedMessage = message.replace(/\n/g, "<br/>");
    const emails = subscribers.map(s => s.email);

    // Send in bulk (BCC to hide emails from each other)
    await transporter.sendMail({
      from: `"ROBOVIBE_SQUAD" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // Send to self
      bcc: emails, // All squad members in BCC
      subject: `[SQUAD_BLAST] ${subject}`,
      html: `
        <div style="background-color: #000; color: #fff; font-family: 'Courier New', Courier, monospace; padding: 40px; border: 4px solid #ccff00; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #ccff00; font-style: italic; text-transform: uppercase; letter-spacing: -2px; font-size: 32px; margin-bottom: 20px;">
            SQUAD_TRANSMISSION
          </h1>
          
          <div style="font-size: 16px; line-height: 1.6; margin-bottom: 40px; color: #fff;">
            ${formattedMessage}
          </div>
          
          <h3 style="color: #fff; margin-top: 40px; font-style: italic;">RE-ESTABLISH_CONNECTION:</h3>
          <div style="margin-bottom: 30px;">
            <a href="https://robotics-web-psi.vercel.app/" style="display: inline-block; background-color: #ccff00; color: #000; padding: 12px 24px; text-decoration: none; font-weight: bold; text-transform: uppercase; margin-right: 10px; border: 2px solid #ccff00;">
              >_ENTER_VIBE_LABS
            </a>
          </div>

          <hr style="border: 0; border-top: 1px solid #222; margin: 30px 0;" />
          <p style="font-size: 10px; color: #444; text-align: center;">
            © 2026 ROBOVIBE_SYSTEMS_GLOBAL // SQUAD_MODULE
          </p>
        </div>
      `,
    });

    // Record the blast in DB
    await sql`
      INSERT INTO message_records (type, email, subject, content)
      VALUES ('SENT', 'SQUAD_ALL', ${`[BLAST] ` + subject}, ${message})
    `;

    return NextResponse.json({ message: `Blast sent to ${subscribers.length} members` }, { status: 200 });
  } catch (error) {
    console.error("Squad Blast Error:", error);
    return NextResponse.json({ error: "Failed to send blast" }, { status: 500 });
  }
}
