// src/components/QRScanner.js
import React, { useState, useRef, useEffect } from "react";
import { payOrder } from "../api/orders";
import jsQR from "jsqr";

const QRScanner = ({ onClose, onOrderFound }) => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [orderData, setOrderData] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [cameraMode, setCameraMode] = useState(false);
  const [stream, setStream] = useState(null);
  const [lastQR, setLastQR] = useState(null);
  const [detected, setDetected] = useState(false); // ✅ Para el marco verde

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // 🔊 Reproducir sonido
  const activarSonido = () => {
    const audio = document.getElementById("audioScaner");
    if (audio) audio.play().catch(() => {});
  };

  // 🧩 Procesar contenido del QR
  const processQRData = (qrContent) => {
    if (!qrContent || qrContent === lastQR) return; // evitar duplicados
    setLastQR(qrContent);

    try {
      const orderInfo = JSON.parse(qrContent);
      if (orderInfo.id && orderInfo.customerName) {
        setOrderData(orderInfo);
        setError("");
        if (onOrderFound) onOrderFound(orderInfo);
      } else {
        setError("QR no válido: datos incompletos");
      }
    } catch {
      // fallback si es solo texto/ID
      setOrderData({
        id: qrContent,
        customerName: "Cliente (manual/QR simple)",
        items: [],
        totalCLP: 0,
        paid: false,
      });
      setError("");
    }

    activarSonido();
    setDetected(true); // ✅ activar marco verde
    setTimeout(() => setDetected(false), 1000);
    stopCamera();
  };

  // 📷 Iniciar cámara
  const startCamera = async () => {
    try {
      setError("");
      setScanning(true);

      const constraints = {
        video: { facingMode: { ideal: "environment" } }, // trasera en móviles
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setCameraMode(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.setAttribute("playsinline", true);
        videoRef.current.setAttribute("webkit-playsinline", true);
        videoRef.current.muted = true;
        await videoRef.current.play();
        startScanning();
      }
    } catch (err) {
      console.error("Error al abrir cámara:", err);
      setError("No se pudo acceder a la cámara. Verifica permisos o HTTPS.");
      setScanning(false);
    }
  };

  // ⛔ Detener cámara
  const stopCamera = () => {
    setScanning(false);
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraMode(false);
  };

  // 🔍 Escanear frame a frame
  const startScanning = () => {
    const scanFrame = () => {
      if (!scanning || !videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, canvas.width, canvas.height);

        if (code) {
          processQRData(code.data);
          return; // detener loop tras leer
        }
      }
      if (scanning) requestAnimationFrame(scanFrame);
    };
    requestAnimationFrame(scanFrame);
  };

  // 📂 Subir imagen con QR
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, canvas.width, canvas.height);
        if (code) {
          processQRData(code.data);
        } else {
          setError("No se detectó QR en la imagen.");
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  // 💰 Marcar pedido como pagado
  const handleMarkAsPaid = async () => {
    if (!orderData?.id) return;
    setProcessing(true);
    try {
      await payOrder(orderData.id, orderData.paymentMethod || "local");
      setOrderData((prev) => ({
        ...prev,
        paid: true,
        paymentDate: new Date(),
      }));
      alert("¡Pedido marcado como PAGADO!");
    } catch (err) {
      alert("Error al marcar como pagado: " + err.message);
    } finally {
      setProcessing(false);
    }
  };

  // 🚮 Limpieza al desmontar
  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
  }, [stream]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[95vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Lector QR - Pedidos</h2>
          {error && (
            <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>
          )}

          {!cameraMode ? (
            <>
              <button
                onClick={startCamera}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg mb-3"
              >
                📹 Usar Cámara
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg mb-3"
              >
                📷 Subir Imagen con QR
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🔤 Entrada manual
                </label>
                <input
                  type="text"
                  placeholder="Ej: ORD001"
                  className="w-full border p-2 rounded"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      const id = e.target.value.trim();
                      if (id) processQRData(id);
                    }
                  }}
                />
              </div>
            </>
          ) : (
            <div className="relative w-full h-64">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover rounded transition-all duration-300 ${
                  detected ? "ring-4 ring-green-500" : "ring-2 ring-gray-300"
                }`}
              />
              <canvas ref={canvasRef} className="hidden" />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={stopCamera}
                  className="flex-1 bg-red-600 text-white p-2 rounded"
                >
                  ❌ Cerrar Cámara
                </button>
              </div>
            </div>
          )}

          {orderData && (
            <div className="border mt-4 p-3 rounded">
              <h3 className="font-bold mb-2">📋 Detalles del Pedido</h3>
              <p><b>Pedido:</b> {orderData.id}</p>
              <p><b>Cliente:</b> {orderData.customerName}</p>
              <p><b>Total:</b> ${orderData.totalCLP}</p>
              {!orderData.paid && (
                <button
                  onClick={handleMarkAsPaid}
                  disabled={processing}
                  className="mt-2 w-full bg-green-600 text-white p-2 rounded"
                >
                  {processing ? "Procesando..." : "💰 Marcar como PAGADO"}
                </button>
              )}
            </div>
          )}

          <div className="text-center mt-4">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {/* Audio para beep */}
      <audio id="audioScaner" src="/public/beep.mp3" preload="auto" />
    </div>
  );
};

export default QRScanner;
