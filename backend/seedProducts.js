const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('./models/categoryModel');
const Product = require('./models/productModel');
const User = require('./models/userModel');

// Load env
dotenv.config();

const categoriesData = [
  {
    name: 'Outerwear',
    description: 'Sleek coats, premium techwear jackets, and architectural layering shells.'
  },
  {
    name: 'Streetwear',
    description: 'Heavyweight oversized hoodies, retro graphic tees, and relaxed-fit urban wear.'
  },
  {
    name: 'Minimalist Basics',
    description: 'Tailored knitwear, essential structured pants, and organic waffle-weave layers.'
  },
  {
    name: 'Accessories',
    description: 'Glassmorphic acetate sunglasses, matte-finish tech pouches, and hardware utility belts.'
  }
];

const getProductsData = (categoryMap, userId) => [
  // --- OUTERWEAR ---
  {
    name: 'AeroShell Techwear Field Jacket',
    slug: 'aeroshell-techwear-field-jacket',
    description: 'Engineered for urban exploration, this high-performance field jacket is constructed from 3-layer waterproof matte nylon. Features multiple laser-cut utility pockets, a fully adjustable storm hood, and integrated shoulder straps for easy carrying when off-shoulder. Completed with waterproof seam-taped zippers and modular attachment loops for utility modules.',
    category: categoryMap['Outerwear'],
    brand: 'VagueFlow Tech',
    sku: 'VF-OUT-001',
    price: 18500,
    discountPrice: 14800,
    stock: 24,
    status: 'Active',
    ratings: 4.8,
    numOfReviews: 12,
    images: [
      {
        public_id: 'aeroshell_main',
        url: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=800&q=80'
      }
    ],
    variants: [
      { size: 'S', color: 'Matte Black', stock: 8, priceDifference: 0 },
      { size: 'M', color: 'Matte Black', stock: 10, priceDifference: 0 },
      { size: 'L', color: 'Matte Black', stock: 6, priceDifference: 0 }
    ],
    user: userId
  },
  {
    name: 'Sartorial Cashmere Blend Overcoat',
    slug: 'sartorial-cashmere-blend-overcoat',
    description: 'A classic silhouette reimagined with a modern, relaxed drape. Crafted from a heavyweight Italian cashmere-wool blend, this single-breasted overcoat features a clean, hidden-placket front, wide notch lapels, and deep welt pockets. Fully lined in silky Bemberg rayon for seamless layering over tailoring or heavy knitwear.',
    category: categoryMap['Outerwear'],
    brand: 'VagueFlow Studio',
    sku: 'VF-OUT-002',
    price: 32000,
    discountPrice: 28500,
    stock: 12,
    status: 'Active',
    ratings: 4.9,
    numOfReviews: 8,
    images: [
      {
        public_id: 'cashmere_overcoat_main',
        url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80'
      }
    ],
    variants: [
      { size: 'M', color: 'Charcoal Grey', stock: 6, priceDifference: 0 },
      { size: 'L', color: 'Charcoal Grey', stock: 6, priceDifference: 0 }
    ],
    user: userId
  },
  {
    name: 'Modular Cropped Flight Bomber',
    slug: 'modular-cropped-flight-bomber',
    description: 'An updated take on the iconic military flight jacket. Designed with a distinct cropped silhouette, dropped shoulders, and heavy-gauge elastic ribbing. Features a sleeve zip pocket, heavy silver hardware, and a fully detachable water-resistant hood. Crafted from ultra-durable satin nylon that catches light beautifully.',
    category: categoryMap['Outerwear'],
    brand: 'VagueFlow Street',
    sku: 'VF-OUT-003',
    price: 14500,
    discountPrice: 12000,
    stock: 18,
    status: 'Active',
    ratings: 4.7,
    numOfReviews: 16,
    images: [
      {
        public_id: 'flight_bomber_main',
        url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80'
      }
    ],
    variants: [
      { size: 'S', color: 'Olive Drab', stock: 6, priceDifference: 0 },
      { size: 'M', color: 'Olive Drab', stock: 8, priceDifference: 0 },
      { size: 'L', color: 'Olive Drab', stock: 4, priceDifference: 0 }
    ],
    user: userId
  },

  // --- STREETWEAR ---
  {
    name: 'Heavyweight Boxy Loopback Hoodie',
    slug: 'heavyweight-boxy-loopback-hoodie',
    description: 'Constructed from a massive 500GSM custom-knit loopback organic cotton, this hoodie offers the ultimate structured silhouette. Features dry-touch outer face, pre-shrunk washed finish, no drawstrings for a cleaner aesthetic, a double-layered stiff hood, and relaxed shoulders. Designed to age beautifully with wash and wear.',
    category: categoryMap['Streetwear'],
    brand: 'VagueFlow Basics',
    sku: 'VF-STR-001',
    price: 8500,
    discountPrice: 7200,
    stock: 45,
    status: 'Active',
    ratings: 4.9,
    numOfReviews: 34,
    images: [
      {
        public_id: 'boxy_hoodie_main',
        url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80'
      }
    ],
    variants: [
      { size: 'S', color: 'Cement Grey', stock: 15, priceDifference: 0 },
      { size: 'M', color: 'Cement Grey', stock: 20, priceDifference: 0 },
      { size: 'L', color: 'Cement Grey', stock: 10, priceDifference: 0 }
    ],
    user: userId
  },
  {
    name: 'Cyberpunk Distressed Graphic Tee',
    slug: 'cyberpunk-distressed-graphic-tee',
    description: 'An oversized, drop-shoulder graphic tee cut from premium 280GSM heavy combed cotton. Features a custom neon screen-printed graphic at the back inspired by minimalist dystopian blueprints. Pre-distressed necklines and hems provide a broken-in, retro-futuristic streetwear feel.',
    category: categoryMap['Streetwear'],
    brand: 'VagueFlow Graphic',
    sku: 'VF-STR-002',
    price: 4800,
    discountPrice: 3900,
    stock: 60,
    status: 'Active',
    ratings: 4.6,
    numOfReviews: 42,
    images: [
      {
        public_id: 'graphic_tee_main',
        url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80'
      }
    ],
    variants: [
      { size: 'S', color: 'Acid Wash Black', stock: 20, priceDifference: 0 },
      { size: 'M', color: 'Acid Wash Black', stock: 25, priceDifference: 0 },
      { size: 'L', color: 'Acid Wash Black', stock: 15, priceDifference: 0 }
    ],
    user: userId
  },
  {
    name: 'Slouchy Triple-Pocket Utility Cargo',
    slug: 'slouchy-triple-pocket-utility-cargo',
    description: 'Constructed from a premium cotton-ripstop weave that resists tearing while remaining highly breathable. Engineered with deep double-cargo pockets on both thighs featuring glassmorphic quick-release hardware, articulation panels at the knees for absolute movement, and toggles at the hem to switch between straight and tapered fits.',
    category: categoryMap['Streetwear'],
    brand: 'VagueFlow Tech',
    sku: 'VF-STR-003',
    price: 11000,
    discountPrice: 9500,
    stock: 30,
    status: 'Active',
    ratings: 4.8,
    numOfReviews: 19,
    images: [
      {
        public_id: 'utility_cargo_main',
        url: 'https://images.unsplash.com/photo-1517423568366-8b83523034fd?auto=format&fit=crop&w=800&q=80'
      }
    ],
    variants: [
      { size: 'S', color: 'Military Khaki', stock: 10, priceDifference: 0 },
      { size: 'M', color: 'Military Khaki', stock: 12, priceDifference: 0 },
      { size: 'L', color: 'Military Khaki', stock: 8, priceDifference: 0 }
    ],
    user: userId
  },

  // --- MINIMALIST BASICS ---
  {
    name: 'Fine Gauge Merino Wool Knit Sweater',
    slug: 'fine-gauge-merino-wool-knit-sweater',
    description: 'Knitted from ultra-fine 19.5 micron Australian Merino Wool, offering exceptional temperature regulation, silk-like softness, and resistance to pilling. Features structured fashioning marks at the shoulders, a subtle ribbed mock collar, and a modern relaxed drape that rests clean at the waist.',
    category: categoryMap['Minimalist Basics'],
    brand: 'VagueFlow Studio',
    sku: 'VF-BAS-001',
    price: 9800,
    discountPrice: 8500,
    stock: 35,
    status: 'Active',
    ratings: 4.9,
    numOfReviews: 14,
    images: [
      {
        public_id: 'merino_knit_main',
        url: 'https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?auto=format&fit=crop&w=800&q=80'
      }
    ],
    variants: [
      { size: 'S', color: 'Oatmeal Melange', stock: 10, priceDifference: 0 },
      { size: 'M', color: 'Oatmeal Melange', stock: 15, priceDifference: 0 },
      { size: 'L', color: 'Oatmeal Melange', stock: 10, priceDifference: 0 }
    ],
    user: userId
  },
  {
    name: 'Architectural Pleated Tailored Pants',
    slug: 'architectural-pleated-tailored-pants',
    description: 'Expertly engineered with crisp, double-front pleats that retain their structure. Crafted from a high-density, wrinkle-resistant gabardine drape. Cut with an elegant wide-leg fit that tapers slightly towards the hem. Finished with a clean hook-and-bar waist closure and adjustable internal side tabs for the perfect fit.',
    category: categoryMap['Minimalist Basics'],
    brand: 'VagueFlow Studio',
    sku: 'VF-BAS-002',
    price: 12500,
    discountPrice: 10800,
    stock: 22,
    status: 'Active',
    ratings: 4.8,
    numOfReviews: 11,
    images: [
      {
        public_id: 'pleated_pants_main',
        url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80'
      }
    ],
    variants: [
      { size: 'S', color: 'Dark Slate', stock: 6, priceDifference: 0 },
      { size: 'M', color: 'Dark Slate', stock: 10, priceDifference: 0 },
      { size: 'L', color: 'Dark Slate', stock: 6, priceDifference: 0 }
    ],
    user: userId
  },
  {
    name: 'Organic Waffle Knit Crewneck',
    slug: 'organic-waffle-knit-crewneck',
    description: 'Crafted from heavy 100% organic cotton waffle knit fabric, designed to lock in heat while providing an athletic, structured look. Features flatlock stitched seams for zero chafing, a heavy-duty ribbed crewneck collar, and tailored sleeve cuffs that stay put.',
    category: categoryMap['Minimalist Basics'],
    brand: 'VagueFlow Basics',
    sku: 'VF-BAS-003',
    price: 6500,
    discountPrice: 5200,
    stock: 40,
    status: 'Active',
    ratings: 4.7,
    numOfReviews: 23,
    images: [
      {
        public_id: 'waffle_crewneck_main',
        url: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=800&q=80'
      }
    ],
    variants: [
      { size: 'S', color: 'Off-White', stock: 12, priceDifference: 0 },
      { size: 'M', color: 'Off-White', stock: 18, priceDifference: 0 },
      { size: 'L', color: 'Off-White', stock: 10, priceDifference: 0 }
    ],
    user: userId
  },

  // --- ACCESSORIES ---
  {
    name: 'Sculpted Acetate D-Frame Sunglasses',
    slug: 'sculpted-acetate-d-frame-sunglasses',
    description: 'Sophisticated unisex eyewear sculpted from premium, lightweight Italian cellulose acetate. Features robust, hand-polished thick D-frames with a beautiful glossy finish, dark grey polarized CR-39 lenses offering 100% UVA/UVB protection, and heavy five-barrel hinges finished with custom silver metal hardware.',
    category: categoryMap['Accessories'],
    brand: 'VagueFlow Opticals',
    sku: 'VF-ACC-001',
    price: 8800,
    discountPrice: 7500,
    stock: 50,
    status: 'Active',
    ratings: 4.9,
    numOfReviews: 29,
    images: [
      {
        public_id: 'acetate_sunglasses_main',
        url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80'
      }
    ],
    variants: [
      { size: 'One Size', color: 'Gloss Amber', stock: 50, priceDifference: 0 }
    ],
    user: userId
  },
  {
    name: 'Matte Cordura Tech Organizer Pouch',
    slug: 'matte-cordura-tech-organizer-pouch',
    description: 'Constructed from bulletproof 1000D water-repellent Cordura nylon, designed to house all of your premium EDC gears. Features a clamshell-opening design, custom structured mesh compartments inside, a padded tablet sleeve, YKK Aquaguard waterproof zippers, and a removable padded nylon sling strap for cross-body wear.',
    category: categoryMap['Accessories'],
    brand: 'VagueFlow Carry',
    sku: 'VF-ACC-002',
    price: 5500,
    discountPrice: 4800,
    stock: 30,
    status: 'Active',
    ratings: 4.8,
    numOfReviews: 17,
    images: [
      {
        public_id: 'tech_pouch_main',
        url: 'https://images.unsplash.com/photo-1622560480654-d96214fdc887?auto=format&fit=crop&w=800&q=80'
      }
    ],
    variants: [
      { size: 'One Size', color: 'Tactical Black', stock: 30, priceDifference: 0 }
    ],
    user: userId
  },
  {
    name: 'Industrial Heavy Duty Utility Belt',
    slug: 'industrial-heavy-duty-utility-belt',
    description: 'An essential styling accessory constructed from durable high-tensile nylon webbing. Fitted with an iconic quick-release heavy-duty metal buckle in a matte black finish. Features laser-etched VagueFlow branding and adjustable loop locks to fit any waist sizes from 28" to 42".',
    category: categoryMap['Accessories'],
    brand: 'VagueFlow Carry',
    sku: 'VF-ACC-003',
    price: 3200,
    discountPrice: 2800,
    stock: 60,
    status: 'Active',
    ratings: 4.7,
    numOfReviews: 31,
    images: [
      {
        public_id: 'utility_belt_main',
        url: 'https://images.unsplash.com/photo-1624222247344-550fb8ecf7db?auto=format&fit=crop&w=800&q=80'
      }
    ],
    variants: [
      { size: 'One Size', color: 'Stealth Black', stock: 60, priceDifference: 0 }
    ],
    user: userId
  }
];

const seedDatabase = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Database connected successfully!');

    // 1. Ensure the default Admin user admin@vagueflow.com exists with password123 and role admin
    console.log('Seeding default Admin user...');
    let adminUser = await User.findOne({ email: 'admin@vagueflow.com' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'VagueFlow Admin',
        email: 'admin@vagueflow.com',
        password: 'password123', // Will be hashed via pre-save hook
        phone: '9876543210',
        role: 'admin',
        emailVerified: true
      });
      console.log('Admin user created successfully: admin@vagueflow.com / password123');
    } else {
      adminUser.role = 'admin';
      adminUser.password = 'password123'; // Overwrite password to make sure it's correct
      await adminUser.save();
      console.log('Admin user verified: admin@vagueflow.com / password123');
    }

    // 2. Clear Categories and Products
    console.log('Clearing existing products...');
    await Product.deleteMany({});
    console.log('Clearing existing categories...');
    await Category.deleteMany({});

    // 3. Seed Categories
    console.log('Seeding categories...');
    const seededCategories = await Category.insertMany(categoriesData);
    console.log(`Seeded ${seededCategories.length} categories.`);

    // Map category name to ID
    const categoryMap = {};
    seededCategories.forEach((cat) => {
      categoryMap[cat.name] = cat._id;
    });

    // 4. Seed Products
    console.log('Seeding products...');
    const productsData = getProductsData(categoryMap, adminUser._id);
    const seededProducts = await Product.insertMany(productsData);
    console.log(`Seeded ${seededProducts.length} products successfully!`);

    console.log('Database Seeding Complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
