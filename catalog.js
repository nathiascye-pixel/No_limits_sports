// Product catalog data shared across all pages via window.NLS_CATALOG
(function (global) {
  // List of product categories shown as headings on the Products page
  const CATEGORY_SECTIONS = [
    {
      id: 'hiking-shoes',
      title: 'Hiking Shoes',
      subtitle: "Breathable, high-traction hiking footwear built for men's and women's trails.",
    },
    {
      id: 'jogging-shoes',
      title: 'Jogging Shoes',
      subtitle: "Lightweight, breathable road trainers built for men's and women's daily runs.",
    },
    {
      id: 'sports-gear',
      title: 'Sports Gear',
      subtitle: 'Unisex trail packs, sports duffels, hydration bottles, and breathable hiking caps.',
    },
  ];

  // Complete list of shoes and accessories displayed on the Home and Products pages
  const PRODUCTS = [
  {
    id: 'ridgepro-x1',
    category: 'hiking-shoes',
    gender: 'Men',
    name: 'No Limits RidgePro X1',
    price: 139.9,
    priceFormatted: '139.90',
    line: 'Hiking Shoes',
    colour: 'Obsidian / Cobalt Slate',
    sizes: ['US 8', 'US 9', 'US 10', 'US 11', 'US 12'],
    description:
      'High-traction ripstop trail silhouette with reinforced toe guard and cobalt-accented wet-grip outsole.',
    primaryImage: './img/No_Limits_RidgePro_X1_-_S_139.90__Men__Side_view_a02f286f.jpg',
    secondaryImage: './img/No_Limits_RidgePro_X1_-_S_139.90__Men__Top_view_9546652f.jpg',
  },
  {
    id: 'summit-x1',
    category: 'hiking-shoes',
    gender: 'Men',
    name: 'No Limits Summit X1',
    price: 119.9,
    priceFormatted: '119.90',
    line: 'Hiking Shoes',
    colour: 'Olive Moss / Charcoal',
    sizes: ['US 8', 'US 9', 'US 10', 'US 11', 'US 12'],
    description:
      'Durable suede-panel hiking shoe with speckled EVA cushioning and deep mud-shedding lugs.',
    primaryImage: './img/No_Limits_Summit_X1__Men__-_S_119.90_Side_view_1a8578b5.jpg',
    secondaryImage: './img/No_Limits_Summit_X1__Men__-_S_119.90_Top_view_3024deb9.jpg',
  },
  {
    id: 'sierra-w1',
    category: 'hiking-shoes',
    gender: 'Women',
    name: 'No Limits Sierra W1',
    price: 139.9,
    priceFormatted: '139.90',
    line: 'Hiking Shoes',
    colour: 'Warm Sand / Teal',
    sizes: ['US 6', 'US 7', 'US 8', 'US 9', 'US 10'],
    description:
      'Breathable woven-mesh trail shoe pairing natural earth tones with responsive cushioned support.',
    primaryImage: './img/No_Limits_Sierra_W1__women__-_S_139.90_Side_view_4f2344ae.jpg',
    secondaryImage: './img/No_Limits_Sierra_W1__Women__-_S_139.90_Top_view_c5aec5b5.jpg',
  },
  {
    id: 'alpine-w1',
    category: 'hiking-shoes',
    gender: 'Women',
    name: 'No Limits Alpine W1',
    price: 129.9,
    priceFormatted: '129.90',
    line: 'Hiking Shoes',
    colour: 'Slate Ash / Lilac',
    sizes: ['US 6', 'US 7', 'US 8', 'US 9', 'US 10'],
    description:
      'Lightweight all-terrain hiking shoe with supportive heel lockdown and speckled cushioned midsole.',
    primaryImage: './img/No_Limits_Alpine_W1__Women__-_S_129.90_Side_view_228c4815.jpg',
    secondaryImage: './img/No_Limits_Alpine_W1__Women__-_S_129.90_Top_view_5ff1ffd9.jpg',
  },
  {
    id: 'journey-x1',
    category: 'jogging-shoes',
    gender: 'Men',
    name: 'No Limits Journey X1',
    price: 129.9,
    priceFormatted: '129.90',
    line: 'Jogging Shoes',
    colour: 'Mist Gray / Navy',
    sizes: ['US 8', 'US 9', 'US 10', 'US 11', 'US 12'],
    description:
      'Breathable engineered-knit road runner with sculpted EVA midsole and supportive navy heel collar.',
    primaryImage: './img/No_Limits_Journey_X1__Men__-_S_129.90_Side_view_25b6a732.jpg',
    secondaryImage: './img/No_Limits_Journey_X1__Men__-_S_129.90_Top_view_33c046f4.jpg',
  },
  {
    id: 'motion-x1',
    category: 'jogging-shoes',
    gender: 'Men',
    name: 'No Limits Motion X1',
    price: 109.9,
    priceFormatted: '109.90',
    line: 'Jogging Shoes',
    colour: 'Graphite Black / Cobalt',
    sizes: ['US 8', 'US 9', 'US 10', 'US 11', 'US 12'],
    description:
      'Lightweight daily jogger combining open-cell ventilation mesh with cushioned heel rebound.',
    primaryImage: './img/No_Limits_Motion_X1__Men__-_S_109.90_Side_view_4db2e911.jpg',
    secondaryImage: './img/No_Limits_Motion_X1__Men__-_S_109.90_Top_view_c6940463.jpg',
  },
  {
    id: 'glide-w1',
    category: 'jogging-shoes',
    gender: 'Women',
    name: 'No Limits Glide W1',
    price: 129.9,
    priceFormatted: '129.90',
    line: 'Jogging Shoes',
    colour: 'Ivory / Champagne',
    sizes: ['US 6', 'US 7', 'US 8', 'US 9', 'US 10'],
    description:
      'Featherweight road trainer with soft breathable knit upper and high-stack cushioned outsole.',
    primaryImage: './img/No_Limits_Glide_W1__Women__-_S_129.90_Side_view_2632f1a4.jpg',
    secondaryImage: './img/No_Limits_Glide_W1__Women__-_S_129.90_Top_view_b4977cd3.jpg',
  },
  {
    id: 'flow-w1',
    category: 'jogging-shoes',
    gender: 'Women',
    name: 'No Limits Flow W1',
    price: 109.9,
    priceFormatted: '109.90',
    line: 'Jogging Shoes',
    colour: 'Blush Rose / Dove Gray',
    sizes: ['US 6', 'US 7', 'US 8', 'US 9', 'US 10'],
    description:
      'Airy mesh jogging shoe designed for humid daily runs with balanced forefoot flexibility.',
    primaryImage: './img/No_Limits_Flow_W1__Women__-_S_109.90_Side_view_042c4379.jpg',
    secondaryImage: './img/No_Limits_Flow_W1__Women__-_S_109.90_Top_view_1f80b662.jpg',
  },
  {
    id: 'trailpack-25l',
    category: 'sports-gear',
    gender: 'Unisex',
    name: 'No Limits TrailPack 25L',
    price: 89.9,
    priceFormatted: '89.90',
    line: 'Sports Gear',
    colour: 'Charcoal / Olive Moss',
    sizes: ['25L (One Size)'],
    description:
      'Weather-resistant 25L hiking daypack featuring front bungee storage, ventilated mesh harness, and dual bottle sleeves.',
    primaryImage: './img/No_Limits_TrailPack_25L_-_Hiking_Backpack_bda26c87.jpg',
    secondaryImage: '',
  },
  {
    id: 'activepack-duffel',
    category: 'sports-gear',
    gender: 'Unisex',
    name: 'No Limits ActivePack Duffel',
    price: 79.9,
    priceFormatted: '79.90',
    line: 'Sports Gear',
    colour: 'Obsidian / Cobalt Blue',
    sizes: ['35L (One Size)'],
    description:
      'Ripstop training duffel with ventilated shoe compartment, padded shoulder strap, and quick-access zip pockets.',
    primaryImage: './img/No_Limits_ActivePack_-_Sports_Duffel_Bag_bc3fd767.jpg',
    secondaryImage: '',
  },
  {
    id: 'motion-bottle-750ml',
    category: 'sports-gear',
    gender: 'Unisex',
    name: 'No Limits Motion Bottle 750ml',
    price: 39.9,
    priceFormatted: '39.90',
    line: 'Sports Gear',
    colour: 'Matte Black / Cobalt',
    sizes: ['750ml'],
    description:
      'Insulated 750ml sports hydration flask with textured grip panels, one-hand locking flip lid, and carry loop.',
    primaryImage: './img/No_Limits_Motion_Bottle_750ml_-_Sports_Water_Bottle_dc92d54f.jpg',
    secondaryImage: '',
  },
  {
    id: 'summit-cap',
    category: 'sports-gear',
    gender: 'Unisex',
    name: 'No Limits Summit Cap',
    price: 29.9,
    priceFormatted: '29.90',
    line: 'Sports Gear',
    colour: 'Charcoal Ripstop / Olive',
    sizes: ['One Size (Adjustable)'],
    description:
      'Ultralight ripstop hiking cap with laser-perforated side airflow panels and moisture-wicking sweatband.',
    primaryImage: './img/No_Limits_Summit_Cap_-_Hiking_Cap_34d2e4e3.jpg',
    secondaryImage: '',
  },
];

  // Fast lookup table so scripts can find any product using its id
  const PRODUCT_MAP = Object.fromEntries(PRODUCTS.map((item) => [item.id, item]));

  // Expose the catalog data on the global window object for other scripts to read
  global.NLS_CATALOG = {
    CATEGORY_SECTIONS,
    PRODUCTS,
    PRODUCT_MAP,
  };
})(window);
