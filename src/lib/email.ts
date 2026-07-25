import { prisma } from './prisma';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'kllankanatural@gmail.com';

// Supported notification types
export type EmailNotificationType =
  | 'ORDER_CONFIRMATION'
  | 'NEW_ORDER_ADMIN'
  | 'ORDER_SHIPPED'
  | 'ORDER_DELIVERED';

interface ResendPayload {
  from: string;
  to: string;
  subject: string;
  html: string;
}

/**
 * Base helper to send an email using Resend HTTP API.
 * Keeps log of the attempt in the EmailNotification table.
 */
async function sendEmailViaResend(
  orderId: string,
  type: EmailNotificationType,
  recipient: string,
  subject: string,
  html: string
): Promise<boolean> {
  // 1. Guard against missing API key
  if (!RESEND_API_KEY) {
    console.error(`[Email Error] RESEND_API_KEY is not configured in environment variables. Cannot send ${type} for order ${orderId}.`);
    await logNotification(orderId, type, recipient, 'FAILED', null, 'RESEND_API_KEY env var is missing');
    return false;
  }

  // 1.5 Guard against missing sender email
  if (!EMAIL_FROM) {
    const errorMsg = 'EMAIL_FROM environment variable is not configured';
    console.error(`[Email Error] ${errorMsg}. Cannot send ${type} for order ${orderId}.`);
    await logNotification(orderId, type, recipient, 'FAILED', null, errorMsg);
    throw new Error(errorMsg);
  }

  // 2. Guard against duplicate successful sends
  try {
    const existing = await prisma.emailNotification.findFirst({
      where: {
        orderId,
        type,
        status: 'SUCCESS',
      },
    });

    if (existing) {
      console.log(`[Email Skip] ${type} has already been successfully sent for order ${orderId}. Skipping to prevent duplicate.`);
      return true;
    }
  } catch (dbError) {
    console.warn(`[Email Check warning] Failed to check for existing email log for order ${orderId}:`, dbError);
  }

  // 3. Dispatch the email
  try {
    const payload: ResendPayload = {
      from: EMAIL_FROM,
      to: recipient,
      subject,
      html,
    };

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok && data.id) {
      console.log(`[Email Success] ${type} sent to ${recipient} for order ${orderId}. Message ID: ${data.id}`);
      await logNotification(orderId, type, recipient, 'SUCCESS', data.id, null);
      return true;
    } else {
      const errorMsg = data.message || `Resend returned HTTP ${response.status}`;
      console.error(`[Email API Error] Failed to send ${type} for order ${orderId} to ${recipient}:`, errorMsg);
      await logNotification(orderId, type, recipient, 'FAILED', null, JSON.stringify(data));
      return false;
    }
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Unknown network/fetch error';
    console.error(`[Email Network Error] Failed to dispatch ${type} for order ${orderId}:`, errMsg);
    await logNotification(orderId, type, recipient, 'FAILED', null, errMsg);
    return false;
  }
}

/**
 * Helper to record the notification log entry in the database.
 */
async function logNotification(
  orderId: string,
  type: EmailNotificationType,
  recipient: string,
  status: 'SUCCESS' | 'FAILED',
  providerMessageId: string | null,
  error: string | null
) {
  try {
    await prisma.emailNotification.create({
      data: {
        orderId,
        type,
        recipient,
        status,
        providerMessageId,
        error: error ? error.substring(0, 1000) : null,
        createdAt: new Date(),
        sentAt: new Date(),
      },
    });
  } catch (err) {
    console.error('[Email Log Database Error] Failed to write email log into DB:', err);
  }
}

/**
 * Generate a beautifully styled, dynamic HTML email wrapper for KLLANKA NATURAL branding.
 */
function getEmailLayout(title: string, innerContentHtml: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #f1f5f9;
            color: #334155;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          .wrapper {
            width: 100%;
            background-color: #f1f5f9;
            padding: 40px 20px;
            box-sizing: border-box;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03);
            border: 1px solid #e2e8f0;
          }
          .header {
            background: linear-gradient(135deg, #064e3b 0%, #065f46 100%);
            padding: 32px;
            text-align: center;
            border-bottom: 4px solid #10b981;
          }
          .header h1 {
            color: #ffffff;
            font-size: 24px;
            font-weight: 800;
            margin: 0;
            letter-spacing: 0.05em;
            text-transform: uppercase;
          }
          .header p {
            color: #a7f3d0;
            font-size: 14px;
            margin: 6px 0 0 0;
            font-weight: 500;
          }
          .content {
            padding: 32px;
          }
          .footer {
            background-color: #f8fafc;
            padding: 24px 32px;
            text-align: center;
            border-top: 1px solid #f1f5f9;
          }
          .footer p {
            color: #64748b;
            font-size: 12px;
            line-height: 1.6;
            margin: 0;
          }
          .footer a {
            color: #10b981;
            text-decoration: none;
            font-weight: 600;
          }
          .btn {
            display: inline-block;
            background-color: #059669;
            color: #ffffff !important;
            font-weight: 700;
            font-size: 14px;
            padding: 12px 28px;
            text-decoration: none !important;
            border-radius: 12px;
            margin: 20px 0;
            text-align: center;
          }
          .order-details-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          .order-details-table th {
            text-align: left;
            font-size: 12px;
            text-transform: uppercase;
            color: #64748b;
            padding-bottom: 8px;
            border-bottom: 1px solid #e2e8f0;
          }
          .order-details-table td {
            padding: 12px 0;
            font-size: 14px;
            border-bottom: 1px solid #f1f5f9;
            vertical-align: middle;
          }
          .item-img {
            width: 50px;
            height: 50px;
            border-radius: 8px;
            object-fit: cover;
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            margin-right: 12px;
          }
          .total-row td {
            font-weight: bold;
            font-size: 15px;
            color: #1e293b;
            border-top: 2px solid #e2e8f0;
            border-bottom: none;
            padding-top: 16px;
          }
          .summary-card {
            background-color: #f8fafc;
            border-radius: 16px;
            padding: 20px;
            border: 1px solid #e2e8f0;
            margin-bottom: 24px;
          }
          .summary-card h3 {
            margin-top: 0;
            color: #0f172a;
            font-size: 14px;
            font-weight: 750;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 12px;
          }
          .summary-card p {
            margin: 6px 0;
            font-size: 13.5px;
            line-height: 1.5;
            color: #475569;
          }
          .badge {
            display: inline-block;
            padding: 4px 10px;
            font-size: 11px;
            font-weight: 700;
            border-radius: 9999px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .badge-success { background-color: #d1fae5; color: #065f46; }
          .badge-pending { background-color: #fef3c7; color: #92400e; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <h1>KL Lanka Natural</h1>
              <p>PREMIUM NATURAL PRODUCTS</p>
            </div>
            <div class="content">
              ${innerContentHtml}
            </div>
            <div class="footer">
              <p>
                &copy; ${new Date().getFullYear()} KL LANKA NATURAL (PVT) LTD. All Rights Reserved.<br>
                Official support is provided strictly via email at <a href="mailto:kllankanatural@gmail.com">kllankanatural@gmail.com</a>.
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

interface AddressFields {
  street?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  district?: string | null;
  province?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
}

/**
 * Format address details into plain text HTML blocks.
 */
function formatAddress(order: AddressFields): string {
  const parts = [
    order.street,
    order.addressLine2,
    order.city,
    order.district,
    order.province || order.state,
    order.postalCode,
    order.country,
  ].filter(Boolean);
  return parts.join(', ');
}


/**
 * 1. ORDER PLACED -> CUSTOMER EMAIL
 */
export async function sendOrderConfirmationEmail(orderId: string): Promise<boolean> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order || !order.customerEmail) return false;

    // Check if order contains Custom Portrait Art
    const hasCustomPortrait = order.items.some(
      (item) => item.customUploadImage || (item.productName && item.productName.toLowerCase().includes('portrait'))
    );

    const itemsHtml = order.items
      .map((item) => {
        const variantText = item.variantName ? `<br><span style="font-size: 11px; color: #64748b;">Option: ${item.variantName}</span>` : '';
        const imgTag = item.productImage
          ? `<img src="${item.productImage}" class="item-img" align="left" alt="${item.productName || 'product'}">`
          : '<div class="item-img" style="display:inline-block; vertical-align:middle; background-color:#e2e8f0;"></div>';

        return `
          <tr>
            <td style="padding: 12px 0;">
              <div style="display: flex; align-items: center;">
                ${imgTag}
                <div>
                  <span style="font-weight: 600; color: #1e293b;">${item.productName || 'Product'}</span>
                  ${variantText}
                </div>
              </div>
            </td>
            <td style="text-align: center;">${item.quantity}</td>
            <td style="text-align: right;">$${item.price.toFixed(2)}</td>
            <td style="text-align: right; font-weight: 600;">$${(item.price * item.quantity).toFixed(2)}</td>
          </tr>
        `;
      })
      .join('');

    const portraitNoticeHtml = hasCustomPortrait
      ? `
        <div style="background-color: #fef3c7; border-left: 4px solid #d97706; padding: 16px; border-radius: 12px; margin-bottom: 24px; color: #92400e; font-size: 14px;">
          <h4 style="margin: 0 0 6px 0; font-weight: bold;">Custom Portrait Art Request</h4>
          <p style="margin: 0; line-height: 1.5;">
            This order contains a Custom Portrait Art service. Your reference image was successfully uploaded.
            Our professional artists will review the reference guidelines and begin work shortly.
          </p>
        </div>
      `
      : '';

    const viewOrderUrl = `${process.env.AUTH_URL || 'http://localhost:3000'}/account`;

    const htmlContent = `
      <h2 style="color: #0f172a; font-size: 20px; font-weight: 800; margin-top: 0;">Order Confirmed!</h2>
      <p style="font-size: 15px; line-height: 1.6; color: #475569;">
        Hello ${order.customerName || 'Customer'},<br>
        Thank you for shopping with KL Lanka Natural. Your order <strong>${order.orderNumber}</strong> has been received and is being processed.
      </p>

      ${portraitNoticeHtml}

      <div class="summary-card">
        <h3>Order Summary</h3>
        <p><strong>Order Number:</strong> ${order.orderNumber}</p>
        <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
        <p><strong>Payment Status:</strong> <span class="badge ${order.paymentStatus === 'PAID' ? 'badge-success' : 'badge-pending'}">${order.paymentStatus}</span></p>
        <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
      </div>

      <table class="order-details-table">
        <thead>
          <tr>
            <th>Product</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Unit Price</th>
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
          <tr class="total-row">
            <td colspan="2"></td>
            <td style="text-align: right; color: #475569; font-weight: normal; font-size: 13px;">Subtotal:</td>
            <td style="text-align: right; color: #475569; font-weight: normal; font-size: 13px;">$${order.subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="2"></td>
            <td style="text-align: right; color: #475569; font-weight: normal; font-size: 13px; border-bottom: none;">Shipping:</td>
            <td style="text-align: right; color: #475569; font-weight: normal; font-size: 13px; border-bottom: none;">$${order.deliveryFee.toFixed(2)}</td>
          </tr>
          <tr class="total-row">
            <td colspan="2"></td>
            <td style="text-align: right;">Grand Total:</td>
            <td style="text-align: right; color: #059669;">$${order.totalAmount.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <div class="summary-card">
        <h3>Delivery Information</h3>
        <p><strong>Delivery Address:</strong> ${formatAddress(order)}</p>
        ${order.deliveryNote ? `<p><strong>Delivery Note:</strong> ${order.deliveryNote}</p>` : ''}
      </div>

      <div style="text-align: center;">
        <a href="${viewOrderUrl}" class="btn">View Order History</a>
      </div>
    `;

    const html = getEmailLayout(`Order Confirmed - ${order.orderNumber}`, htmlContent);
    return await sendEmailViaResend(
      order.id,
      'ORDER_CONFIRMATION',
      order.customerEmail,
      `Order Confirmed - ${order.orderNumber}`,
      html
    );
  } catch (err) {
    console.error(`[Email System Exception] Failed to compile order confirmation email for order ${orderId}:`, err);
    return false;
  }
}

/**
 * 2. NEW ORDER -> ADMIN EMAIL
 */
export async function sendNewOrderAdminEmail(orderId: string): Promise<boolean> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) return false;

    // Check if order contains Custom Portrait Art
    const hasCustomPortrait = order.items.some(
      (item) => item.customUploadImage || (item.productName && item.productName.toLowerCase().includes('portrait'))
    );

    const itemsHtml = order.items
      .map((item) => {
        const variantText = item.variantName ? `<br><span style="font-size: 11px; color: #64748b;">Option: ${item.variantName}</span>` : '';
        const imgTag = item.productImage
          ? `<img src="${item.productImage}" class="item-img" align="left" alt="${item.productName || 'product'}">`
          : '<div class="item-img" style="display:inline-block; vertical-align:middle; background-color:#e2e8f0;"></div>';

        const customImageNotice = item.customUploadImage
          ? `<br><span style="font-size: 11px; color: #b45309; font-weight: 600;">🖼️ Reference image uploaded!</span>`
          : '';

        return `
          <tr>
            <td style="padding: 12px 0;">
              <div style="display: flex; align-items: center;">
                ${imgTag}
                <div>
                  <span style="font-weight: 600; color: #1e293b;">${item.productName || 'Product'}</span>
                  ${variantText}
                  ${customImageNotice}
                </div>
              </div>
            </td>
            <td style="text-align: center;">${item.quantity}</td>
            <td style="text-align: right;">$${item.price.toFixed(2)}</td>
            <td style="text-align: right; font-weight: 600;">$${(item.price * item.quantity).toFixed(2)}</td>
          </tr>
        `;
      })
      .join('');

    const portraitNoticeHtml = hasCustomPortrait
      ? `
        <div style="background-color: #fef3c7; border-left: 4px solid #b45309; padding: 16px; border-radius: 12px; margin-bottom: 24px; color: #78350f; font-size: 14px;">
          <h4 style="margin: 0 0 6px 0; font-weight: bold;">⚠️ Custom Portrait Art Order</h4>
          <p style="margin: 0; line-height: 1.5;">
            This order contains a Custom Portrait Art item and requires artist handling. Reference images are uploaded.
            Please review the order details and images in the admin panel.
          </p>
        </div>
      `
      : '';

    const adminOrderUrl = `${process.env.AUTH_URL || 'http://localhost:3000'}/admin/orders/${order.id}`;

    const htmlContent = `
      <h2 style="color: #991b1b; font-size: 20px; font-weight: 800; margin-top: 0;">🚨 New Order Received!</h2>
      <p style="font-size: 15px; line-height: 1.6; color: #475569;">
        A new order has been placed on the storefront. Details are below:
      </p>

      ${portraitNoticeHtml}

      <div class="summary-card">
        <h3>Customer Details</h3>
        <p><strong>Name:</strong> ${order.customerName || 'N/A'}</p>
        <p><strong>Email:</strong> ${order.customerEmail || 'N/A'}</p>
        <p><strong>Phone:</strong> ${order.customerPhone || 'N/A'}</p>
        ${order.altPhone ? `<p><strong>Alt Phone:</strong> ${order.altPhone}</p>` : ''}
      </div>

      <div class="summary-card">
        <h3>Order Parameters</h3>
        <p><strong>Order Number:</strong> ${order.orderNumber}</p>
        <p><strong>Status:</strong> <span class="badge" style="background-color: #dbeafe; color: #1e40af;">${order.status}</span></p>
        <p><strong>Payment Status:</strong> <span class="badge ${order.paymentStatus === 'PAID' ? 'badge-success' : 'badge-pending'}">${order.paymentStatus}</span></p>
        <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
      </div>

      <table class="order-details-table">
        <thead>
          <tr>
            <th>Product</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Unit Price</th>
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
          <tr class="total-row">
            <td colspan="2"></td>
            <td style="text-align: right; color: #475569; font-weight: normal; font-size: 13px;">Subtotal:</td>
            <td style="text-align: right; color: #475569; font-weight: normal; font-size: 13px;">$${order.subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="2"></td>
            <td style="text-align: right; color: #475569; font-weight: normal; font-size: 13px; border-bottom: none;">Shipping:</td>
            <td style="text-align: right; color: #475569; font-weight: normal; font-size: 13px; border-bottom: none;">$${order.deliveryFee.toFixed(2)}</td>
          </tr>
          <tr class="total-row">
            <td colspan="2"></td>
            <td style="text-align: right;">Grand Total:</td>
            <td style="text-align: right; color: #991b1b;">$${order.totalAmount.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <div class="summary-card">
        <h3>Delivery Information</h3>
        <p><strong>Address:</strong> ${formatAddress(order)}</p>
        ${order.deliveryNote ? `<p><strong>Delivery Note:</strong> ${order.deliveryNote}</p>` : ''}
      </div>

      <div style="text-align: center;">
        <a href="${adminOrderUrl}" class="btn" style="background-color: #991b1b;">Manage Order</a>
      </div>
    `;

    const html = getEmailLayout(`New Order Received - ${order.orderNumber}`, htmlContent);
    return await sendEmailViaResend(
      order.id,
      'NEW_ORDER_ADMIN',
      ADMIN_EMAIL,
      `New Order Received - ${order.orderNumber}`,
      html
    );
  } catch (err) {
    console.error(`[Email System Exception] Failed to compile admin order alert for order ${orderId}:`, err);
    return false;
  }
}

/**
 * 3. ORDER SHIPPED -> CUSTOMER EMAIL
 */
export async function sendOrderShippedEmail(orderId: string): Promise<boolean> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order || !order.customerEmail) return false;

    const itemsHtml = order.items
      .map((item) => {
        return `
          <li>
            <strong>${item.productName || 'Product'}</strong> 
            ${item.variantName ? `(${item.variantName})` : ''} - Qty: ${item.quantity}
          </li>
        `;
      })
      .join('');

    const trackOrderUrl = `${process.env.AUTH_URL || 'http://localhost:3000'}/track-order`;

    const htmlContent = `
      <h2 style="color: #0f172a; font-size: 20px; font-weight: 800; margin-top: 0;">Your Order Has Shipped!</h2>
      <p style="font-size: 15px; line-height: 1.6; color: #475569;">
        Hello ${order.customerName || 'Customer'},<br>
        Great news! Your order <strong>${order.orderNumber}</strong> has been handed over to our courier partner and is on its way to you.
      </p>

      <div class="summary-card">
        <h3>Shipment Details</h3>
        <p><strong>Order Number:</strong> ${order.orderNumber}</p>
        <p><strong>Shipping Status:</strong> <span class="badge" style="background-color: #dbeafe; color: #1e40af;">SHIPPED</span></p>
        <p><strong>Delivery Address:</strong> ${formatAddress(order)}</p>
      </div>

      <div class="summary-card">
        <h3>Items Shipped</h3>
        <ul style="margin: 0; padding-left: 20px; font-size: 13.5px; color: #475569; line-height: 1.6;">
          ${itemsHtml}
        </ul>
      </div>

      <p style="font-size: 14px; color: #475569; line-height: 1.5;">
        Standard deliveries within Sri Lanka usually arrive within 3 to 7 business days from dispatch. If you have questions, feel free to reply directly to this email.
      </p>

      <div style="text-align: center;">
        <a href="${trackOrderUrl}" class="btn">Track Order Details</a>
      </div>
    `;

    const html = getEmailLayout(`Your KLLANKA NATURAL Order Has Been Shipped - ${order.orderNumber}`, htmlContent);
    return await sendEmailViaResend(
      order.id,
      'ORDER_SHIPPED',
      order.customerEmail,
      `Your KLLANKA NATURAL Order Has Been Shipped - ${order.orderNumber}`,
      html
    );
  } catch (err) {
    console.error(`[Email System Exception] Failed to compile order shipped email for order ${orderId}:`, err);
    return false;
  }
}

/**
 * 4. ORDER DELIVERED -> CUSTOMER EMAIL
 */
export async function sendOrderDeliveredEmail(orderId: string): Promise<boolean> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order || !order.customerEmail) return false;

    const itemsHtml = order.items
      .map((item) => {
        return `
          <li>
            <strong>${item.productName || 'Product'}</strong> 
            ${item.variantName ? `(${item.variantName})` : ''} - Qty: ${item.quantity}
          </li>
        `;
      })
      .join('');

    const accountUrl = `${process.env.AUTH_URL || 'http://localhost:3000'}/account`;

    const htmlContent = `
      <h2 style="color: #059669; font-size: 20px; font-weight: 800; margin-top: 0;">Order Delivered!</h2>
      <p style="font-size: 15px; line-height: 1.6; color: #475569;">
        Hello ${order.customerName || 'Customer'},<br>
        Your order <strong>${order.orderNumber}</strong> has been successfully delivered! We hope you love your natural wellness products.
      </p>

      <div class="summary-card">
        <h3>Delivery Confirmation</h3>
        <p><strong>Order Number:</strong> ${order.orderNumber}</p>
        <p><strong>Total Amount:</strong> $${order.totalAmount.toFixed(2)}</p>
        <p><strong>Delivered To:</strong> ${formatAddress(order)}</p>
      </div>

      <div class="summary-card">
        <h3>Delivered Items</h3>
        <ul style="margin: 0; padding-left: 20px; font-size: 13.5px; color: #475569; line-height: 1.6;">
          ${itemsHtml}
        </ul>
      </div>

      <p style="font-size: 14.5px; font-weight: 600; color: #065f46; background-color: #d1fae5; padding: 12px; border-radius: 10px; text-align: center;">
        Thank you for choosing KL Lanka Natural. We look forward to serving you again!
      </p>

      <div style="text-align: center; margin-top: 24px;">
        <a href="${accountUrl}" class="btn">View Order History</a>
      </div>
    `;

    const html = getEmailLayout(`Your KLLANKA NATURAL Order Has Been Delivered - ${order.orderNumber}`, htmlContent);
    return await sendEmailViaResend(
      order.id,
      'ORDER_DELIVERED',
      order.customerEmail,
      `Your KLLANKA NATURAL Order Has Been Delivered - ${order.orderNumber}`,
      html
    );
  } catch (err) {
    console.error(`[Email System Exception] Failed to compile order delivered email for order ${orderId}:`, err);
    return false;
  }
}
