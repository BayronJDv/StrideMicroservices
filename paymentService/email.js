const nodemailer = require('nodemailer');

// Configuración del transportador de email
const transporter = nodemailer.createTransport({
  service: 'gmail', // o 'outlook', 'yahoo', etc.
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Generar el HTML de los items del recibo
function generateReceiptItemsHtml(receiptItems) {
  return receiptItems.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.product_name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${item.price.toFixed(2)}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${(item.quantity * item.price).toFixed(2)}</td>
    </tr>
  `).join('');
}

// Generar el template HTML completo del email
function generateReceiptEmailTemplate(receiptData, receiptItems) {
  const itemsHtml = generateReceiptItemsHtml(receiptItems);
  const formattedDate = new Date(receiptData.created_at).toLocaleString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0;
            padding: 0;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
          }
          .header { 
            background-color: #4CAF50; 
            color: white; 
            padding: 20px; 
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content { 
            padding: 20px; 
            background-color: #f9f9f9; 
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0; 
            background-color: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          th { 
            background-color: #4CAF50; 
            color: white; 
            padding: 12px; 
            text-align: left; 
          }
          .total { 
            font-size: 18px; 
            font-weight: bold; 
            text-align: right; 
            margin-top: 20px;
            padding: 15px;
            background-color: #fff;
            border-radius: 4px;
          }
          .footer { 
            text-align: center; 
            margin-top: 20px; 
            color: #777; 
            font-size: 12px; 
            padding: 15px;
          }
          .info-box {
            background-color: #e8f5e9;
            padding: 15px;
            border-radius: 4px;
            margin: 15px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Gracias por tu compra!</h1>
          </div>
          <div class="content">
            <p>Hola,</p>
            <p>Tu pedido ha sido procesado exitosamente. A continuación encontrarás los detalles de tu compra.</p>
            
            <div class="info-box">
              <p style="margin: 5px 0;"><strong>📦 Pedido:</strong> #${receiptData.order_id}</p>
              <p style="margin: 5px 0;"><strong>🧾 Recibo:</strong> #${receiptData.receipt_id}</p>
              <p style="margin: 5px 0;"><strong>📅 Fecha:</strong> ${formattedDate}</p>
            </div>
            
            <h3>Detalle de Productos</h3>
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th style="text-align: center;">Cantidad</th>
                  <th style="text-align: right;">Precio Unit.</th>
                  <th style="text-align: right;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            
            <div class="total">
              Total: $${receiptData.total_amount.toFixed(2)}
            </div>
            
            <p style="margin-top: 30px;">Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos.</p>
          </div>
          <div class="footer">
            <p>Este es un email automático, por favor no respondas a este mensaje.</p>
            <p>© ${new Date().getFullYear()} StrideShop. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Función principal para enviar el email del recibo
async function sendReceiptEmail(userEmail, receiptData, receiptItems) {
  try {
    const mailOptions = {
      from: {
        name: 'StrideShop',
        address: process.env.EMAIL_USER
      },
      to: userEmail,
      subject: `Recibo de Compra #${receiptData.receipt_id}`,
      html: generateReceiptEmailTemplate(receiptData, receiptItems)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email enviado exitosamente:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error al enviar email:', error);
    throw error;
  }
}

// Verificar la configuración del transportador
async function verifyEmailConfig() {
  try {
    await transporter.verify();
    console.log('✅ Servidor de email configurado correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error en la configuración del email:', error);
    return false;
  }
}

module.exports = {
  sendReceiptEmail,
  verifyEmailConfig
};
