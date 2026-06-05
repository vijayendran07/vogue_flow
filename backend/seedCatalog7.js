const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('./models/categoryModel');
const Product = require('./models/productModel');
const User = require('./models/userModel');

dotenv.config();

const slugify = (text) => text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const categoriesData = [
  {
    name: 'Streetwear',
    description: 'Urban essentials and expressive everyday fits.',
    image: 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'Formal Wear',
    description: 'Tailored pieces for office and occasion dressing.',
    image: 'https://images.unsplash.com/photo-1593032465171-8bdc6f8f6f58?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'Ethnic Wear',
    description: 'Traditional silhouettes with contemporary styling.',
    image: 'https://images.unsplash.com/photo-1610030469668-9b8f8f9f96cb?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'Athleisure',
    description: 'Comfort-first activewear for training and travel.',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'Denim',
    description: 'Classic and modern denim staples.',
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'Footwear',
    description: 'Sneakers, loafers and daily rotation shoes.',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'Accessories',
    description: 'Bags, watches and finishing touches.',
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1200&q=80'
  }
];

const productsByCategory = {
  Streetwear: [
    { name: 'Oversized Graphic Hoodie', sku: 'VF-ST-001', price: 3999, discountPrice: 3299, stock: 30, image: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&w=1000&q=80' },
    { name: 'Relaxed Cargo Joggers', sku: 'VF-ST-002', price: 2899, discountPrice: 2499, stock: 40, image: 'https://images.unsplash.com/photo-1506629905607-53e80d0ac4a3?auto=format&fit=crop&w=1000&q=80' }
  ],
  'Formal Wear': [
    { name: 'Slim Fit Navy Blazer', sku: 'VF-FW-001', price: 6999, discountPrice: 6299, stock: 18, image: 'https://images.unsplash.com/photo-1593032457868-5f6b45e34d7f?auto=format&fit=crop&w=1000&q=80' },
    { name: 'Classic White Dress Shirt', sku: 'VF-FW-002', price: 2499, discountPrice: 2199, stock: 50, image: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=1000&q=80' }
  ],
  'Ethnic Wear': [
    { name: 'Embroidered Kurta Set', sku: 'VF-EW-001', price: 4599, discountPrice: 3999, stock: 25, image: 'https://images.unsplash.com/photo-1622445275576-721325763afe?auto=format&fit=crop&w=1000&q=80' },
    { name: 'Festive Nehru Jacket', sku: 'VF-EW-002', price: 3199, discountPrice: 2799, stock: 22, image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=1000&q=80' }
  ],
  Athleisure: [
    { name: 'Performance Dry-Fit Tee', sku: 'VF-AT-001', price: 1599, discountPrice: 1299, stock: 60, image: 'https://images.unsplash.com/photo-1518459031867-a89b944bffe4?auto=format&fit=crop&w=1000&q=80' },
    { name: 'Training Track Pants', sku: 'VF-AT-002', price: 2199, discountPrice: 1899, stock: 45, image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=1000&q=80' }
  ],
  Denim: [
    { name: 'Straight Fit Blue Jeans', sku: 'VF-DN-001', price: 2799, discountPrice: 2399, stock: 55, image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=1000&q=80' },
    { name: 'Washed Black Denim Jacket', sku: 'VF-DN-002', price: 3499, discountPrice: 2999, stock: 26, image: 'https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=1000&q=80' }
  ],
  Footwear: [
    { name: 'Chunky Lifestyle Sneakers', sku: 'VF-FWTR-001', price: 4999, discountPrice: 4399, stock: 34, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80' },
    { name: 'Leather Penny Loafers', sku: 'VF-FWTR-002', price: 5599, discountPrice: 4999, stock: 20, image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=1000&q=80' }
  ],
  Accessories: [
    { name: 'Minimal Leather Backpack', sku: 'VF-AC-001', price: 3899, discountPrice: 3399, stock: 32, image: 'https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?auto=format&fit=crop&w=1000&q=80' },
    { name: 'Stainless Steel Wrist Watch', sku: 'VF-AC-002', price: 6299, discountPrice: 5799, stock: 19, image: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=1000&q=80' }
  ]
};

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@vagueflow.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'password123';

    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({
        name: process.env.ADMIN_NAME || 'VagueFlow Admin',
        email: adminEmail,
        password: adminPassword,
        phone: process.env.ADMIN_PHONE || '9876543210',
        role: 'admin',
        emailVerified: true,
      });
    }

    const categoryMap = {};
    for (const item of categoriesData) {
      let category = await Category.findOne({ name: item.name });
      if (!category) {
        category = await Category.create({
          name: item.name,
          description: item.description,
          image: { public_id: `seed-${slugify(item.name)}`, url: item.image }
        });
      } else {
        category.description = item.description;
        category.image = { public_id: `seed-${slugify(item.name)}`, url: item.image };
        await category.save();
      }
      categoryMap[item.name] = category._id;
    }

    let created = 0;
    let updated = 0;

    for (const [categoryName, products] of Object.entries(productsByCategory)) {
      for (const p of products) {
        const existing = await Product.findOne({ sku: p.sku });
        const payload = {
          name: p.name,
          slug: `${slugify(p.name)}-${p.sku.toLowerCase()}`,
          description: `${p.name} from ${categoryName} collection. Premium build with everyday comfort and style.`,
          category: categoryMap[categoryName],
          brand: 'VagueFlow',
          sku: p.sku,
          price: p.price,
          discountPrice: p.discountPrice,
          stock: p.stock,
          status: 'Active',
          images: [{ public_id: `seed-${p.sku.toLowerCase()}`, url: p.image }],
          variants: [],
          user: admin._id,
          deleted: false,
          seoTitle: p.name,
          seoDescription: `${p.name} at VagueFlow`,
        };

        if (!existing) {
          await Product.create(payload);
          created += 1;
        } else {
          await Product.findByIdAndUpdate(existing._id, payload, { new: true, runValidators: true });
          updated += 1;
        }
      }
    }

    console.log(`Seed complete. Categories: ${Object.keys(categoryMap).length}, Products created: ${created}, updated: ${updated}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
})();
