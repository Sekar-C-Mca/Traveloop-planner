/**
 * seed-world-cities.ts
 * ─────────────────────────────────────────────────────────────
 * Fetches every country + capital from the free RestCountries API
 * (https://restcountries.com) and upserts them into the cities table.
 *
 * Additionally inserts a hand-curated list of ~80 famous non-capital
 * cities (tourist hubs, major metros) so the Explore page has rich data.
 *
 * Run:  npx ts-node-dev --transpile-only src/db/seed-world-cities.ts
 * ─────────────────────────────────────────────────────────────
 */

import { pool, query } from './index';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Map UN sub-region → app region */
function mapRegion(unRegion: string, continent: string): string {
  const r = (unRegion || continent || '').toLowerCase();
  if (r.includes('europe'))               return 'Europe';
  if (r.includes('asia') || r.includes('south-eastern asia') || r.includes('eastern asia') || r.includes('southern asia') || r.includes('central asia') || r.includes('western asia')) return 'Asia';
  if (r.includes('africa'))               return 'Africa';
  if (r.includes('latin') || r.includes('south america') || r.includes('caribbean') || r.includes('central america')) return 'Americas';
  if (r.includes('northern america'))     return 'Americas';
  if (r.includes('oceania') || r.includes('australia') || r.includes('melanesia') || r.includes('polynesia') || r.includes('micronesia')) return 'Oceania';
  return 'Asia'; // fallback
}

/** Rough cost_index based on income group */
function guessCostIndex(gdpPerCapita?: number): number {
  if (!gdpPerCapita) return 4.0;
  if (gdpPerCapita > 40000) return 8.0;
  if (gdpPerCapita > 20000) return 6.5;
  if (gdpPerCapita > 10000) return 5.0;
  if (gdpPerCapita > 5000)  return 3.5;
  if (gdpPerCapita > 2000)  return 2.5;
  return 1.5;
}

/** Rough popularity based on population & area */
function guessPopularity(population?: number): number {
  if (!population) return 50;
  if (population > 100_000_000) return 92;
  if (population > 50_000_000)  return 85;
  if (population > 20_000_000)  return 78;
  if (population > 5_000_000)   return 70;
  if (population > 1_000_000)   return 60;
  return 50;
}

// ---------------------------------------------------------------------------
// Additional famous non-capital cities
// ---------------------------------------------------------------------------

interface ExtraCity {
  name: string; country: string; region: string;
  cost_index: number; popularity_score: number;
  description: string; image_url: string;
  latitude: number; longitude: number;
}

const EXTRA_CITIES: ExtraCity[] = [
  // India
  { name: 'Mumbai',      country: 'India',       region: 'Asia',    cost_index: 4.5, popularity_score: 97, description: 'The City of Dreams — Bollywood, colonial heritage, and the iconic Gateway of India.', image_url: 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=800', latitude: 19.0760, longitude: 72.8777 },
  { name: 'Jaipur',      country: 'India',       region: 'Asia',    cost_index: 3.5, popularity_score: 95, description: 'The Pink City — Rajasthani culture, magnificent forts, and vibrant bazaars.', image_url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800', latitude: 26.9124, longitude: 75.7873 },
  { name: 'Goa',         country: 'India',       region: 'Asia',    cost_index: 4.0, popularity_score: 98, description: 'Beach paradise with golden sands, Portuguese heritage, and vibrant nightlife.', image_url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800', latitude: 15.2993, longitude: 74.1240 },
  { name: 'Varanasi',    country: 'India',       region: 'Asia',    cost_index: 2.0, popularity_score: 88, description: 'Spiritual capital of India on the banks of the sacred Ganges river.', image_url: 'https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=800', latitude: 25.3176, longitude: 82.9739 },
  { name: 'Udaipur',     country: 'India',       region: 'Asia',    cost_index: 3.5, popularity_score: 92, description: 'City of Lakes — India\'s most romantic city with palaces and serene lakes.', image_url: 'https://images.unsplash.com/photo-1568859539571-7e8c9419f7dd?w=800', latitude: 24.5854, longitude: 73.7125 },
  { name: 'Manali',      country: 'India',       region: 'Asia',    cost_index: 2.5, popularity_score: 90, description: 'Mountain retreat nestled in the Himalayas, perfect for adventure and serenity.', image_url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800', latitude: 32.2432, longitude: 77.1892 },
  { name: 'Kolkata',     country: 'India',       region: 'Asia',    cost_index: 3.0, popularity_score: 82, description: 'City of Joy — colonial architecture, vibrant arts, and street food culture.', image_url: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=800', latitude: 22.5726, longitude: 88.3639 },
  { name: 'Agra',        country: 'India',       region: 'Asia',    cost_index: 3.0, popularity_score: 96, description: 'Home to the Taj Mahal — one of the Seven Wonders of the World.', image_url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800', latitude: 27.1767, longitude: 78.0081 },
  { name: 'Rishikesh',   country: 'India',       region: 'Asia',    cost_index: 2.0, popularity_score: 85, description: 'Yoga capital of the world, set on the foothills of the Himalayas.', image_url: 'https://images.unsplash.com/photo-1600101402736-4a63ba9afa1e?w=800', latitude: 30.0869, longitude: 78.2676 },
  { name: 'Amritsar',    country: 'India',       region: 'Asia',    cost_index: 2.5, popularity_score: 87, description: 'Home to the Golden Temple — the most sacred site in Sikhism.', image_url: 'https://images.unsplash.com/photo-1614518920522-ef6a0083ab43?w=800', latitude: 31.6340, longitude: 74.8723 },
  // Asia
  { name: 'Bali',        country: 'Indonesia',   region: 'Asia',    cost_index: 3.0, popularity_score: 97, description: 'Island of gods — rice terraces, ancient temples, and serene beaches.', image_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800', latitude: -8.3405, longitude: 115.0920 },
  { name: 'Shanghai',    country: 'China',       region: 'Asia',    cost_index: 7.0, popularity_score: 96, description: 'The most cosmopolitan city in China, blending old and ultramodern.', image_url: 'https://images.unsplash.com/photo-1548919973-5cef591cdbc9?w=800', latitude: 31.2304, longitude: 121.4737 },
  { name: 'Kyoto',       country: 'Japan',       region: 'Asia',    cost_index: 8.0, popularity_score: 98, description: 'Ancient capital of Japan — geisha districts, zen gardens, and 1600 temples.', image_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800', latitude: 35.0116, longitude: 135.7681 },
  { name: 'Osaka',       country: 'Japan',       region: 'Asia',    cost_index: 7.5, popularity_score: 94, description: 'Japan\'s kitchen — takoyaki, dotonbori nightlife, and Osaka Castle.', image_url: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=800', latitude: 34.6937, longitude: 135.5023 },
  { name: 'Phuket',      country: 'Thailand',    region: 'Asia',    cost_index: 4.5, popularity_score: 95, description: 'Thailand\'s largest island with stunning beaches, nightlife, and Andaman sunsets.', image_url: 'https://images.unsplash.com/photo-1504214208698-ea1916a2195a?w=800', latitude: 7.9519, longitude: 98.3381 },
  { name: 'Ho Chi Minh City', country: 'Vietnam', region: 'Asia', cost_index: 2.5, popularity_score: 88, description: 'Saigon — a dizzying mix of French colonial architecture and modern skyscrapers.', image_url: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800', latitude: 10.8231, longitude: 106.6297 },
  { name: 'Kathmandu',   country: 'Nepal',       region: 'Asia',    cost_index: 2.0, popularity_score: 86, description: 'Gateway to Everest — ancient stupas, vibrant bazaars, and mountain culture.', image_url: 'https://images.unsplash.com/photo-1582654291-c8d3f1a1e5b1?w=800', latitude: 27.7172, longitude: 85.3240 },
  { name: 'Colombo',     country: 'Sri Lanka',   region: 'Asia',    cost_index: 3.0, popularity_score: 80, description: 'Sri Lanka\'s commercial capital — colonial heritage and tropical charm.', image_url: 'https://images.unsplash.com/photo-1566296440663-48e032f4b6f3?w=800', latitude: 6.9271, longitude: 79.8612 },
  { name: 'Chiang Mai',  country: 'Thailand',    region: 'Asia',    cost_index: 3.0, popularity_score: 90, description: 'Northern Thailand\'s cultural capital — ancient temples, night markets, and elephants.', image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', latitude: 18.7061, longitude: 98.9817 },
  { name: 'Hong Kong',   country: 'China',       region: 'Asia',    cost_index: 8.5, popularity_score: 95, description: 'Where East meets West — neon-lit skyline, dim sum, and Victoria Peak.', image_url: 'https://images.unsplash.com/photo-1506970845246-18f21d533b20?w=800', latitude: 22.3193, longitude: 114.1694 },
  // Middle East
  { name: 'Dubai',       country: 'United Arab Emirates', region: 'Asia', cost_index: 8.5, popularity_score: 97, description: 'City of the future — record-breaking skyscrapers, luxury malls, and desert adventures.', image_url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800', latitude: 25.2048, longitude: 55.2708 },
  { name: 'Istanbul',    country: 'Turkey',      region: 'Europe',  cost_index: 5.0, popularity_score: 96, description: 'Where two continents meet — the Hagia Sophia, Grand Bazaar, and Bosphorus sunsets.', image_url: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800', latitude: 41.0082, longitude: 28.9784 },
  { name: 'Marrakech',   country: 'Morocco',     region: 'Africa',  cost_index: 3.5, popularity_score: 92, description: 'The Red City — labyrinthine souks, riads, and the magical Djemaa el-Fna square.', image_url: 'https://images.unsplash.com/photo-1539020140153-e479b8f22986?w=800', latitude: 31.6295, longitude: -7.9811 },
  // Europe
  { name: 'Barcelona',   country: 'Spain',       region: 'Europe',  cost_index: 7.0, popularity_score: 97, description: 'Gaudí\'s city — Sagrada Familia, Las Ramblas, and Mediterranean beaches.', image_url: 'https://images.unsplash.com/photo-1559060017-445fb9722f2f?w=800', latitude: 41.3851, longitude: 2.1734 },
  { name: 'Amsterdam',   country: 'Netherlands', region: 'Europe',  cost_index: 8.0, popularity_score: 93, description: 'City of canals — Anne Frank House, Van Gogh Museum, and cycling culture.', image_url: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800', latitude: 52.3676, longitude: 4.9041 },
  { name: 'Prague',      country: 'Czech Republic', region: 'Europe', cost_index: 5.0, popularity_score: 94, description: 'The City of a Hundred Spires — stunning Gothic architecture and medieval charm.', image_url: 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=800', latitude: 50.0755, longitude: 14.4378 },
  { name: 'Vienna',      country: 'Austria',     region: 'Europe',  cost_index: 7.5, popularity_score: 92, description: 'Imperial grandeur — Mozart, Schönbrunn Palace, and world-class coffee houses.', image_url: 'https://images.unsplash.com/photo-1516550893885-985c836c6c9f?w=800', latitude: 48.2082, longitude: 16.3738 },
  { name: 'Budapest',    country: 'Hungary',     region: 'Europe',  cost_index: 5.5, popularity_score: 91, description: 'Pearl of the Danube — thermal baths, ruin bars, and the majestic Parliament building.', image_url: 'https://images.unsplash.com/photo-1565426873118-a17ed65d74b9?w=800', latitude: 47.4979, longitude: 19.0402 },
  { name: 'Santorini',   country: 'Greece',      region: 'Europe',  cost_index: 8.5, popularity_score: 98, description: 'The iconic white and blue Cycladic island with breathtaking caldera views.', image_url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800', latitude: 36.3932, longitude: 25.4615 },
  { name: 'Florence',    country: 'Italy',       region: 'Europe',  cost_index: 7.5, popularity_score: 95, description: 'Cradle of the Renaissance — Uffizi Gallery, Duomo, and Tuscan cuisine.', image_url: 'https://images.unsplash.com/photo-1541351711010-5bbd6bca8934?w=800', latitude: 43.7696, longitude: 11.2558 },
  { name: 'Lisbon',      country: 'Portugal',    region: 'Europe',  cost_index: 6.0, popularity_score: 93, description: 'City of seven hills — trams, fado music, and golden Age of Exploration heritage.', image_url: 'https://images.unsplash.com/photo-1558617724-af4d0c3c9a43?w=800', latitude: 38.7169, longitude: -9.1399 },
  { name: 'Edinburgh',   country: 'United Kingdom', region: 'Europe', cost_index: 7.0, popularity_score: 90, description: 'Scotland\'s dramatic capital — the Castle, Royal Mile, and Arthur\'s Seat.', image_url: 'https://images.unsplash.com/photo-1506377585622-bedcbb027afc?w=800', latitude: 55.9533, longitude: -3.1883 },
  { name: 'Dubrovnik',   country: 'Croatia',     region: 'Europe',  cost_index: 6.5, popularity_score: 91, description: 'Pearl of the Adriatic — medieval city walls, Game of Thrones filming location.', image_url: 'https://images.unsplash.com/photo-1555990538-1e66e7ed7e47?w=800', latitude: 42.6507, longitude: 18.0944 },
  // Americas
  { name: 'New York',    country: 'United States', region: 'Americas', cost_index: 9.5, popularity_score: 99, description: 'The Big Apple — Times Square, Central Park, and the world\'s most iconic skyline.', image_url: 'https://images.unsplash.com/photo-1522083165195-3424ed129620?w=800', latitude: 40.7128, longitude: -74.0060 },
  { name: 'Los Angeles', country: 'United States', region: 'Americas', cost_index: 8.5, popularity_score: 95, description: 'City of Angels — Hollywood, Malibu beaches, and year-round sunshine.', image_url: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800', latitude: 34.0522, longitude: -118.2437 },
  { name: 'Chicago',     country: 'United States', region: 'Americas', cost_index: 7.5, popularity_score: 88, description: 'The Windy City — deep-dish pizza, jazz blues, and stunning lakefront architecture.', image_url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800', latitude: 41.8781, longitude: -87.6298 },
  { name: 'Rio de Janeiro', country: 'Brazil',   region: 'Americas', cost_index: 5.5, popularity_score: 96, description: 'Cidade Maravilhosa — Christ the Redeemer, Copacabana, and the world\'s greatest carnival.', image_url: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800', latitude: -22.9068, longitude: -43.1729 },
  { name: 'Buenos Aires', country: 'Argentina',  region: 'Americas', cost_index: 4.0, popularity_score: 88, description: 'Paris of South America — tango, steak, and European-style boulevards.', image_url: 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800', latitude: -34.6037, longitude: -58.3816 },
  { name: 'Cusco',       country: 'Peru',        region: 'Americas', cost_index: 3.0, popularity_score: 90, description: 'Gateway to Machu Picchu — ancient Inca capital in the heart of the Andes.', image_url: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800', latitude: -13.5319, longitude: -71.9675 },
  { name: 'Cartagena',   country: 'Colombia',    region: 'Americas', cost_index: 4.0, popularity_score: 85, description: 'Jewel of the Caribbean coast — colourful colonial architecture and old city walls.', image_url: 'https://images.unsplash.com/photo-1586885246036-d96d5a7e9a3e?w=800', latitude: 10.3910, longitude: -75.4794 },
  { name: 'Havana',      country: 'Cuba',        region: 'Americas', cost_index: 3.5, popularity_score: 87, description: 'Frozen in time — vintage cars, mojitos, colonial plazas, and live salsa music.', image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', latitude: 23.1136, longitude: -82.3666 },
  // Africa
  { name: 'Cape Town',   country: 'South Africa', region: 'Africa', cost_index: 5.0, popularity_score: 94, description: 'The Mother City — Table Mountain, vineyards, and the Cape of Good Hope.', image_url: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800', latitude: -33.9249, longitude: 18.4241 },
  { name: 'Marrakech',   country: 'Morocco',     region: 'Africa',  cost_index: 3.5, popularity_score: 92, description: 'The Red City — labyrinthine souks, riads, and the magical Djemaa el-Fna square.', image_url: 'https://images.unsplash.com/photo-1539020140153-e479b8f22986?w=800', latitude: 31.6295, longitude: -7.9811 },
  { name: 'Zanzibar',    country: 'Tanzania',    region: 'Africa',  cost_index: 4.0, popularity_score: 88, description: 'Spice island paradise — white-sand beaches, Stone Town, and turquoise waters.', image_url: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=800', latitude: -6.1659, longitude: 39.2026 },
  // Oceania
  { name: 'Sydney',      country: 'Australia',   region: 'Oceania', cost_index: 8.5, popularity_score: 96, description: 'Harbour City — Opera House, Bondi Beach, and breathtaking coastal walks.', image_url: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800', latitude: -33.8688, longitude: 151.2093 },
  { name: 'Melbourne',   country: 'Australia',   region: 'Oceania', cost_index: 8.0, popularity_score: 90, description: 'Australia\'s cultural capital — laneways, coffee culture, and vibrant arts scene.', image_url: 'https://images.unsplash.com/photo-1518391846015-55a9cc003b25?w=800', latitude: -37.8136, longitude: 144.9631 },
];

// ---------------------------------------------------------------------------
// Seed function
// ---------------------------------------------------------------------------

async function seedWorldCities() {
  console.log('🌍  Seeding world cities from RestCountries API…\n');

  try {
    // ── 1. Fetch all countries ────────────────────────────────────────────
    console.log('📡  Fetching countries from restcountries.com…');
    const resp = await fetch('https://restcountries.com/v3.1/all?fields=name,capital,region,subregion,latlng,population,gdp,flags,currencies');
    if (!resp.ok) throw new Error(`RestCountries API error: ${resp.status}`);
    const countries: any[] = await resp.json();
    console.log(`✅  Got ${countries.length} countries\n`);

    let insertedCapitals = 0;
    let skippedCapitals  = 0;

    for (const c of countries) {
      const capital: string | undefined = c.capital?.[0];
      if (!capital) { skippedCapitals++; continue; }

      const country  = c.name?.common ?? 'Unknown';
      const region   = mapRegion(c.subregion ?? '', c.region ?? '');
      const lat      = Array.isArray(c.latlng) ? c.latlng[0] : null;
      const lng      = Array.isArray(c.latlng) ? c.latlng[1] : null;
      const pop      = c.population ?? 0;
      const costIdx  = guessCostIndex(undefined); // no GDP in free tier, use population
      const popScore = guessPopularity(pop);
      const desc     = `${capital} is the capital of ${country}.`;
      // Use a generic Unsplash photo tagged with the capital name for visual variety
      const imageUrl = `https://source.unsplash.com/800x600/?${encodeURIComponent(capital + ' city')}`;

      await query(
        `INSERT INTO cities (name, country, region, cost_index, popularity_score, description, image_url, latitude, longitude)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT DO NOTHING`,
        [capital, country, region, costIdx, popScore, desc, imageUrl, lat, lng]
      );
      insertedCapitals++;
    }

    console.log(`✅  Capitals upserted: ${insertedCapitals} (${skippedCapitals} skipped — no capital data)\n`);

    // ── 2. Upsert hand-curated famous cities ─────────────────────────────
    console.log('🏙️   Upserting curated famous cities…');
    let insertedExtra = 0;
    for (const city of EXTRA_CITIES) {
      await query(
        `INSERT INTO cities (name, country, region, cost_index, popularity_score, description, image_url, latitude, longitude)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT DO NOTHING`,
        [city.name, city.country, city.region, city.cost_index, city.popularity_score,
         city.description, city.image_url, city.latitude, city.longitude]
      );
      insertedExtra++;
    }
    console.log(`✅  Extra famous cities upserted: ${insertedExtra}\n`);

    // ── 3. Final count ────────────────────────────────────────────────────
    const countRes = await query('SELECT COUNT(*)::int AS total FROM cities');
    console.log(`🎉  Total cities in DB: ${countRes.rows[0].total}`);
    console.log('✅  World city seeding complete!\n');

  } catch (err) {
    console.error('❌  Seeding failed:', err);
    throw err;
  } finally {
    await pool.end();
  }
}

seedWorldCities().catch((err) => {
  console.error(err);
  process.exit(1);
});
