import mongoose from 'mongoose';
const productSchema = new mongoose.Schema({
  {
    id: '1',
    name: 'Arrachera Marinada',
    description: 'Corte de res marinado listo para asar, suave y jugoso.',
    price: 180.00,
    unit: 'kg',
    image: 'https://via.placeholder.com/150/FF5733/FFFFFF?text=Arrachera',
    stock: 50,
  },
  {
    id: '2',
    name: 'Chorizo Argentino',
    description: 'Chorizo casero con especias tradicionales, ideal para parrilla.',
    price: 90.00,
    unit: 'pieza',
    image: 'https://via.placeholder.com/150/33FF57/FFFFFF?text=Chorizo',
    stock: 100,
  },
  {
    id: '3',
    name: 'Costillas de Cerdo',
    description: 'Costillas de cerdo frescas, perfectas para barbacoa.',
    price: 120.00,
    unit: 'kg',
    image: 'https://via.placeholder.com/150/3357FF/FFFFFF?text=Costillas',
    stock: 75,
  },
  {
    id: '4',
    name: 'Sirloin',
    description: 'Corte de res magro y tierno, excelente para bistecs.',
    price: 220.00,
    unit: 'kg',
    image: 'https://via.placeholder.com/150/FF33A1/FFFFFF?text=Sirloin',
    stock: 40,
  },
  {
    id: '5',
    name: 'Carne Molida',
    description: 'Carne de res molida de primera calidad, ideal para guisos.',
    price: 100.00,
    unit: 'kg',
    image: 'https://via.placeholder.com/150/A133FF/FFFFFF?text=Molida',
    stock: 120,
});

export default mongoose.model('Product', productSchema);