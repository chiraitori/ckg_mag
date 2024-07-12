import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';

const uri = process.env.MONGODB_URI as string;
const client = new MongoClient(uri);

async function connectToDatabase() {
  await client.connect();
  return client.db(process.env.MONGODB_DB);
}

export async function POST(req: NextRequest) {
  const { email, pin, newPassword } = await req.json();
  const db = await connectToDatabase();
  const users = db.collection('users');

  if (email && !pin && !newPassword) {
    // Step 1: Send verification PIN
    const user = await users.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const verificationPin = Math.floor(100000 + Math.random() * 900000).toString();
    const pinExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    await users.updateOne(
      { _id: user._id },
      { $set: { resetPin: verificationPin, resetPinExpiry: pinExpiry } }
    );

    // Configure nodemailer (replace with your SMTP settings)
    let transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Email HTML template with avatar
    const avatarUrl = 'https://web-ckg.pages.dev/favicon.ico'; // Replace with the actual avatar URL
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <div style="display: flex; align-items: center; margin-bottom: 20px;">
          <img src="${avatarUrl}" alt="Avatar" style="width: 50px; height: 50px; border-radius: 50%; margin-right: 10px;">
          <h2 style="margin: 0;">Trang Trại Gà</h2>
        </div>
        <p>Your verification PIN is: <strong>${verificationPin}</strong>. This PIN will expire in 15 minutes.</p>
      </div>
    `;

    // Send email
    await transporter.sendMail({
      from: '"Trang Trại Gà" <no-reply@chiraitori.io.vn>',
      to: email,
      subject: 'Password Reset Verification',
      text: `Your verification PIN is: ${verificationPin}. This PIN will expire in 15 minutes.`,
      html: emailHtml
    });

    return NextResponse.json({ message: 'Verification PIN sent' });
  } else if (email && pin && !newPassword) {
    // Step 2: Verify PIN
    const user = await users.findOne({
      email,
      resetPin: pin,
      resetPinExpiry: { $gt: new Date() }
    });

    if (!user) {
      return NextResponse.json({ message: 'Invalid or expired PIN' }, { status: 400 });
    }

    return NextResponse.json({ message: 'PIN verified' });
  } else if (email && pin && newPassword) {
    // Step 3: Reset password
    const user = await users.findOne({
      email,
      resetPin: pin,
      resetPinExpiry: { $gt: new Date() }
    });

    if (!user) {
      return NextResponse.json({ message: 'Invalid or expired PIN' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await users.updateOne(
      { _id: user._id },
      {
        $set: { password: hashedPassword },
        $unset: { resetPin: "", resetPinExpiry: "" }
      }
    );

    return NextResponse.json({ message: 'Password reset successfully' });
  }

  return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
}
