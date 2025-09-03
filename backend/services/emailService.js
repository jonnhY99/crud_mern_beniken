import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

// Configurar SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// URL base del cliente (frontend)
const CLIENT_URL = process.env.CLIENT_URL?.split(',')[0] || 'http://localhost:3000';

/**
 * Envía email de confirmación de pedido
 */
export const sendOrderConfirmation = async (order, customerEmail) => {
  try {
    const orderTrackingUrl = `${CLIENT_URL}/order-status/${order._id}`;
    
    const msg = {
      to: customerEmail,
      from: process.env.MAIL_FROM || 'noreply@beniken.cl',
      subject: `Confirmación de Pedido #${order.orderNumber} - Beniken Carnes`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #10B981; margin: 0;">🥩 Beniken Carnes</h1>
            <h2 style="color: #374151; margin: 10px 0;">¡Pedido Confirmado!</h2>
          </div>
          
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #374151; margin-top: 0;">Detalles del Pedido</h3>
            <p><strong>Número de Pedido:</strong> #${order.orderNumber}</p>
            <p><strong>Cliente:</strong> ${order.customerName}</p>
            <p><strong>Total:</strong> $${order.totalCLP?.toLocaleString('es-CL') || 'N/A'}</p>
            <p><strong>Estado:</strong> ${order.status}</p>
            ${order.deliveryAddress ? 
              `<p><strong>Dirección de Despacho:</strong> ${order.deliveryAddress}</p>` : 
              `<p><strong>Retiro en Local:</strong> ${order.pickupTime || 'Por coordinar'}</p>`
            }
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${orderTrackingUrl}" 
               style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              📱 Ver Estado del Pedido
            </a>
          </div>

          <div style="background-color: #EFF6FF; padding: 15px; border-radius: 6px; border-left: 4px solid #3B82F6;">
            <p style="margin: 0; color: #1E40AF;">
              <strong>💡 Consejo:</strong> Guarda este enlace para seguir el estado de tu pedido en tiempo real.
            </p>
          </div>

          <div style="margin-top: 30px; text-align: center; color: #6B7280; font-size: 14px;">
            <p>Gracias por confiar en Beniken Carnes</p>
            <p>📞 Contacto: +56 9 1234 5678 | 📧 info@beniken.cl</p>
          </div>
        </div>
      `
    };

    await sgMail.send(msg);
    console.log(`✅ Email de confirmación enviado a ${customerEmail}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error enviando email de confirmación:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Envía email de actualización de estado del pedido
 */
export const sendOrderStatusUpdate = async (order, customerEmail, newStatus) => {
  try {
    const orderTrackingUrl = `${CLIENT_URL}/order-status/${order._id}`;
    
    // Mensajes personalizados según el estado
    const statusMessages = {
      'confirmado': {
        title: '✅ Pedido Confirmado',
        message: 'Tu pedido ha sido confirmado y está siendo preparado.',
        color: '#10B981'
      },
      'preparando': {
        title: '👨‍🍳 Preparando tu Pedido',
        message: 'Nuestro equipo está preparando cuidadosamente tu pedido.',
        color: '#F59E0B'
      },
      'listo': {
        title: '🎉 Pedido Listo',
        message: order.deliveryAddress ? 
          'Tu pedido está listo para despacho.' : 
          'Tu pedido está listo para retiro en nuestro local.',
        color: '#10B981'
      },
      'en_camino': {
        title: '🚚 En Camino',
        message: 'Tu pedido está en camino. ¡Pronto llegará a tu dirección!',
        color: '#3B82F6'
      },
      'entregado': {
        title: '✨ Pedido Entregado',
        message: '¡Tu pedido ha sido entregado exitosamente! Esperamos que disfrutes nuestros productos.',
        color: '#10B981'
      },
      'cancelado': {
        title: '❌ Pedido Cancelado',
        message: 'Tu pedido ha sido cancelado. Si tienes dudas, contáctanos.',
        color: '#EF4444'
      }
    };

    const statusInfo = statusMessages[newStatus] || {
      title: '📋 Actualización de Pedido',
      message: `El estado de tu pedido ha cambiado a: ${newStatus}`,
      color: '#6B7280'
    };

    const msg = {
      to: customerEmail,
      from: process.env.MAIL_FROM || 'noreply@beniken.cl',
      subject: `${statusInfo.title} - Pedido #${order.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #10B981; margin: 0;">🥩 Beniken Carnes</h1>
            <h2 style="color: ${statusInfo.color}; margin: 10px 0;">${statusInfo.title}</h2>
          </div>
          
          <div style="background-color: #F9FAFB; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid ${statusInfo.color};">
            <p style="font-size: 16px; margin: 0; color: #374151;">
              ${statusInfo.message}
            </p>
          </div>

          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #374151; margin-top: 0;">Detalles del Pedido</h3>
            <p><strong>Número de Pedido:</strong> #${order.orderNumber}</p>
            <p><strong>Cliente:</strong> ${order.customerName}</p>
            <p><strong>Total:</strong> $${order.totalCLP?.toLocaleString('es-CL') || 'N/A'}</p>
            <p><strong>Estado Actual:</strong> <span style="color: ${statusInfo.color}; font-weight: bold;">${newStatus.toUpperCase()}</span></p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${orderTrackingUrl}" 
               style="background-color: ${statusInfo.color}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              📱 Ver Detalles Completos
            </a>
          </div>

          <div style="background-color: #EFF6FF; padding: 15px; border-radius: 6px; border-left: 4px solid #3B82F6;">
            <p style="margin: 0; color: #1E40AF;">
              <strong>💡 Seguimiento:</strong> Haz clic en el botón de arriba para ver el progreso completo de tu pedido.
            </p>
          </div>

          <div style="margin-top: 30px; text-align: center; color: #6B7280; font-size: 14px;">
            <p>Gracias por confiar en Beniken Carnes</p>
            <p>📞 Contacto: +56 9 1234 5678 | 📧 info@beniken.cl</p>
          </div>
        </div>
      `
    };

    await sgMail.send(msg);
    console.log(`✅ Email de actualización enviado a ${customerEmail} - Estado: ${newStatus}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error enviando email de actualización:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Envía email de notificación de pago recibido
 */
export const sendPaymentConfirmation = async (order, customerEmail) => {
  try {
    const orderTrackingUrl = `${CLIENT_URL}/order-status/${order._id}`;
    
    const msg = {
      to: customerEmail,
      from: process.env.MAIL_FROM || 'noreply@beniken.cl',
      subject: `💳 Pago Confirmado - Pedido #${order.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #10B981; margin: 0;">🥩 Beniken Carnes</h1>
            <h2 style="color: #10B981; margin: 10px 0;">💳 ¡Pago Confirmado!</h2>
          </div>
          
          <div style="background-color: #ECFDF5; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #10B981;">
            <p style="font-size: 16px; margin: 0; color: #065F46;">
              <strong>✅ Hemos recibido tu pago correctamente.</strong><br>
              Tu pedido ahora será procesado y preparado.
            </p>
          </div>

          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #374151; margin-top: 0;">Información del Pago</h3>
            <p><strong>Pedido:</strong> #${order.orderNumber}</p>
            <p><strong>Monto:</strong> $${order.totalCLP?.toLocaleString('es-CL') || 'N/A'}</p>
            <p><strong>Método:</strong> ${order.paymentMethod === 'transfer' ? 'Transferencia Bancaria' : 'Pago Online'}</p>
            <p><strong>Estado:</strong> <span style="color: #10B981; font-weight: bold;">PAGADO</span></p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${orderTrackingUrl}" 
               style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              📱 Seguir mi Pedido
            </a>
          </div>

          <div style="background-color: #FEF3C7; padding: 15px; border-radius: 6px; border-left: 4px solid #F59E0B;">
            <p style="margin: 0; color: #92400E;">
              <strong>⏰ Próximos pasos:</strong> Comenzaremos a preparar tu pedido. Te notificaremos cuando esté listo.
            </p>
          </div>

          <div style="margin-top: 30px; text-align: center; color: #6B7280; font-size: 14px;">
            <p>Gracias por confiar en Beniken Carnes</p>
            <p>📞 Contacto: +56 9 1234 5678 | 📧 info@beniken.cl</p>
          </div>
        </div>
      `
    };

    await sgMail.send(msg);
    console.log(`✅ Email de confirmación de pago enviado a ${customerEmail}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error enviando email de confirmación de pago:', error);
    return { success: false, error: error.message };
  }
};

export default {
  sendOrderConfirmation,
  sendOrderStatusUpdate,
  sendPaymentConfirmation
};
