import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.SENDER_EMAIL || "orders@yourdomain.com";

interface OrderEmailProps {
  toEmail: string;
  customerName: string;
  orderId: string;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  totalAmount: number;
}

const STATUS_CONTENT: Record<
  string,
  { subject: string; headline: string; message: string; badgeColor: string }
> = {
  Processing: {
    subject: "Your order is being processed!",
    headline: "We're preparing your order 📦",
    message: "Great news! Your order has been received and is currently being packed by our fulfillment team.",
    badgeColor: "#2563eb", // Blue
  },
  Shipped: {
    subject: "Your order has shipped!",
    headline: "Your package is on its way! 🚚",
    message: "Your order has been dispatched from our warehouse. It should arrive within 2-5 business days.",
    badgeColor: "#9333ea", // Purple
  },
  Delivered: {
    subject: "Your order has been delivered!",
    headline: "Order Delivered! 🎉",
    message: "Your items have arrived at your delivery destination. We hope you enjoy your purchase!",
    badgeColor: "#16a34a", // Green
  },
  Cancelled: {
    subject: "Order Cancellation Notice",
    headline: "Your order was cancelled",
    message: "Your order has been cancelled. If you were charged, a full refund will be processed back to your payment method.",
    badgeColor: "#dc2626", // Red
  },
};

export async function sendOrderStatusEmail({
  toEmail,
  customerName,
  orderId,
  status,
  totalAmount,
}: OrderEmailProps) {
  // Skip sending if email is missing or status is still Pending
  if (!toEmail || !STATUS_CONTENT[status]) return;

  const content = STATUS_CONTENT[status];
  const shortId = orderId.substring(orderId.length - 8);

  const htmlBody = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 20px; }
          .container { max-width: 560px; margin: 0 auto; background: #ffffff; padding: 32px; border-radius: 16px; border: 1px solid #e4e4e7; }
          .badge { display: inline-block; padding: 6px 12px; background-color: ${content.badgeColor}; color: #ffffff; border-radius: 9999px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
          h2 { color: #18181b; margin-top: 16px; font-size: 20px; }
          p { color: #52525b; font-size: 14px; line-height: 1.6; }
          .details { background-color: #fafafa; border-radius: 12px; padding: 16px; margin: 20px 0; border: 1px solid #f4f4f5; }
          .row { display: flex; justify-content: space-between; font-size: 13px; color: #71717a; padding: 4px 0; }
          .footer { text-align: center; font-size: 12px; color: #a1a1aa; margin-top: 24px; }
        </style>
      </head>
      <body>
        <div class="container">
          <span class="badge">${status}</span>
          <h2>${content.headline}</h2>
          <p>Hi ${customerName},</p>
          <p>${content.message}</p>
          
          <div class="details">
            <div style="font-weight: bold; margin-bottom: 8px; font-size: 13px; color: #18181b;">Order Details</div>
            <div>Order ID: <strong>#${shortId}</strong></div>
            <div>Total Paid: <strong>$${totalAmount.toFixed(2)}</strong></div>
          </div>

          <p>Thank you for shopping with us!</p>
          <div class="footer">&copy; ${new Date().getFullYear()} E-Commerce Store. All rights reserved.</div>
        </div>
      </body>
    </html>
  `;

  try {
    const data = await resend.emails.send({
      from: `Store Orders <${FROM_EMAIL}>`,
      to: [toEmail],
      subject: `Order #${shortId}: ${content.subject}`,
      html: htmlBody,
    });

    console.log(`Order status email sent [${status}] to ${toEmail}`);
    return { success: true, data };
  } catch (error) {
    console.error("Failed to send order status email:", error);
    return { success: false, error };
  }
}