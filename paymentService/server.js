// Importar Express
const express = require('express');
const app = express();
const morgan = require('morgan');
const PORT = 5003;
require('dotenv').config();
const { sendReceiptEmail } = require('./email');
const { verifyEmailConfig } = require('./email');

// Middleware para procesar JSON
app.use(express.json());
app.use(morgan('dev'));


const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Faltan las variables de entorno SUPABASE_URL o SUPABASE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseKey);



// Ruta principal
app.get('/', (req, res) => {
  res.json({ mensaje: '¡Bienvenido a mi API!' });
})
// Ruta de salud
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Payment Service is healthy' });
})


// Ruta para crear un recibo en la base de datos y mandarle email al cliente 
app.post('/receipts', async (req, res) => {
  console.log("Llegó una petición para crear un recibo", req.body);

  try {
    const { order_id, user_id, amount, receipt_items, user_email,payment_info } = req.body;
    const { cardNumber,expiryDate,cvv } = payment_info

    // Validar que lleguen los datos necesarios
    if (!order_id || !user_id || !amount || !receipt_items || !Array.isArray(receipt_items)) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Faltan datos requeridos: order_id, user_id, amount, receipt_items'
      });
    }

    // 1. Insertar en la tabla receipts
    const { data: receiptData, error: receiptError } = await supabase
      .from('receipts')
      .insert({
        user_id: user_id,
        order_id: order_id,
        total_amount: amount,
        created_at: new Date().toISOString(),
        cardNumber: cardNumber,
        expiryDate: expiryDate,
        cvv: cvv
      })
      .select('id')
      .single();

    if (receiptError) {
      throw new Error(`Error al insertar recibo: ${receiptError.message}`);
    }
    console.log("Recibo creado con ID:", receiptData.id);

    const receipt_id = receiptData.id;

    // 2. Preparar los items para inserción masiva
    const itemsToInsert = receipt_items.map(item => ({
      receipt_id: receipt_id,
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      price: item.price
    }));

    // 3. Insertar todos los items en la tabla receipt_items
    const { error: itemsError } = await supabase
      .from('receipt_items')
      .insert(itemsToInsert);

    if (itemsError) {
      throw new Error(`Error al insertar items: ${itemsError.message}`);
    }
    console.log(`Items del recibo ${receipt_id} insertados correctamente.`);



    if (user_email === null || user_email === undefined) {
      console.error('Error al obtener email del usuario:');
    } else {
      // 5. Enviar email al cliente (sin bloquear la respuesta)
      console.log(`Enviando email de recibo a ${user_email}...`);
      sendReceiptEmail(
        user_email,
        {
          receipt_id: receipt_id,
          order_id: order_id,
          total_amount: amount,
          created_at: new Date().toISOString()
        },
        receipt_items
      ).then(() => {
        console.log(`✅ Email enviado exitosamente a ${user_email}`);
      }).catch(emailError => {
        console.error('❌ Error al enviar email:', emailError);
      });
    }

    // Responder inmediatamente sin esperar el email
    res.status(201).json({
      status: 'OK',
      message: 'Recibo creado exitosamente',
      receipt_id: receipt_id
    });

  } catch (error) {
    console.error('Error al crear el recibo:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Error al crear el recibo',
      error: error.message
    });
  }
});


verifyEmailConfig();
// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
