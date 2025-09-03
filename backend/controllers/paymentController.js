import Order from "../models/Order.js";
import { sendPaymentConfirmation } from "../services/emailService.js";

/**
 * Confirmar pago recibido y enviar email de confirmación
 */
export const confirmPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentMethod = 'transfer' } = req.body;

    // Buscar el pedido
    const order = await Order.findOne({ id: orderId });
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: "Pedido no encontrado" 
      });
    }

    // Actualizar estado de pago
    order.paymentStatus = 'paid';
    order.paymentMethod = paymentMethod;
    order.paidAt = new Date();
    
    // Si el pedido estaba pendiente, cambiar a confirmado
    if (order.status === 'Pendiente') {
      order.status = 'Confirmado';
    }

    await order.save();

    // 📧 Enviar email de confirmación de pago
    if (order.customerEmail) {
      try {
        await sendPaymentConfirmation(order, order.customerEmail);
        console.log(`✅ Email de confirmación de pago enviado para pedido ${order.orderNumber}`);
      } catch (emailError) {
        console.error(`❌ Error enviando email de confirmación de pago:`, emailError);
        // No fallar la confirmación por error de email
      }
    }

    res.json({
      success: true,
      message: "Pago confirmado exitosamente",
      order
    });

  } catch (error) {
    console.error('Error confirmando pago:', error);
    res.status(500).json({ 
      success: false, 
      message: "Error al confirmar pago", 
      error: error.message 
    });
  }
};

/**
 * Validar comprobante de transferencia
 */
export const validateReceipt = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { isValid, adminNotes } = req.body;

    const order = await Order.findOne({ id: orderId });
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: "Pedido no encontrado" 
      });
    }

    // Actualizar validación del comprobante
    order.receiptValidation = {
      status: isValid ? 'approved' : 'rejected',
      validatedAt: new Date(),
      adminNotes: adminNotes || ''
    };

    // Si se aprueba, confirmar pago
    if (isValid) {
      order.paymentStatus = 'paid';
      order.paidAt = new Date();
      
      if (order.status === 'Pendiente') {
        order.status = 'Confirmado';
      }

      // Enviar email de confirmación de pago
      if (order.customerEmail) {
        try {
          await sendPaymentConfirmation(order, order.customerEmail);
          console.log(`✅ Email de pago aprobado enviado para pedido ${order.orderNumber}`);
        } catch (emailError) {
          console.error(`❌ Error enviando email de pago aprobado:`, emailError);
        }
      }
    }

    await order.save();

    res.json({
      success: true,
      message: isValid ? "Comprobante aprobado" : "Comprobante rechazado",
      order
    });

  } catch (error) {
    console.error('Error validando comprobante:', error);
    res.status(500).json({ 
      success: false, 
      message: "Error al validar comprobante", 
      error: error.message 
    });
  }
};

export default {
  confirmPayment,
  validateReceipt
};
