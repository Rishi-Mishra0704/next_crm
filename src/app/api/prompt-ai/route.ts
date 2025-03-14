import { NextResponse } from "next/server";


export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
   
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to send emails" }, { status: 500 });
  }
}
