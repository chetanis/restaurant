import fs from 'fs';
import { jsPDF } from 'jspdf';
import fetch from 'node-fetch'; // Make sure to install node-fetch if you haven't already
import path from 'path';
import { GroupedOrderItem, OrderItemWithMeal } from '../types/orders';


export async function printTicket(tableNumber: number, waiterName: string, items: OrderItemWithMeal[]) {
  const pdfDir = path.join(process.cwd(), 'pdfs');
  const pdfPath = path.join(pdfDir, `order_receipt.pdf`);

  // Ensure the pdfs directory exists
  if (!fs.existsSync(pdfDir)) {
    fs.mkdirSync(pdfDir, { recursive: true });
  }

  try {
    // Create new PDF document for 80mm thermal paper
    const paperWidth = 80; // Width in mm
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [paperWidth, 200] // Set custom width and height
    });

    // Set initial position
    let yPosition = 10; // Start slightly below the top
    const leftMargin = 5; // Left margin

    // Add header
    doc.setFontSize(14);
    doc.text(`Order`, leftMargin, yPosition);

    yPosition += 10; // Move down for next line
    doc.setFontSize(10);
    doc.text(`Table: ${tableNumber}`, leftMargin, yPosition);

    yPosition += 5; // Move down for next line
    doc.setFontSize(10);
    doc.text(`serveur: ${waiterName}`, leftMargin, yPosition);

    yPosition += 5; // Move down for next section
    doc.text(`plats:`, leftMargin, yPosition);

    // Add items
    items.forEach(item => {
      yPosition += 7; // Space between each item
      doc.text(`${item.quantity}x ${item.meal.name} ${item.notes ? `-- ${item.notes}` : ''}`, leftMargin + 5, yPosition);
    });


    // Save the PDF
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    fs.writeFileSync(pdfPath, pdfBuffer);


    await sendPrintToKitchen(pdfPath);

    // Optional: Clean up the PDF file if you no longer need it
    // fs.unlinkSync(pdfPath);

  } catch (error) {
    console.error('Error in PDF generation or printing:', error);
    throw error;
  }
}

export async function printBill(orderId: number, tableNumber: number, date: string, hour: string, groupedItems: GroupedOrderItem[],totalAmount:number): Promise<void> {

  const pdfDir = path.join(process.cwd(), 'pdfs');
  const pdfPath = path.join(pdfDir, `order_bill.pdf`);

  // Ensure the pdfs directory exists
  if (!fs.existsSync(pdfDir)) {
    fs.mkdirSync(pdfDir, { recursive: true });
  }

  try {
    // Create new PDF document for 80mm thermal paper
    const paperWidth = 80; // Width in mm
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [paperWidth, 200] // Set custom width and height
    });

    // Set initial position
    let yPosition = 10; // Start slightly below the top
    const leftMargin = 5; // Left margin

    // Add header
    doc.setFontSize(14);
    doc.text(`${process.env.restaurant_name}`, leftMargin, yPosition);

    yPosition += 4; // Move down for next line
    doc.setFontSize(10);
    doc.text(`-------------------------------`, leftMargin, yPosition);

    yPosition += 5; // Move down for next line
    doc.setFontSize(10);
    doc.text(`Commande #: ${orderId}`, leftMargin, yPosition);
    
    yPosition += 5; // Move down for next section
    doc.text(`Table: ${tableNumber}`, leftMargin, yPosition);
    
    yPosition += 5; // Move down for next section
    doc.text(`Date: ${date}`, leftMargin, yPosition);
    
    yPosition += 5; // Move down for next section
    doc.text(`Heur: ${hour}`, leftMargin, yPosition);
    
    // Add items
    groupedItems.forEach(item => {
      yPosition += 7; // Space between each item
      doc.text(`${item.quantity.toString().padStart(2)}x ${item.meal.name.padEnd(20)} ${(item.price * item.quantity).toFixed(2)} DZD`, leftMargin + 5, yPosition);
    });
    
    yPosition += 4; // Move down for next line
    doc.setFontSize(10);
    doc.text(`-------------------------------`, leftMargin, yPosition);
    
    yPosition += 5; // Move down for next line
    doc.setFontSize(10);
    doc.text(`Total: ${totalAmount.toFixed(2)} DZD`, leftMargin, yPosition);


    // Save the PDF
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    fs.writeFileSync(pdfPath, pdfBuffer);


    await sendPrintToCashier(pdfPath);

    // Optional: Clean up the PDF file if you no longer need it
    // fs.unlinkSync(pdfPath);

  } catch (error) {
    console.error('Error in PDF generation or printing:', error);
    throw error;
  }
}


async function sendPrintToKitchen(pdfPath: string) {
  // Send the print request to the printing server
  const response = await fetch('http://localhost:3001/printKitchen', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      pdfPath: pdfPath,  // Send the path to the PDF
      printerName: 'Microsoft Print to PDF', // Replace with your printer's name
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to send print job');
  }

  console.log('PDF printed successfully');
}


async function sendPrintToCashier(pdfPath: string) {
  // Send the print request to the printing server
  const response = await fetch('http://localhost:3001/printCashier', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      pdfPath: pdfPath,  // Send the path to the PDF
      printerName: 'Microsoft Print to PDF', // Replace with your printer's name
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to send print job');
  }

  console.log('PDF printed successfully');
}