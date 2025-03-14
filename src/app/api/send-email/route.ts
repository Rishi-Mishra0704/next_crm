import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { sql } from "drizzle-orm";
import { getDbClient } from "@/app/drizzle/db";

export async function POST(req: Request) {
  try {
    const { dbUrl, table, emailField, subject, message } = await req.json();
    if (!dbUrl || !table || !emailField || !subject || !message) 
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    const db = getDbClient(dbUrl);

    // Fetch emails
    const emails = await db.execute(
        sql`SELECT ${sql.raw(emailField)} FROM ${sql.raw(table)}`
      );

    const emailList: string[] = emails.rows.map(row => row[emailField] as string);
    if (!emailList.length) return NextResponse.json({ error: "No emails found" }, { status: 404 });

    // Send emails
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    for (const email of emailList) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject,
        text: message
      });
    }

    return NextResponse.json({ success: true, emailsSent: emailList.length });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to send emails" }, { status: 500 });
  }
}
