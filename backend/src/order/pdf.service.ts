import { Injectable } from '@nestjs/common';
import PDFDocument = require('pdfkit');

@Injectable()
export class PdfService {
  async generateBookingInvoice(order: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        // ==== WATERMARK ====
        // We'll simulate a watermark using large faint text
        doc.save();
        doc.fontSize(80).fillOpacity(0.1).fillColor('gray');
        // Rotate text for diagonal watermark
        doc.rotate(-45, { origin: [doc.page.width / 2, doc.page.height / 2] });
        doc.text('CATERHUB', doc.page.width / 2 - 150, doc.page.height / 2, {
          align: 'center',
          width: 300,
        });
        doc.restore(); // Return to normal state for actual text

        // ==== HEADER ====
        doc.font('Helvetica-Bold').fontSize(24).fillColor('#ea580c').text('CaterHub Professionals', { align: 'center' });
        doc.moveDown(0.2);
        doc.font('Helvetica').fontSize(10).fillColor('gray').text('Official Booking Confirmation', { align: 'center' });
        doc.moveDown(2);

        // ==== CUSTOMER INFO ====
        doc.font('Helvetica-Bold').fontSize(14).fillColor('black').text('Booking Details');
        doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#e5e7eb').lineWidth(1).stroke();
        doc.moveDown(0.5);

        doc.font('Helvetica').fontSize(11).fillColor('black');
        doc.text(`Booking ID: `, { continued: true }).font('Helvetica-Bold').text(`${order.id.split('-')[0].toUpperCase()}`);
        doc.font('Helvetica').text(`Customer Name: `, { continued: true }).font('Helvetica-Bold').text(`${order.customer.name}`);
        doc.font('Helvetica').text(`Contact: `, { continued: true }).font('Helvetica-Bold').text(`${order.customer.phoneNumber} | ${order.customer.email}`);
        doc.moveDown();

        // ==== EVENT INFO ====
        doc.font('Helvetica-Bold').fontSize(14).text('Event Information');
        doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#e5e7eb').stroke();
        doc.moveDown(0.5);

        doc.font('Helvetica').fontSize(11);
        doc.text(`Date & Time: `, { continued: true }).font('Helvetica-Bold').text(`${order.eventDate.toLocaleString('en-IN')}`);
        doc.font('Helvetica').text(`Location: `, { continued: true }).font('Helvetica-Bold').text(`${order.eventLocation}`);
        doc.font('Helvetica').text(`Event Type: `, { continued: true }).font('Helvetica-Bold').text(`${order.eventType}`);
        doc.font('Helvetica').text(`Headcount: `, { continued: true }).font('Helvetica-Bold').text(`${order.headcount} Guests`);
        doc.moveDown();

        // ==== MENU DETAILS ====
        const menuName = order.menu?.name || order.skeleton?.name || 'Custom Package';
        doc.font('Helvetica-Bold').fontSize(14).text('Menu Choices');
        doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#e5e7eb').stroke();
        doc.moveDown(0.5);

        doc.font('Helvetica-Bold').fontSize(12).fillColor('#ea580c').text(menuName);
        doc.moveDown(0.5);
        if (order.dishSelections && order.dishSelections.length > 0) {
            doc.font('Helvetica').fontSize(10).fillColor('black');
            order.dishSelections.forEach((ds: any) => {
                doc.text(`• ${ds.dish.name} (${ds.dish.category.replace('_', ' ')})`);
            });
        } else if (order.menu?.items) {
           doc.font('Helvetica').fontSize(10).fillColor('black');
           order.menu.items.forEach((item: string) => {
               doc.text(`• ${item}`);
           });
        }

        doc.moveDown(2);

        // ==== FINANCIALS ====
        doc.font('Helvetica-Bold').fontSize(14).fillColor('black').text('Financial Summary');
        doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#e5e7eb').stroke();
        doc.moveDown(0.5);

        doc.font('Helvetica').fontSize(11);
        doc.text(`Estimated Total: `, { continued: true }).font('Helvetica-Bold').text(`Rs. ${order.totalAmount}`);
        doc.font('Helvetica').text(`Advance Booking Fee Paid: `, { continued: true }).font('Helvetica-Bold').fillColor('#16a34a').text(`Rs. ${order.confirmationFee || 0}`);
        doc.moveDown(2);

        // ==== FOOTER ====
        doc.font('Helvetica-Oblique').fontSize(9).fillColor('gray').text('This is an automatically generated electronic document. The catering professionals are managed strictly by CaterHub. Have a great event!', {
            align: 'center',
            width: 500
        });

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}
