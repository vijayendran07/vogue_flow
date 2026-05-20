import jsPDF from 'jspdf';

export const createInvoicePdf = (order) => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 40;
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(18);
  doc.setTextColor('#1f2937');
  doc.text('Vagueflow Commerce', margin, 60);
  doc.setFontSize(10);
  doc.setTextColor('#6b7280');
  doc.text('Invoice', margin, 85);
  doc.text(`Invoice Number: ${order.invoiceNumber || 'N/A'}`, margin, 105);
  doc.text(`Order ID: ${order._id}`, margin, 120);
  doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`, margin, 135);

  doc.setFontSize(12);
  doc.setTextColor('#111827');
  doc.text('Billing Address', margin, 175);
  const billing = order.billingInfo || order.shippingInfo;
  doc.setFontSize(10);
  doc.text(`${billing.name}`, margin, 190);
  doc.text(`${billing.address}`, margin, 205);
  doc.text(`${billing.city}, ${billing.state} ${billing.pinCode}`, margin, 220);
  doc.text(`${billing.country}`, margin, 235);
  doc.text(`${billing.email}`, margin, 250);
  doc.text(`${billing.phoneNo}`, margin, 265);

  doc.text('Delivery Address', pageWidth / 2 + 10, 175);
  doc.setFontSize(10);
  doc.text(`${order.shippingInfo.name}`, pageWidth / 2 + 10, 190);
  doc.text(`${order.shippingInfo.address}`, pageWidth / 2 + 10, 205);
  doc.text(`${order.shippingInfo.city}, ${order.shippingInfo.state} ${order.shippingInfo.pinCode}`, pageWidth / 2 + 10, 220);
  doc.text(`${order.shippingInfo.country}`, pageWidth / 2 + 10, 235);
  doc.text(`${order.shippingInfo.email}`, pageWidth / 2 + 10, 250);
  doc.text(`${order.shippingInfo.phoneNo}`, pageWidth / 2 + 10, 265);

  doc.setDrawColor('#e5e7eb');
  doc.setLineWidth(1);
  doc.line(margin, 280, pageWidth - margin, 280);

  let startY = 300;
  doc.setFontSize(12);
  doc.text('Products', margin, startY);
  startY += 15;
  doc.setFontSize(10);

  order.orderItems.forEach((item, index) => {
    const rowY = startY + index * 18;
    doc.text(`${item.quantity}x ${item.name}`, margin, rowY);
    doc.text(`INR ${item.price.toFixed(2)}`, pageWidth - margin - 140, rowY, { align: 'right' });
    doc.text(`INR ${(item.quantity * item.price).toFixed(2)}`, pageWidth - margin, rowY, { align: 'right' });
  });

  const summaryY = startY + order.orderItems.length * 18 + 25;
  doc.setFontSize(11);
  doc.text('Subtotal', pageWidth - margin - 220, summaryY);
  doc.text(`INR ${order.itemsPrice.toFixed(2)}`, pageWidth - margin, summaryY, { align: 'right' });
  doc.text('Delivery', pageWidth - margin - 220, summaryY + 16);
  doc.text(`INR ${order.shippingPrice.toFixed(2)}`, pageWidth - margin, summaryY + 16, { align: 'right' });
  doc.text('GST', pageWidth - margin - 220, summaryY + 32);
  doc.text(`INR ${order.taxPrice.toFixed(2)}`, pageWidth - margin, summaryY + 32, { align: 'right' });
  doc.text('Discount', pageWidth - margin - 220, summaryY + 48);
  doc.text(`INR ${order.discountPrice.toFixed(2)}`, pageWidth - margin, summaryY + 48, { align: 'right' });
  doc.setFontSize(13);
  doc.setFont(undefined, 'bold');
  doc.text('Total', pageWidth - margin - 220, summaryY + 72);
  doc.text(`INR ${order.totalPrice.toFixed(2)}`, pageWidth - margin, summaryY + 72, { align: 'right' });
  doc.setFont(undefined, 'normal');

  doc.setFontSize(10);
  doc.text(`Payment Method: ${order.paymentMethod || 'COD'}`, margin, summaryY + 110);
  doc.text(`Payment Status: ${order.paymentStatus || 'Pending'}`, margin, summaryY + 125);
  doc.text(`Courier: ${order.courier || 'N/A'}`, margin, summaryY + 140);

  return doc;
};

export const downloadInvoice = (order) => {
  if (!order) return;
  const doc = createInvoicePdf(order);
  const filename = `invoice-${order.invoiceNumber || order._id}.pdf`;
  doc.save(filename);
};

export const printInvoice = (order) => {
  if (!order) return;
  const doc = createInvoicePdf(order);
  const blobUrl = doc.output('bloburl');
  window.open(blobUrl, '_blank');
}
