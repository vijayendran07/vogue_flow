const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('./models/categoryModel');
const Product = require('./models/productModel');
const User = require('./models/userModel');

dotenv.config();

const myntraCategories = [
  { name: 'Men', description: 'Top wear, bottom wear, footwear, and accessories for men.' },
  { name: 'Women', description: 'Ethnic, western, footwear, and accessories for women.' },
  { name: 'Kids', description: 'Boys, girls, and infant clothing.' },
  { name: 'Home & Living', description: 'Bed linen, home decor, furnishing, and more.' },
  { name: 'Beauty', description: 'Makeup, skincare, haircare, and fragrances.' },
  { name: 'Studio', description: 'Curated fashion feed and latest trends.' }
];

const categoryTemplates = {
  'Men': [
    { prefix: 'Roadster', item: 'Checked Casual Shirt', image: 'https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?auto=format&fit=crop&w=800&q=80', brand: 'Roadster' },
    { prefix: 'HRX', item: 'Solid T-shirt', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80', brand: 'HRX' },
    { prefix: 'Puma', item: 'Running Shoes', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80', brand: 'Puma' },
    { prefix: 'Tommy Hilfiger', item: 'Slim Fit Jeans', image: 'https://images.unsplash.com/photo-1542272604-780c8dfaf2dc?auto=format&fit=crop&w=800&q=80', brand: 'Tommy Hilfiger' },
    { prefix: 'WROGN', item: 'Olive Green Jacket', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80', brand: 'WROGN' }
  ],
  'Women': [
    { prefix: 'Anouk', item: 'Pink Yoke Design Kurta Set', image: 'https://images.unsplash.com/photo-1583391733958-66124620b7ba?auto=format&fit=crop&w=800&q=80', brand: 'Anouk' },
    { prefix: 'SASSAFRAS', item: 'Maroon Fit and Flare Dress', image: 'https://images.unsplash.com/photo-1515347619362-75fe3f0f15c1?auto=format&fit=crop&w=800&q=80', brand: 'SASSAFRAS' },
    { prefix: 'H&M', item: 'Beige Trench Coat', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80', brand: 'H&M' },
    { prefix: 'Nike', item: 'Air Max Sneakers', image: 'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=800&q=80', brand: 'Nike' },
    { prefix: 'Biba', item: 'Ethnic Printed Maxi Dress', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80', brand: 'Biba' }
  ],
  'Kids': [
    { prefix: 'Gini and Jony', item: 'Boys Cotton T-shirt', image: 'https://images.unsplash.com/photo-1519238263530-99abad674e40?auto=format&fit=crop&w=800&q=80', brand: 'Gini and Jony' },
    { prefix: 'Peppa Pig', item: 'Girls Pink Party Dress', image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80', brand: 'Peppa Pig' },
    { prefix: 'Mothercare', item: 'Infant Bodysuits (Pack of 3)', image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80', brand: 'Mothercare' },
    { prefix: 'GAP Kids', item: 'Denim Overalls', image: 'https://images.unsplash.com/photo-1519238263530-99abad674e40?auto=format&fit=crop&w=800&q=80', brand: 'GAP' },
    { prefix: 'Allen Solly Junior', item: 'Checked Shirt', image: 'https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?auto=format&fit=crop&w=800&q=80', brand: 'Allen Solly' }
  ],
  'Home & Living': [
    { prefix: 'Bombay Dyeing', item: 'Floral Double Bedsheet', image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80', brand: 'Bombay Dyeing' },
    { prefix: 'Home Centre', item: 'Golden Decorative Vase', image: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=800&q=80', brand: 'Home Centre' },
    { prefix: 'Spaces', item: 'Premium Cotton Towel Set', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80', brand: 'Spaces' },
    { prefix: 'D\'Decor', item: 'Blackout Curtains', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80', brand: 'D\'Decor' },
    { prefix: 'Pure Home', item: 'Ceramic Dinner Set', image: 'https://images.unsplash.com/photo-1576697486806-a8362b9cc3eb?auto=format&fit=crop&w=800&q=80', brand: 'Pure Home' }
  ],
  'Beauty': [
    { prefix: 'Lakme', item: 'Absolute Skin Dew Color', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=800&q=80', brand: 'Lakme' },
    { prefix: 'POND\'S', item: 'Pure Detox Anti-Pollution Face Wash', image: 'https://images.unsplash.com/photo-1615397323136-1e075f73d573?auto=format&fit=crop&w=800&q=80', brand: 'POND\'S' },
    { prefix: 'MAC', item: 'Ruby Woo Matte Lipstick', image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80', brand: 'MAC' },
    { prefix: 'L\'Oreal Paris', item: 'Revitalift Hyaluronic Acid Serum', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80', brand: 'L\'Oreal' },
    { prefix: 'Maybelline', item: 'Colossal Volum Express Mascara', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80', brand: 'Maybelline' }
  ],
  'Studio': [
    { prefix: 'VogueFlow', item: 'Exclusive Velvet Blazer', image: 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=800&q=80', brand: 'VogueFlow Studio' },
    { prefix: 'HighFashion', item: 'Designer Tote Bag', image: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=800&q=80', brand: 'HighFashion' },
    { prefix: 'Boutique', item: 'Silk Evening Gown', image: 'https://images.unsplash.com/photo-1566160980280-c116499313b2?auto=format&fit=crop&w=800&q=80', brand: 'Boutique' },
    { prefix: 'Couture', item: 'Embroidered Crop Top', image: 'https://images.unsplash.com/photo-1515347619362-75fe3f0f15c1?auto=format&fit=crop&w=800&q=80', brand: 'Couture' },
    { prefix: 'AvantGarde', item: 'Oversized Streetwear Hoodie', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80', brand: 'AvantGarde' }
  ]
};

const colors = ['Red', 'Blue', 'Green', 'Black', 'White', 'Yellow', 'Pink', 'Grey', 'Navy', 'Olive', 'Maroon', 'Beige'];
const modifiers = ['Premium', 'Classic', 'Modern', 'Essential', 'Signature', 'Urban', 'Authentic', 'Vibrant', 'Minimalist', 'Luxurious'];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateProducts(catMap, adminId) {
  const products = [];
  
  for (const categoryName of myntraCategories.map(c => c.name)) {
    const templates = categoryTemplates[categoryName];
    const categoryId = catMap[categoryName];
    
    // Generate exactly 20 products per category
    for (let i = 1; i <= 20; i++) {
      const template = templates[i % templates.length];
      const color = getRandomItem(colors);
      const modifier = getRandomItem(modifiers);
      
      const productName = `${template.prefix} ${modifier} ${color} ${template.item}`;
      const slug = productName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + i;
      
      const basePrice = Math.floor(Math.random() * 4000) + 500; // Between 500 and 4500
      const discountPercentage = Math.floor(Math.random() * 50) + 10; // 10% to 60% discount
      const discountPrice = Math.floor(basePrice * (1 - discountPercentage / 100));
      
      products.push({
        name: productName,
        slug: slug,
        description: `This is a beautiful ${color.toLowerCase()} ${template.item.toLowerCase()} from ${template.brand}. Perfect for your collection. Guaranteed authentic and high quality.`,
        category: categoryId,
        brand: template.brand,
        sku: `MYN-${categoryName.substring(0, 3).toUpperCase()}-${i.toString().padStart(4, '0')}`,
        price: basePrice,
        discountPrice: discountPrice,
        stock: Math.floor(Math.random() * 200) + 10,
        status: 'Active',
        ratings: (Math.random() * 1.5 + 3.5).toFixed(1), // 3.5 to 5.0
        numOfReviews: Math.floor(Math.random() * 1000) + 5,
        images: [{ public_id: `img_${categoryName}_${i}`, url: template.image }],
        user: adminId
      });
    }
  }
  
  return products;
}

const seedMyntra = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const adminUser = await User.findOne({ role: 'admin' }) || await User.findOne();
    
    await Category.deleteMany();
    await Product.deleteMany();
    
    const seededCategories = await Category.insertMany(myntraCategories);
    const catMap = {};
    seededCategories.forEach(c => catMap[c.name] = c._id);
    
    const products = generateProducts(catMap, adminUser._id);
    await Product.insertMany(products);
    
    console.log(`Seeded Myntra Categories & ${products.length} Products Successfully! (20 per category)`);
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedMyntra();
