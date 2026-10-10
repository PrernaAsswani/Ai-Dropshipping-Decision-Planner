const axios = require('axios');

const API_URL = 'http://localhost:8080/api';

async function seedData() {
  try {
    console.log('Seeding demo data to local server...');

    // Create Suppliers
    const suppliers = [
      { name: 'Global Electro', rating: 4.5, deliveryTimeDays: 7, returnRate: 3.0, qualityScore: 85, priceLevel: 'Medium' },
      { name: 'HomeGoods Express', rating: 4.9, deliveryTimeDays: 3, returnRate: 1.5, qualityScore: 98, priceLevel: 'High' },
      { name: 'Fashion Hub', rating: 3.8, deliveryTimeDays: 14, returnRate: 8.0, qualityScore: 65, priceLevel: 'Low' },
      { name: 'EcoPack Solutions', rating: 4.7, deliveryTimeDays: 5, returnRate: 1.0, qualityScore: 92, priceLevel: 'Medium' }
    ];

    const createdSuppliers = [];
    for (const sup of suppliers) {
      const res = await axios.post(`${API_URL}/suppliers`, sup);
      createdSuppliers.push(res.data);
      console.log(`Created supplier: ${sup.name}`);
    }

    // Create Products
    const products = [
      { name: 'Smart Fitness Watch', category: 'Electronics', cost: 400, sellingPrice: 1499, additionalCost: 100, rating: 4.2, salesVolume: 'Medium', supplierId: createdSuppliers[0].id },
      { name: 'Ergonomic Office Chair', category: 'Furniture', cost: 2000, sellingPrice: 5500, additionalCost: 500, rating: 4.8, salesVolume: 'High', supplierId: createdSuppliers[1].id },
      { name: 'Minimalist Leather Wallet', category: 'Fashion', cost: 150, sellingPrice: 799, additionalCost: 50, rating: 4.0, salesVolume: 'High', supplierId: createdSuppliers[2].id },
      { name: 'Portable Smoothie Blender', category: 'Kitchen', cost: 600, sellingPrice: 1499, additionalCost: 120, rating: 3.5, salesVolume: 'Low', supplierId: createdSuppliers[0].id },
      { name: 'Bamboo Cutlery Set', category: 'Eco-friendly', cost: 80, sellingPrice: 499, additionalCost: 20, rating: 4.9, salesVolume: 'Medium', supplierId: createdSuppliers[3].id }
    ];

    for (const prod of products) {
      await axios.post(`${API_URL}/products`, prod);
      console.log(`Created product: ${prod.name}`);
    }

    console.log('\nDemo data seeded successfully! You can refresh your dashboard to see the new items.');
  } catch (err) {
    console.error('Error seeding data:', err.message);
  }
}

seedData();
