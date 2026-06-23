import { env } from '../config/env';
import { connectDB, disconnectDB } from '../config/db';
import { Product } from '../models/Product';

// Sample catalog across several categories so search/filter/sort have variety.
const products = [
  { name: 'Classic Cotton Tee', description: 'Soft breathable everyday t-shirt.', price: 19.99, category: 'clothing', stock: 50, images: [] },
  { name: 'Denim Jacket', description: 'Rugged blue denim jacket with button front.', price: 79.99, category: 'clothing', stock: 20, images: [] },
  { name: 'Wool Beanie', description: 'Warm knitted wool beanie for winter.', price: 14.99, category: 'clothing', stock: 100, images: [] },
  { name: 'Ceramic Coffee Mug', description: '350ml glazed ceramic mug.', price: 9.99, category: 'home', stock: 80, images: [] },
  { name: 'LED Desk Lamp', description: 'Adjustable bright LED lamp with USB port.', price: 39.99, category: 'home', stock: 35, images: [] },
  { name: 'Scented Candle Set', description: 'Set of three soy wax scented candles.', price: 24.99, category: 'home', stock: 60, images: [] },
  { name: 'Wireless Earbuds', description: 'Bluetooth 5 earbuds with charging case.', price: 59.99, category: 'electronics', stock: 40, images: [] },
  { name: 'Mechanical Keyboard', description: 'Tactile RGB mechanical keyboard.', price: 109.99, category: 'electronics', stock: 25, images: [] },
  { name: 'USB-C Hub', description: '7-in-1 USB-C hub with HDMI and SD.', price: 34.99, category: 'electronics', stock: 45, images: [] },
  { name: 'The Pragmatic Programmer', description: 'Classic software craftsmanship book.', price: 42.0, category: 'books', stock: 30, images: [] },
  { name: 'Clean Code', description: 'A handbook of agile software craftsmanship.', price: 38.5, category: 'books', stock: 30, images: [] },
  { name: 'You Dont Know JS', description: 'Deep dive into JavaScript mechanics.', price: 29.0, category: 'books', stock: 30, images: [] },
];

async function seed(): Promise<void> {
  await connectDB(env.MONGO_URI);
  await Product.deleteMany({});
  await Product.create(products); // create() runs hooks → slugs generated
  console.log(`🌱 Seeded ${products.length} products`);
  await disconnectDB();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
