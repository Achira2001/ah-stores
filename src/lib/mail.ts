import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`
  
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Verify your email - AH Store Sri Lanka",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af;">Welcome to AH Store Sri Lanka!</h2>
        <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
        <a href="${verifyUrl}" 
           style="display: inline-block; background: #1e40af; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Verify Email Address
        </a>
        <p>Or copy and paste this link:</p>
        <p style="word-break: break-all; color: #666;">${verifyUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
        <p style="color: #999; font-size: 12px;">If you didn't create an account, you can safely ignore this email.</p>
      </div>
    `,
  })
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`
  
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Password Reset Request - AH Store Sri Lanka",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af;">Password Reset Request</h2>
        <p>You requested a password reset. Click the button below to reset your password:</p>
        <a href="${resetUrl}" 
           style="display: inline-block; background: #f97316; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Reset Password
        </a>
        <p>Or copy and paste this link:</p>
        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
        <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
  })
}

export async function sendOrderConfirmationEmail(email: string, orderDetails: any) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Order Confirmation #${orderDetails.orderId} - AH Store`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af;">Order Confirmed!</h2>
        <p>Thank you for your order. Here are your order details:</p>
        <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Order ID:</strong> #${orderDetails.orderId}</p>
          <p><strong>Total:</strong> LKR ${orderDetails.total.toLocaleString()}</p>
          <p><strong>Payment:</strong> ${orderDetails.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card Payment'}</p>
        </div>
        <p>We'll notify you when your order is shipped.</p>
      </div>
    `,
  })
}
