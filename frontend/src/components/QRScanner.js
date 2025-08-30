// src/components/QRScanner.js
import React, { useState, useRef, useEffect } from 'react';
import { payOrder } from '../api/orders';
import jsQR from "jsqr"; // 👈 nuevo

const QRScanner = ({ onClose, onOrderFound }) => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [cameraMode, setCameraMode] = useState(false);
  const [stream, setStream] = useState(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const processQRData = (qrContent) => {
    try {
      const orderInfo = JSON.parse(qrContent);
      if (orderInfo.id && orderInfo.customerName) {
        setOrderData(orderInfo);
        setError('');
        if (onOrderFound) onOrderFound(orderInfo);
      } else {
        setError('QR no válido: no contiene información de pedido');
      }
    } catch {
      setError('QR no válido: formato incorrecto');
    }
  };

  const startCamera = async () => {
    try {
      setError('');
      setScanning(true);
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setCameraMode(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.setAttribute('playsinline', true);
        videoRef.current.setAttribute('webkit-playsinline', true);
        videoRef.current.muted = true; // 👈 Safari iOS necesita muted
        await videoRef.current.play();

        videoRef.current.addEventListener('loadedmetadata', () => {
          startScanning();
        });
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setScanning(false);
      if (err.name === 'NotAllowedError') {
        setError('Permisos de cámara denegados.');
      } else if (err.name === 'NotFoundError') {
        setError('No se encontró cámara en el dispositivo.');
      } else {
        setError('Error de cámara: ' + err.message);
      }
    }
  };

  const stopCamera = () => {
    setScanning(false);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraMode(false);
    setError('');
  };

  const startScanning = () => {
    if (!scanning) return;

    const scanFrame = () => {
      if (!scanning || !videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, canvas.width, canvas.height);

        if (code) {
          processQRData(code.data);
          stopCamera(); // detener después de encontrar el QR
        }
      }
      if (scanning) requestAnimationFrame(scanFrame);
    };

    requestAnimationFrame(scanFrame);
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    setError('Frame capturado. Intenta mover el QR dentro del marco.');
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handleMarkAsPaid = async () => {
    if (!orderData?.id) return;
    setProcessing(true);
    try {
      await payOrder(orderData.id, orderData.paymentMethod || 'local');
      setOrderData(prev => ({ ...prev, paid: true, paymentDate: new Date() }));
      alert('¡Pedido marcado como PAGADO!');
    } catch (err) {
      alert('Error al marcar como pagado: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Lector QR - Pedidos</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
          </div>

          {error && <div className="bg-red-50 text-red-700 p-3 rounded mb-4">{error}</div>}

          {!cameraMode ? (
            <div className="space-y-4 mb-6">
              <button onClick={startCamera} className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
                📹 Usar Cámara
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                📷 Subir imagen con QR
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-64 sm:h-80 object-cover"
                  autoPlay
                  playsInline
                  webkit-playsinline="true"
                  muted
                />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 sm:w-48 sm:h-48 border-2 border-white border-dashed rounded-lg opacity-70"></div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={captureFrame} className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  📱 Capturar Frame
                </button>
                <button onClick={stopCamera} className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  ❌ Cerrar Cámara
                </button>
              </div>
            </div>
          )}

          {orderData && (
            <div className="border rounded-lg p-4 mb-4">
              <h3 className="font-bold text-lg mb-3 text-center">📋 Detalles del Pedido</h3>
              <p><strong>Pedido:</strong> #{orderData.id}</p>
              <p><strong>Cliente:</strong> {orderData.customerName}</p>
              <p><strong>Total:</strong> ${orderData.totalCLP}</p>
              {!orderData.paid && (
                <button onClick={handleMarkAsPaid} disabled={processing} className="w-full mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  {processing ? 'Procesando...' : '💰 Marcar como PAGADO'}
                </button>
              )}
            </div>
          )}

          <div className="flex justify-center">
            <button onClick={onClose} className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
