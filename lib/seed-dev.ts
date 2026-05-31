import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { RestaurantModel } from './models/Restaurant'
import { CategoryModel } from './models/Category'
import { MenuItemModel } from './models/MenuItem'
import { UserModel } from './models/User'

export async function seedDev() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI!)
  }

  // ── Superadmin user ──────────────────────────────────────────────
  const superEmail = process.env.SUPERADMIN_EMAIL ?? 'admin@auramenu.com'
  const superPass  = process.env.SUPERADMIN_PASSWORD ?? 'AuraMenu2025!'

  let superadmin = await UserModel.findOne({ email: superEmail })
  if (!superadmin) {
    superadmin = await UserModel.create({
      name:         'AuraMenu Admin',
      email:        superEmail,
      passwordHash: await bcrypt.hash(superPass, 12),
      role:         'superadmin',
    })
    console.log('[AuraMenu] Superadmin created:', superEmail, '/', superPass)
  }

  // ── Demo owner (shown on landing page — limited to demo restaurant) ──
  const DEMO_EMAIL = 'demo@auramenu.com'
  const DEMO_PASS  = 'Demo2025!'
  let demoUser = await UserModel.findOne({ email: DEMO_EMAIL })
  if (!demoUser) {
    demoUser = await UserModel.create({
      name:         'Demo Admin',
      email:        DEMO_EMAIL,
      passwordHash: await bcrypt.hash(DEMO_PASS, 12),
      role:         'owner',
    })
    console.log('[AuraMenu] Demo owner created:', DEMO_EMAIL, '/', DEMO_PASS)
  }

  // ── Wipe existing seed data ──────────────────────────────────────
  const existing = await RestaurantModel.findOne({ slug: 'noir-brasserie' })
  if (existing) {
    await Promise.all([
      CategoryModel.deleteMany({ restaurantId: existing._id }),
      MenuItemModel.deleteMany({ restaurantId: existing._id }),
      RestaurantModel.deleteOne({ _id: existing._id }),
    ])
  }

  // ── Restaurant ───────────────────────────────────────────────────
  const restaurant = await RestaurantModel.create({
    name:    'Noir Brasserie',
    slug:    'noir-brasserie',
    ownerId: demoUser._id,
    logo_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&h=200&fit=crop',
    description: 'A temple of fine French cuisine in the heart of the city.',
    theme_config: {
      accent_color:      '#D4AF37',
      accent_foreground: '#000000',
      background:        '#000000',
      surface:           'rgba(255,255,255,0.04)',
      border_color:      'rgba(255,255,255,0.08)',
      font_display:      'Playfair Display',
      font_sans:         'Inter',
    },
  })

  // ── Categories ───────────────────────────────────────────────────
  const cats = await CategoryModel.insertMany([
    { restaurantId: restaurant._id, name: 'Amuse-Bouche', name_ka: 'ამუს-ბუშ',   slug: 'amuse-bouche', icon: '✨', sort_order: 1 },
    { restaurantId: restaurant._id, name: 'Raw Bar',       name_ka: 'ნედლი ბარი', slug: 'raw-bar',       icon: '🦪', sort_order: 2 },
    { restaurantId: restaurant._id, name: 'Entrées',       name_ka: 'სტარტერები', slug: 'entrees',       icon: '🍃', sort_order: 3 },
    { restaurantId: restaurant._id, name: 'Mains',         name_ka: 'მთავარი',    slug: 'mains',         icon: '🍽', sort_order: 4 },
    { restaurantId: restaurant._id, name: 'Desserts',      name_ka: 'დესერტები',  slug: 'desserts',      icon: '🍮', sort_order: 5 },
    { restaurantId: restaurant._id, name: 'Cocktails',     name_ka: 'კოქტეილები', slug: 'cocktails',     icon: '🍸', sort_order: 6 },
  ])
  void cats // suppress unused warning

  // ── Menu items ───────────────────────────────────────────────────
  const rid = restaurant._id

  await MenuItemModel.insertMany([
    // ── Amuse-Bouche ────────────────────────────────────────────────
    {
      restaurantId: rid, categorySlug: 'amuse-bouche',
      name: 'Wagyu Tartare Blini', name_ka: 'ვაგიუ ტარტარ ბლინი',
      description: 'A5 wagyu tartare, Osetra caviar, crème fraîche, chive, on buckwheat blini.',
      description_ka: 'A5 ვაგიუ ტარტარი, ოსეტრის ხიზილალა, კრემ ფრეში, ბლინი.',
      price: 28, currency: 'GEL',
      image_url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&h=600&fit=crop',
      allergens: ['dairy', 'eggs', 'gluten'], dietary_tags: [],
      is_featured: true, sort_order: 1,
      paired_items: [{ name: 'Pol Roger Blanc de Blancs', type: 'wine', description: 'Champagne lifts the brininess of the caviar.' }],
    },
    {
      restaurantId: rid, categorySlug: 'amuse-bouche',
      name: 'Black Truffle Arancini', name_ka: 'შავი ტრიუფელის არანჩინი',
      description: 'Carnaroli risotto croquettes, black Périgord truffle, aged Parmigiano fondue.',
      description_ka: 'კარნაროლის რიზოტოს კროკეტი, შავი ტრიუფელი, პარმეზანი.',
      price: 22, currency: 'GEL',
      image_url: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=800&h=600&fit=crop',
      allergens: ['dairy', 'gluten', 'eggs'], dietary_tags: ['vegetarian'],
      is_featured: false, sort_order: 2,
      paired_items: [{ name: 'Barolo Chinato', type: 'wine', description: 'Earthy bitterness mirrors the truffle depth.' }],
    },

    // ── Raw Bar ─────────────────────────────────────────────────────
    {
      restaurantId: rid, categorySlug: 'raw-bar',
      name: 'Oysters Rockefeller', name_ka: 'ოსტრები როკფელერი',
      description: 'Pacific oysters, wilted spinach, Pernod hollandaise, fennel pollen, crispy pancetta.',
      description_ka: 'წყნარი ოკეანის ოსტრები, ისპანახი, ჰოლანდეზი, ბეკონი.',
      price: 36, currency: 'GEL',
      image_url: 'https://images.unsplash.com/photo-1558619795-6b1aecade34b?w=800&h=600&fit=crop',
      allergens: ['dairy', 'eggs', 'seafood'], dietary_tags: ['gluten-free'],
      is_featured: true, sort_order: 1,
      paired_items: [{ name: 'Domaine Vacheron Sancerre', type: 'wine', description: 'Crisp minerality cuts through the richness.' }],
    },
    {
      restaurantId: rid, categorySlug: 'raw-bar',
      name: 'Alaskan King Crab Cocktail', name_ka: 'ალასკური კიბო კოქტეილი',
      description: 'Whole king crab claw, house cocktail sauce, avocado mousse, micro herbs, lemon gel.',
      description_ka: 'სამეფო კიბოს კლანჭი, ავოკადოს მუსი, ლიმონის ჟელე.',
      price: 68, currency: 'GEL',
      image_url: 'https://images.unsplash.com/photo-1559742811-822873691df8?w=800&h=600&fit=crop',
      allergens: ['seafood'], dietary_tags: ['gluten-free', 'dairy-free'],
      is_featured: false, sort_order: 2,
      paired_items: [{ name: 'Puligny-Montrachet Premier Cru', type: 'wine', description: 'Butter and oak harmonize with sweet crab.' }],
    },

    // ── Entrées ─────────────────────────────────────────────────────
    {
      restaurantId: rid, categorySlug: 'entrees',
      name: 'Foie Gras Torchon', name_ka: 'ფუა გრა ტორშონი',
      description: 'Duck liver, brioche perdu, Agen prune chutney, Sauternes gelée, toasted pistachio.',
      description_ka: 'იხვის ღვიძლი, ბრიოში, ქლიავის ჩათნი, სოტერნის ჟელე.',
      price: 52, currency: 'GEL',
      image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop',
      allergens: ['gluten', 'dairy', 'eggs', 'nuts'], dietary_tags: [],
      is_featured: true, sort_order: 1,
      paired_items: [{ name: "Château d'Yquem 2016", type: 'wine', description: 'Honeyed botrytis mirrors the richness.' }],
    },
    {
      restaurantId: rid, categorySlug: 'entrees',
      name: 'Burrata Royale', name_ka: 'ბურატა როიალი',
      description: 'Italian burrata, black truffle honey, compressed watermelon, micro basil, 25yr aged balsamic.',
      description_ka: 'იტალიური ბურატა, ტრიუფელის თაფლი, კომბოსტო, ბალზამიკი.',
      price: 34, currency: 'GEL',
      image_url: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=800&h=600&fit=crop',
      allergens: ['dairy'], dietary_tags: ['vegetarian', 'gluten-free'],
      is_featured: false, sort_order: 2,
      paired_items: [{ name: 'La Scolca Gavi dei Gavi', type: 'wine', description: 'Delicate floral notes match the burrata creaminess.' }],
    },

    // ── Mains ───────────────────────────────────────────────────────
    {
      restaurantId: rid, categorySlug: 'mains',
      name: 'A5 Wagyu Striploin', name_ka: 'A5 ვაგიუ სტრიპლოინი',
      description: '200g Japanese A5 wagyu, bone marrow butter, truffle jus, charred leek, pomme dauphine.',
      description_ka: '200გ A5 ვაგიუ, ძვლის ტვინის კარაქი, ტრიუფელის ჟუ.',
      price: 185, currency: 'GEL',
      image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
      allergens: ['dairy', 'gluten'], dietary_tags: ['gluten-free'],
      is_featured: true, sort_order: 1,
      paired_items: [
        { name: 'Château Pétrus 2015', type: 'wine', description: 'Rich merlot for the richest beef.' },
        { name: 'Dalmore 18yr Scotch', type: 'spirit', description: 'Sherry wood and vanilla complement the marbling.' },
      ],
    },
    {
      restaurantId: rid, categorySlug: 'mains',
      name: 'Maine Lobster Thermidor', name_ka: 'მეინის ომარი თერმიდორი',
      description: 'Half live Maine lobster, tarragon cognac cream, Comté gratin, pommes frites.',
      description_ka: 'ნახევარი ომარი, ტარხუნის კონიაკის კრემი, კომტე გრატინი.',
      price: 145, currency: 'GEL',
      image_url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=600&fit=crop',
      allergens: ['dairy', 'seafood', 'eggs'], dietary_tags: ['gluten-free'],
      is_featured: false, sort_order: 2,
      paired_items: [{ name: 'Chassagne-Montrachet 1er Cru', type: 'wine', description: 'White Burgundy is the soul mate of lobster thermidor.' }],
    },
    {
      restaurantId: rid, categorySlug: 'mains',
      name: 'Canard Confit', name_ka: 'კანარ კონფი',
      description: 'Slow-cooked duck leg, tart cherry jus, celery root purée, braised lentils, crispy duck skin.',
      description_ka: 'ნელა მოხარშული იხვის ფეხი, ალუბლის ჟუ, ოხრახუშის პიურე.',
      price: 95, currency: 'GEL',
      image_url: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=800&h=600&fit=crop',
      allergens: ['dairy'], dietary_tags: ['gluten-free', 'dairy-free'],
      is_featured: false, sort_order: 3,
      paired_items: [{ name: 'Domaine Drouhin Oregon Pinot Noir', type: 'wine', description: "Oregon Pinot's cherry fruit echoes the jus." }],
    },
    {
      restaurantId: rid, categorySlug: 'mains',
      name: 'Black Truffle Risotto', name_ka: 'შავი ტრიუფელის რიზოტო',
      description: 'Carnaroli rice, aged Parmigiano, 30g shaved black truffle, chive oil, gold leaf.',
      description_ka: 'კარნაროლის ბრინჯი, პარმეზანი, 30გ შავი ტრიუფელი, ოქროს ფოთოლი.',
      price: 78, currency: 'GEL',
      image_url: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800&h=600&fit=crop',
      allergens: ['dairy'], dietary_tags: ['vegetarian', 'gluten-free'],
      is_featured: false, sort_order: 4,
      paired_items: [{ name: 'Barolo Brunate 2018', type: 'wine', description: "Nebbiolo's earthiness is a natural match for truffle." }],
    },

    // ── Desserts ────────────────────────────────────────────────────
    {
      restaurantId: rid, categorySlug: 'desserts',
      name: 'Valrhona Chocolate Soufflé', name_ka: 'ვალრონას შოკოლადის სუფლე',
      description: 'Warm Valrhona Guanaja soufflé, Tahitian vanilla crème anglaise, cocoa nib tuile.',
      description_ka: 'თბილი ვალრონას სუფლე, ვანილის კრემ ანგლეზი, კაკაოს ტუილე.',
      price: 28, currency: 'GEL',
      image_url: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&h=600&fit=crop',
      allergens: ['dairy', 'eggs', 'gluten'], dietary_tags: ['vegetarian'],
      is_featured: true, sort_order: 1,
      paired_items: [{ name: 'Mas Amiel Banyuls', type: 'wine', description: 'Sweet fortified wine amplifies the dark chocolate intensity.' }],
    },
    {
      restaurantId: rid, categorySlug: 'desserts',
      name: 'Crème Brûlée Royale', name_ka: 'კრემ ბრიულე როიალი',
      description: 'Tahitian vanilla bean custard, caramelized crust, wild strawberry, micro mint, gold dust.',
      description_ka: 'ტაიტის ვანილის კრემი, კარამელიზებული ქერქი, ველური მარწყვი.',
      price: 22, currency: 'GEL',
      image_url: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=800&h=600&fit=crop',
      allergens: ['dairy', 'eggs'], dietary_tags: ['vegetarian', 'gluten-free'],
      is_featured: false, sort_order: 2,
      paired_items: [{ name: "Château d'Yquem", type: 'wine', description: 'The definitive dessert wine for the definitive dessert.' }],
    },

    // ── Cocktails ───────────────────────────────────────────────────
    {
      restaurantId: rid, categorySlug: 'cocktails',
      name: 'The Black Diamond', name_ka: 'შავი ბრილიანტი',
      description: 'Hennessy XO, black truffle-infused dry vermouth, Lillet Noir, 3 drops truffle oil.',
      description_ka: 'ჰენეზი XO, შავი ტრიუფელის ვერმუტი, ლილე ნუარი.',
      price: 38, currency: 'GEL',
      image_url: 'https://images.unsplash.com/photo-1546171753-97d7676e4602?w=800&h=600&fit=crop',
      allergens: [], dietary_tags: ['vegan', 'gluten-free', 'dairy-free'],
      is_featured: true, sort_order: 1,
      paired_items: [{ name: 'Oysters Rockefeller', type: 'dish', description: 'The umami depth bridges ocean and earth.' }],
    },
    {
      restaurantId: rid, categorySlug: 'cocktails',
      name: 'Negroni Noir', name_ka: 'ნეგრონი ნუარი',
      description: 'Tanqueray No. TEN gin, Campari, 18-month barrel-aged sweet vermouth, dehydrated orange.',
      description_ka: 'ტანკერეი ჯინი, კამპარი, 18-თვიანი ვერმუტი, გამხმარი ფორთოხალი.',
      price: 24, currency: 'GEL',
      image_url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&h=600&fit=crop',
      allergens: [], dietary_tags: ['vegan', 'gluten-free', 'dairy-free'],
      is_featured: false, sort_order: 2,
      paired_items: [{ name: 'Burrata Royale', type: 'dish', description: 'Herbal bitterness cuts through the cream beautifully.' }],
    },
    {
      restaurantId: rid, categorySlug: 'cocktails',
      name: 'Smoked Rosemary Sour', name_ka: 'მოწვეული როზმარინის სოური',
      description: 'Woodford Reserve bourbon, fresh lemon, honey syrup, egg white foam, live rosemary smoke.',
      description_ka: 'ვუდფორდის ბურბონი, ლიმონი, თაფლი, კვერცხის ცილა, როზმარინის კვამლი.',
      price: 26, currency: 'GEL',
      image_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&h=600&fit=crop',
      allergens: ['eggs'], dietary_tags: ['gluten-free', 'dairy-free'],
      is_featured: false, sort_order: 3,
      paired_items: [{ name: 'Canard Confit', type: 'dish', description: 'Smoke and cherry interplay with the bourbon.' }],
    },
  ])
}
