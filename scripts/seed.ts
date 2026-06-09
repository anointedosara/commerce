/**
 * Seed the database with demo data.
 * Run with:  npm run seed
 */
import bcrypt from "bcryptjs";
import { connectDB } from "../src/lib/db";
import { User } from "../src/models/User";
import { Category } from "../src/models/Category";
import { Product } from "../src/models/Product";
import { Review } from "../src/models/Review";
import { Cart } from "../src/models/Cart";
import { Order } from "../src/models/Order";
import { slugify } from "../src/lib/utils";

// Real product photos served from Unsplash's CDN, which stays fast and reliable
// under the many concurrent image requests a product grid makes (unlike free
// keyword image services that rate-limit bursts and drop requests). `image` is
// the Unsplash photo ID for each product.
const img = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&h=800&q=80`;

const CATEGORIES = ["Electronics", "Apparel", "Home & Kitchen", "Books"];

const PRODUCTS: { title: string; category: string; price: number; stock: number; description: string; image: string }[] = [
  // Electronics
  { title: "Wireless Noise-Cancelling Headphones", category: "Electronics", price: 24999, stock: 40, description: "Immersive sound with 30-hour battery life and adaptive noise cancellation.", image: "1505740420928-5e560c06d30e" },
  { title: "Mechanical Keyboard (Hot-swappable)", category: "Electronics", price: 12900, stock: 60, description: "Tactile typing with per-key RGB and a CNC aluminium frame.", image: "1541140532154-b024d705b90a" },
  { title: "4K Webcam", category: "Electronics", price: 8900, stock: 25, description: "Crystal-clear video calls with auto light correction.", image: "1596742578443-7682ef5251cd" },
  { title: "Smartwatch Series X", category: "Electronics", price: 19900, stock: 0, description: "Track fitness, sleep, and notifications on a vivid OLED display.", image: "1523275335684-37898b6baf30" },
  { title: "Portable Bluetooth Speaker", category: "Electronics", price: 5900, stock: 75, description: "Room-filling 360° sound that's waterproof and pocket-ready.", image: "1589003077984-894e133dabab" },
  { title: "Ergonomic Wireless Mouse", category: "Electronics", price: 4900, stock: 90, description: "Silent clicks, precision tracking, and a 6-month battery.", image: "1527814050087-3793815479db" },
  { title: "7-in-1 USB-C Hub", category: "Electronics", price: 5400, stock: 65, description: "Expand one port into HDMI, USB-A, SD, and 100W passthrough.", image: "1625842268584-8f3296236761" },
  { title: "Portable SSD 1TB", category: "Electronics", price: 13900, stock: 50, description: "Pocketable, shock-resistant storage with 1050MB/s transfers.", image: "1531492746076-161ca9bcad58" },
  { title: "Noise-Isolating Earbuds", category: "Electronics", price: 9900, stock: 80, description: "Crisp wireless audio with a compact charging case.", image: "1572569511254-d8f925fe2cbb" },
  { title: "27\" QHD Gaming Monitor", category: "Electronics", price: 29900, stock: 22, description: "165Hz refresh, 1ms response, and vivid color accuracy.", image: "1527443224154-c4a3942d3acf" },
  { title: "4K Camera Drone", category: "Electronics", price: 49900, stock: 12, description: "Cinematic aerial footage with 30-minute flight time.", image: "1473968512647-3e447244af8f" },
  { title: "E-Reader Paperwhite", category: "Electronics", price: 13900, stock: 40, description: "Glare-free 300ppi display that holds thousands of books.", image: "1592434134753-a70baf7979d5" },

  // Apparel
  { title: "Organic Cotton T-Shirt", category: "Apparel", price: 2999, stock: 120, description: "Soft, breathable, and sustainably made everyday tee.", image: "1521572163474-6864f9cf17ab" },
  { title: "Merino Wool Sweater", category: "Apparel", price: 8900, stock: 35, description: "Lightweight warmth with naturally odor-resistant merino wool.", image: "1576566588028-4147f3842f27" },
  { title: "Running Shoes Pro", category: "Apparel", price: 11900, stock: 50, description: "Responsive cushioning built for long-distance comfort.", image: "1542291026-7eec264c27ff" },
  { title: "Classic Denim Jacket", category: "Apparel", price: 7900, stock: 45, description: "A rugged, timeless layer that only gets better with age.", image: "1543076447-215ad9ba6923" },
  { title: "Full-Grain Leather Belt", category: "Apparel", price: 3900, stock: 70, description: "Hand-finished leather with a solid brushed-metal buckle.", image: "1624222247344-550fb60583dc" },
  { title: "Ribbed Wool Beanie", category: "Apparel", price: 2400, stock: 110, description: "Cozy, stretchy, and warm for cold-weather days.", image: "1576871337622-98d48d1cf531" },
  { title: "Slim-Fit Chino Trousers", category: "Apparel", price: 5900, stock: 60, description: "Versatile stretch-cotton chinos that go office-to-weekend.", image: "1473966968600-fa801b869a1a" },
  { title: "Canvas Everyday Backpack", category: "Apparel", price: 6900, stock: 55, description: "Water-resistant canvas with a padded 16\" laptop sleeve.", image: "1553062407-98eeb64c6a62" },
  { title: "Polarized Sunglasses", category: "Apparel", price: 4500, stock: 85, description: "UV400 polarized lenses in a lightweight acetate frame.", image: "1511499767150-a48a237f0083" },
  { title: "Heavyweight Hoodie", category: "Apparel", price: 6400, stock: 65, description: "Brushed fleece interior with a relaxed, structured fit.", image: "1556821840-3a63f95609a7" },

  // Home & Kitchen
  { title: "Stainless Steel Cookware Set", category: "Home & Kitchen", price: 17900, stock: 20, description: "10-piece tri-ply set, oven-safe and dishwasher friendly.", image: "1556910103-1c02745aae4d" },
  { title: "Pour-Over Coffee Maker", category: "Home & Kitchen", price: 4500, stock: 80, description: "Barista-quality pour-over in a beautiful borosilicate carafe.", image: "1495474472287-4d71bcdd2085" },
  { title: "Ceramic Knife Block Set", category: "Home & Kitchen", price: 6900, stock: 30, description: "Ultra-sharp ceramic blades that stay sharp 10× longer than steel.", image: "1593618998160-e34014e67546" },
  { title: "Pre-Seasoned Cast Iron Skillet", category: "Home & Kitchen", price: 3900, stock: 95, description: "Naturally non-stick and built to last for generations.", image: "1544025162-d76694265947" },
  { title: "Gooseneck Electric Kettle", category: "Home & Kitchen", price: 5900, stock: 60, description: "Precise pour and variable temperature control in 60 seconds.", image: "1594213114663-d94db9b17125" },
  { title: "High-Speed Countertop Blender", category: "Home & Kitchen", price: 9900, stock: 40, description: "Pulverizes smoothies, soups, and nut butters with ease.", image: "1570222094114-d054a817e56b" },
  { title: "16-Piece Dinnerware Set", category: "Home & Kitchen", price: 8900, stock: 35, description: "Chip-resistant stoneware service for four.", image: "1565193566173-7a0ee3dbe261" },
  { title: "Soy Wax Scented Candle", category: "Home & Kitchen", price: 2900, stock: 130, description: "Hand-poured with a 50-hour clean burn and warm cedar notes.", image: "1603006905003-be475563bc59" },
  { title: "Turkish Cotton Bath Towel Set", category: "Home & Kitchen", price: 5400, stock: 70, description: "Plush, quick-drying, and softer with every wash.", image: "1620626011761-996317b8d101" },
  { title: "HEPA Air Purifier", category: "Home & Kitchen", price: 12900, stock: 28, description: "Captures 99.97% of dust, pollen, and allergens.", image: "1583947581924-860bda6a26df" },

  // Books
  { title: "The Pragmatic Programmer", category: "Books", price: 3999, stock: 200, description: "The classic guide to your journey to mastery in software.", image: "1544947950-fa07a98d237f" },
  { title: "Designing Data-Intensive Applications", category: "Books", price: 4599, stock: 150, description: "The big ideas behind reliable, scalable, and maintainable systems.", image: "1532012197267-da84d127e765" },
  { title: "Clean Code", category: "Books", price: 3799, stock: 180, description: "A handbook of agile software craftsmanship.", image: "1512820790803-83ca734da794" },
  { title: "The Mythical Man-Month", category: "Books", price: 3299, stock: 90, description: "Timeless essays on software engineering and project management.", image: "1497633762265-9d179a990aa6" },
  { title: "Refactoring", category: "Books", price: 4299, stock: 110, description: "Improving the design of existing code, step by step.", image: "1456513080510-7bf3a84b82f8" },
  { title: "Sapiens: A Brief History of Humankind", category: "Books", price: 2899, stock: 160, description: "A sweeping exploration of how humans came to rule the world.", image: "1481627834876-b7833e8f5570" },
  { title: "Atomic Habits", category: "Books", price: 2699, stock: 220, description: "An easy and proven way to build good habits and break bad ones.", image: "1589998059171-988d887df646" },
  { title: "The Lean Startup", category: "Books", price: 3199, stock: 140, description: "How today's entrepreneurs use continuous innovation.", image: "1507842217343-583bb7270b66" },
];

async function seed() {
  await connectDB();
  console.log("Connected. Clearing existing data…");

  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    Review.deleteMany({}),
    Cart.deleteMany({}),
    Order.deleteMany({}),
  ]);

  // Users
  const [admin, customer] = await User.create([
    { name: "Admin User", email: "admin@example.com", passwordHash: await bcrypt.hash("password123", 10), role: "admin" },
    { name: "Jane Customer", email: "jane@example.com", passwordHash: await bcrypt.hash("password123", 10), role: "customer" },
  ]);
  console.log("Created users: admin@example.com / jane@example.com (password: password123)");

  // Categories
  const cats = await Category.create(
    CATEGORIES.map((name) => ({ name, slug: slugify(name) })),
  );
  const catBySlug = new Map(cats.map((c) => [c.name, c._id]));

  // Products
  const products = await Product.insertMany(
    PRODUCTS.map((p) => ({
      title: p.title,
      slug: slugify(p.title),
      description: p.description,
      price: p.price,
      stock: p.stock,
      status: "active",
      categoryId: catBySlug.get(p.category),
      images: [img(p.image)],
    })),
  );
  console.log(`Created ${products.length} products across ${cats.length} categories.`);

  // A few reviews on the first product — with comments and reactions so the
  // review thread has visible content out of the box.
  const reviewed = products[0];
  await Review.create([
    {
      productId: reviewed._id,
      userId: customer._id,
      userName: customer.name,
      rating: 5,
      body: "Best headphones I've owned. Worth every penny.",
      reactions: [
        { userId: admin._id, emoji: "👍" },
        { userId: customer._id, emoji: "🎉" },
      ],
      comments: [
        {
          userId: admin._id,
          userName: admin.name,
          body: "Totally agree — the noise cancellation is incredible on flights.",
          reactions: [{ userId: customer._id, emoji: "❤️" }],
        },
      ],
    },
    { productId: reviewed._id, userId: admin._id, userName: admin.name, rating: 4, body: "Great sound, slightly tight fit." },
  ]);
  reviewed.ratingAvg = 4.5;
  reviewed.ratingCount = 2;
  await reviewed.save();

  console.log("✅ Seed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
