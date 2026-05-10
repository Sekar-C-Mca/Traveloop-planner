/**
 * seed-global-data.ts
 * ─────────────────────────────────────────────────────────────
 * Uses the 'country-state-city' npm package to seed the database.
 * Optimized with batching and robust transaction handling for large datasets.
 */

import { pool, query } from './index';
import { Country, City } from 'country-state-city';

// ---------------------------------------------------------------------------
// Featured Famous Cities (Our curated list with images)
// ---------------------------------------------------------------------------

interface FeaturedCity {
  name: string; country: string; region: string; country_code: string;
  cost_index: number; popularity_score: number;
  description: string; image_url: string;
  latitude: number; longitude: number;
}

const FEATURED_CITIES: FeaturedCity[] = [
  { name: 'Mumbai', country: 'India', region: 'Asia', country_code: 'IND', cost_index: 4.5, popularity_score: 97, description: 'The City of Dreams — Bollywood, colonial heritage, and the iconic Gateway of India.', image_url: 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=800', latitude: 19.0760, longitude: 72.8777 },
  { name: 'Jaipur', country: 'India', region: 'Asia', country_code: 'IND', cost_index: 3.5, popularity_score: 95, description: 'The Pink City — Rajasthani culture, magnificent forts, and vibrant bazaars.', image_url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800', latitude: 26.9124, longitude: 75.7873 },
  { name: 'Goa', country: 'India', region: 'Asia', country_code: 'IND', cost_index: 4.0, popularity_score: 98, description: 'Beach paradise with golden sands, Portuguese heritage, and vibrant nightlife.', image_url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800', latitude: 15.2993, longitude: 74.1240 },
  { name: 'New Delhi', country: 'India', region: 'Asia', country_code: 'IND', cost_index: 4.0, popularity_score: 96, description: 'The capital city — a blend of historical monuments and modern bustle.', image_url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800', latitude: 28.6139, longitude: 77.2090 },
  { name: 'Paris', country: 'France', region: 'Europe', country_code: 'FRA', cost_index: 9.0, popularity_score: 99, description: 'City of Love — Eiffel Tower, Louvre, and world-class patisseries.', image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800', latitude: 48.8566, longitude: 2.3522 },
  { name: 'London', country: 'United Kingdom', region: 'Europe', country_code: 'GBR', cost_index: 9.0, popularity_score: 98, description: 'Historical metropolis — Big Ben, Thames River, and royal heritage.', image_url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800', latitude: 51.5074, longitude: -0.1278 },
  { name: 'Rome', country: 'Italy', region: 'Europe', country_code: 'ITA', cost_index: 7.5, popularity_score: 98, description: 'The Eternal City — Colosseum, Vatican, and authentic pasta.', image_url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800', latitude: 41.9028, longitude: 12.4964 },
  { name: 'Barcelona', country: 'Spain', region: 'Europe', country_code: 'ESP', cost_index: 7.0, popularity_score: 97, description: 'Gaudí\'s city — Sagrada Familia, Las Ramblas, and Mediterranean vibes.', image_url: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800', latitude: 41.3851, longitude: 2.1734 },
  { name: 'Tokyo', country: 'Japan', region: 'Asia', country_code: 'JPN', cost_index: 8.5, popularity_score: 99, description: 'Cyberpunk reality — neon lights, sushi, and ancient shrines.', image_url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800', latitude: 35.6762, longitude: 139.6503 },
  { name: 'Singapore', country: 'Singapore', region: 'Asia', country_code: 'SGP', cost_index: 9.0, popularity_score: 96, description: 'The Garden City — Marina Bay Sands, Hawker centers, and tropical luxury.', image_url: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800', latitude: 1.3521, longitude: 103.8198 },
  { name: 'Bangkok', country: 'Thailand', region: 'Asia', country_code: 'THA', cost_index: 4.5, popularity_score: 97, description: 'Vibrant street life — ornate shrines, canal boat rides, and night markets.', image_url: 'https://images.unsplash.com/photo-1504214208698-ea1916a2195a?w=800', latitude: 13.7563, longitude: 100.5018 },
  { name: 'New York', country: 'United States', region: 'Americas', country_code: 'USA', cost_index: 9.5, popularity_score: 99, description: 'The Big Apple — Times Square, Central Park, and the world\'s iconic skyline.', image_url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800', latitude: 40.7128, longitude: -74.0060 },
  { name: 'Rio de Janeiro', country: 'Brazil', region: 'Americas', country_code: 'BRA', cost_index: 5.5, popularity_score: 96, description: 'Cidade Maravilhosa — Christ the Redeemer and Copacabana beach.', image_url: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800', latitude: -22.9068, longitude: -43.1729 },
];

function getCostIndex(countryCode: string): number {
  const highCost = ['US', 'GB', 'FR', 'DE', 'JP', 'CH', 'SG', 'AU', 'CA', 'NO', 'DK', 'SE'];
  const midCost = ['ES', 'IT', 'KR', 'AE', 'SA', 'CN', 'GR', 'PT', 'BR', 'MX', 'ZA'];
  if (highCost.includes(countryCode)) return 8.5;
  if (midCost.includes(countryCode)) return 6.0;
  return 3.5;
}

async function seedGlobalData() {
  console.log('🌍  Starting Comprehensive Global Data Seeding…\n');

  try {
    const allCountries = Country.getAllCountries();
    const citiesToInsert: any[] = [];
    
    for (const country of allCountries) {
      const region = country.region || 'Other';
      const countryName = country.name;
      const countryCode = country.isoCode;
      const costIdx = getCostIndex(countryCode);

      // Take ALL cities for India (very important for user)
      // Take 100 cities for others to keep DB stable
      const limit = (countryCode === 'IN') ? 10000 : 100;
      const cities = City.getCitiesOfCountry(countryCode)?.slice(0, limit) || [];

      for (const city of cities) {
        if (!city.name) continue;
        citiesToInsert.push([
          city.name, countryName, city.stateCode, countryCode, region,
          city.latitude || country.latitude, city.longitude || country.longitude,
          costIdx, 60 + Math.floor(Math.random() * 20), false
        ]);
      }
    }

    console.log(`📉  Ready to insert ${citiesToInsert.length} cities\n`);

    const client = await pool.connect();
    try {
      const batchSize = 400; // Slightly smaller batch for stability
      for (let i = 0; i < citiesToInsert.length; i += batchSize) {
        const batch = citiesToInsert.slice(i, i + batchSize);
        const values = batch.map((_, idx) => 
          `($${idx * 10 + 1}, $${idx * 10 + 2}, $${idx * 10 + 3}, $${idx * 10 + 4}, $${idx * 10 + 5}, $${idx * 10 + 6}, $${idx * 10 + 7}, $${idx * 10 + 8}, $${idx * 10 + 9}, $${idx * 10 + 10})`
        ).join(',');

        const flattenedValues = batch.flat();
        
        // No explicit transaction for bulk data to avoid long-lived locks and timeouts
        await client.query(
          `INSERT INTO cities (name, country, state, country_code, region, latitude, longitude, cost_index, popularity_score, is_featured)
           VALUES ${values}
           ON CONFLICT DO NOTHING`,
          flattenedValues
        );
        
        if (i % 4000 === 0) {
          console.log(`💾 Processed ${i} cities…`);
          // Small delay every 10 batches to let the DB breathe
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      console.log('⭐  Applying featured city overrides…');
      // Featured overrides are in a transaction to ensure atomic high-quality data
      await client.query('BEGIN');
      for (const f of FEATURED_CITIES) {
        const iso2 = allCountries.find(c => c.name === f.country || c.isoCode === f.country_code.substring(0, 2))?.isoCode || f.country_code;
        const res = await client.query(
          `UPDATE cities SET 
             description = $1, image_url = $2, is_featured = true, popularity_score = $3, latitude = $4, longitude = $5
           WHERE name = $6 AND (country = $7 OR country_code = $8)
           RETURNING id`,
          [f.description, f.image_url, f.popularity_score, f.latitude, f.longitude, f.name, f.country, iso2]
        );

        if (res.rowCount === 0) {
          await client.query(
            `INSERT INTO cities (name, country, country_code, region, latitude, longitude, cost_index, popularity_score, description, image_url, is_featured)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)`,
            [f.name, f.country, iso2, f.region, f.latitude, f.longitude, f.cost_index, f.popularity_score, f.description, f.image_url]
          );
        }
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

    const finalCount = await query('SELECT COUNT(*)::int as total FROM cities');
    console.log(`\n🎉  Seeding complete! Total cities: ${finalCount.rows[0].total}`);

  } catch (error) {
    console.error('❌  Seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedGlobalData();
