import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { fullName, email, subject, message } = await request.json();

    // 1. Validate fields presence
    if (!fullName || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields (Full Name, Email, Subject, and Message) are required.' },
        { status: 400 }
      );
    }

    // 2. Validate lengths
    if (fullName.trim().length > 100) {
      return NextResponse.json({ error: 'Name must be 100 characters or less.' }, { status: 400 });
    }
    if (email.trim().length > 100) {
      return NextResponse.json({ error: 'Email must be 100 characters or less.' }, { status: 400 });
    }
    if (subject.trim().length > 150) {
      return NextResponse.json({ error: 'Subject must be 150 characters or less.' }, { status: 400 });
    }
    if (message.trim().length > 2000) {
      return NextResponse.json({ error: 'Message must be 2000 characters or less.' }, { status: 400 });
    }

    // 3. Email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
    }

    // Basic sanitization/mocking receipt
    console.log(`[Contact Submission Received] Name: ${fullName}, Email: ${email}, Subject: ${subject}`);

    return NextResponse.json({
      success: true,
      message: 'Thank you for reaching out! We have received your message and will get back to you shortly.',
    });
  } catch (error) {
    console.error('Contact submission error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing your request. Please try again later.' },
      { status: 500 }
    );
  }
}
