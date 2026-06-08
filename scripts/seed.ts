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

// Real, product-matched photos. LoremFlickr returns an actual photo for the
// given tag(s); `lock` pins a specific photo so the image is stable per seed.
const img = (tag: string, lock: number) => `https://loremflickr.com/600/600/${tag}?lock=${lock}`;

const CATEGORIES = ["Electronics", "Apparel", "Home & Kitchen", "Books"];

const PRODUCTS: { title: string; category: string; price: number; stock: number; description: string; tag: string }[] = [
  // Electronics
  { title: "Wireless Noise-Cancelling Headphones", category: "Electronics", price: 24999, stock: 40, description: "Immersive sound with 30-hour battery life and adaptive noise cancellation.", tag: "headphones" },
  { title: "Mechanical Keyboard (Hot-swappable)", category: "Electronics", price: 12900, stock: 60, description: "Tactile typing with per-key RGB and a CNC aluminium frame.", tag: "mechanical,keyboard" },
  { title: "4K Webcam", category: "Electronics", price: 8900, stock: 25, description: "Crystal-clear video calls with auto light correction.", tag: "webcam" },
  { title: "Smartwatch Series X", category: "Electronics", price: 19900, stock: 0, description: "Track fitness, sleep, and notifications on a vivid OLED display.", tag: "smartwatch" },
  { title: "Portable Bluetooth Speaker", category: "Electronics", price: 5900, stock: 75, description: "Room-filling 360° sound that's waterproof and pocket-ready.", tag: "speaker" },
  { title: "Ergonomic Wireless Mouse", category: "Electronics", price: 4900, stock: 90, description: "Silent clicks, precision tracking, and a 6-month battery.", tag: "mouse" },
  { title: "7-in-1 USB-C Hub", category: "Electronics", price: 5400, stock: 65, description: "Expand one port into HDMI, USB-A, SD, and 100W passthrough.", tag: "usb,hub" },
  { title: "Portable SSD 1TB", category: "Electronics", price: 13900, stock: 50, description: "Pocketable, shock-resistant storage with 1050MB/s transfers.", tag: "ssd,drive" },
  { title: "Noise-Isolating Earbuds", category: "Electronics", price: 9900, stock: 80, description: "Crisp wireless audio with a compact charging case.", tag: "earbuds" },
  { title: "27\" QHD Gaming Monitor", category: "Electronics", price: 29900, stock: 22, description: "165Hz refresh, 1ms response, and vivid color accuracy.", tag: "monitor" },
  { title: "4K Camera Drone", category: "Electronics", price: 49900, stock: 12, description: "Cinematic aerial footage with 30-minute flight time.", tag: "drone" },
  { title: "E-Reader Paperwhite", category: "Electronics", price: 13900, stock: 40, description: "Glare-free 300ppi display that holds thousands of books.", tag: "ebook,reader" },

  // Apparel
  { title: "Organic Cotton T-Shirt", category: "Apparel", price: 2999, stock: 120, description: "Soft, breathable, and sustainably made everyday tee.", tag: "tshirt" },
  { title: "Merino Wool Sweater", category: "Apparel", price: 8900, stock: 35, description: "Lightweight warmth with naturally odor-resistant merino wool.", tag: "sweater" },
  { title: "Running Shoes Pro", category: "Apparel", price: 11900, stock: 50, description: "Responsive cushioning built for long-distance comfort.", tag: "sneakers,running" },
  { title: "Classic Denim Jacket", category: "Apparel", price: 7900, stock: 45, description: "A rugged, timeless layer that only gets better with age.", tag: "denim,jacket" },
  { title: "Full-Grain Leather Belt", category: "Apparel", price: 3900, stock: 70, description: "Hand-finished leather with a solid brushed-metal buckle.", tag: "belt" },
  { title: "Ribbed Wool Beanie", category: "Apparel", price: 2400, stock: 110, description: "Cozy, stretchy, and warm for cold-weather days.", tag: "beanie" },
  { title: "Slim-Fit Chino Trousers", category: "Apparel", price: 5900, stock: 60, description: "Versatile stretch-cotton chinos that go office-to-weekend.", tag: "trousers" },
  { title: "Canvas Everyday Backpack", category: "Apparel", price: 6900, stock: 55, description: "Water-resistant canvas with a padded 16\" laptop sleeve.", tag: "backpack" },
  { title: "Polarized Sunglasses", category: "Apparel", price: 4500, stock: 85, description: "UV400 polarized lenses in a lightweight acetate frame.", tag: "sunglasses" },
  { title: "Heavyweight Hoodie", category: "Apparel", price: 6400, stock: 65, description: "Brushed fleece interior with a relaxed, structured fit.", tag: "hoodie" },

  // Home & Kitchen
  { title: "Stainless Steel Cookware Set", category: "Home & Kitchen", price: 17900, stock: 20, description: "10-piece tri-ply set, oven-safe and dishwasher friendly.", tag: "cookware,pots" },
  { title: "Pour-Over Coffee Maker", category: "Home & Kitchen", price: 4500, stock: 80, description: "Barista-quality pour-over in a beautiful borosilicate carafe.", tag: "coffee,maker" },
  { title: "Ceramic Knife Block Set", category: "Home & Kitchen", price: 6900, stock: 30, description: "Ultra-sharp ceramic blades that stay sharp 10× longer than steel.", tag: "kitchen,knife" },
  { title: "Pre-Seasoned Cast Iron Skillet", category: "Home & Kitchen", price: 3900, stock: 95, description: "Naturally non-stick and built to last for generations.", tag: "skillet" },
  { title: "Gooseneck Electric Kettle", category: "Home & Kitchen", price: 5900, stock: 60, description: "Precise pour and variable temperature control in 60 seconds.", tag: "kettle" },
  { title: "High-Speed Countertop Blender", category: "Home & Kitchen", price: 9900, stock: 40, description: "Pulverizes smoothies, soups, and nut butters with ease.", tag: "blender" },
  { title: "16-Piece Dinnerware Set", category: "Home & Kitchen", price: 8900, stock: 35, description: "Chip-resistant stoneware service for four.", tag: "plates,dinnerware" },
  { title: "Soy Wax Scented Candle", category: "Home & Kitchen", price: 2900, stock: 130, description: "Hand-poured with a 50-hour clean burn and warm cedar notes.", tag: "candle" },
  { title: "Turkish Cotton Bath Towel Set", category: "Home & Kitchen", price: 5400, stock: 70, description: "Plush, quick-drying, and softer with every wash.", tag: "towels" },
  { title: "HEPA Air Purifier", category: "Home & Kitchen", price: 12900, stock: 28, description: "Captures 99.97% of dust, pollen, and allergens.", tag: "air,purifier" },

  // Books
  { title: "The Pragmatic Programmer", category: "Books", price: 3999, stock: 200, description: "The classic guide to your journey to mastery in software.", tag: "book" },
  { title: "Designing Data-Intensive Applications", category: "Books", price: 4599, stock: 150, description: "The big ideas behind reliable, scalable, and maintainable systems.", tag: "book,cover" },
  { title: "Clean Code", category: "Books", price: 3799, stock: 180, description: "A handbook of agile software craftsmanship.", tag: "book,desk" },
  { title: "The Mythical Man-Month", category: "Books", price: 3299, stock: 90, description: "Timeless essays on software engineering and project management.", tag: "book,old" },
  { title: "Refactoring", category: "Books", price: 4299, stock: 110, description: "Improving the design of existing code, step by step.", tag: "bookshelf" },
  { title: "Sapiens: A Brief History of Humankind", category: "Books", price: 2899, stock: 160, description: "A sweeping exploration of how humans came to rule the world.", tag: "novel" },
  { title: "Atomic Habits", category: "Books", price: 2699, stock: 220, description: "An easy and proven way to build good habits and break bad ones.", tag: "library,book" },
  { title: "The Lean Startup", category: "Books", price: 3199, stock: 140, description: "How today's entrepreneurs use continuous innovation.", tag: "book,reading" },
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
    PRODUCTS.map((p, i) => ({
      title: p.title,
      slug: slugify(p.title),
      description: p.description,
      price: p.price,
      stock: p.stock,
      status: "active",
      categoryId: catBySlug.get(p.category),
      images: [img(p.tag, i + 1)],
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
