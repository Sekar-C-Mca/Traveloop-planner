import { pool, query } from "./index";

async function seed() {
  console.log("🌱 Starting database seed...");

  try {
    // Seed activity categories
    console.log("📂 Seeding activity categories...");
    await query(`
      INSERT INTO activity_categories (name, icon) VALUES
        ('Sightseeing', 'binoculars'),
        ('Food & Dining', 'fork-knife'),
        ('Adventure', 'mountain'),
        ('Culture & History', 'museum'),
        ('Shopping', 'bag'),
        ('Nature', 'leaf'),
        ('Nightlife', 'moon'),
        ('Wellness', 'heart')
      ON CONFLICT (name) DO NOTHING
    `);
    console.log("✅ Activity categories seeded");

    // Seed cities
    console.log("🏙️  Seeding cities...");
    await query(`
      INSERT INTO cities (name, country, region, cost_index, popularity_score, description, image_url, latitude, longitude) VALUES
        ('Jaipur', 'India', 'Asia', 3.5, 95, 'The Pink City — a royal blend of Rajasthani culture, magnificent forts, and vibrant bazaars.', 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800', 26.9124, 75.7873),
        ('Goa', 'India', 'Asia', 4.0, 98, 'Beach paradise with golden sands, Portuguese heritage, and vibrant nightlife.', 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800', 15.2993, 74.1240),
        ('Manali', 'India', 'Asia', 2.5, 90, 'Mountain retreat nestled in the Himalayas, perfect for adventure and serenity.', 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800', 32.2432, 77.1892),
        ('Varanasi', 'India', 'Asia', 2.0, 88, 'Spiritual capital of India on the banks of the sacred Ganges river.', 'https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=800', 25.3176, 82.9739),
        ('Coorg', 'India', 'Asia', 3.0, 85, 'Scotland of India — misty hills, coffee plantations, and lush greenery.', 'https://images.unsplash.com/photo-1609766857585-a1e0e04e4a87?w=800', 12.3375, 75.8069),
        ('Bangkok', 'Thailand', 'Asia', 3.5, 96, 'City of temples, street food, and vibrant markets that never sleep.', 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800', 13.7563, 100.5018),
        ('Paris', 'France', 'Europe', 8.0, 99, 'City of light, love, and the most iconic skyline in the world.', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800', 48.8566, 2.3522),
        ('Bali', 'Indonesia', 'Asia', 3.0, 97, 'Island of gods — terraced rice fields, ancient temples, and serene beaches.', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800', -8.3405, 115.0920),
        ('Dubai', 'UAE', 'Asia', 7.0, 95, 'City of the future — record-breaking skyscrapers, luxury, and desert adventure.', 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800', 25.2048, 55.2708),
        ('Udaipur', 'India', 'Asia', 3.5, 92, 'City of Lakes — the most romantic city in India with palaces and serene lakes.', 'https://images.unsplash.com/photo-1568859539571-7e8c9419f7dd?w=800', 24.5854, 73.7125)
      ON CONFLICT DO NOTHING
    `);
    console.log("✅ Cities seeded");

    // Get city IDs and category IDs
    const citiesRes = await query("SELECT id, name FROM cities ORDER BY id");
    const catsRes = await query(
      "SELECT id, name FROM activity_categories ORDER BY id",
    );

    const cityMap: Record<string, number> = {};
    citiesRes.rows.forEach((c: any) => {
      cityMap[c.name] = c.id;
    });

    const catMap: Record<string, number> = {};
    catsRes.rows.forEach((c: any) => {
      catMap[c.name] = c.id;
    });

    console.log("🎯 Seeding activities...");

    // Jaipur activities
    const jaipurId = cityMap["Jaipur"];
    if (jaipurId) {
      await query(
        `
        INSERT INTO activities (city_id, category_id, name, description, estimated_cost, duration_minutes, is_popular) VALUES
          ($1, $2, 'Amber Fort Visit', 'Explore the magnificent hilltop fort with stunning views of Maota Lake', 550, 180, true),
          ($1, $2, 'City Palace Tour', 'Royal palace museum in the heart of Jaipur with royal artifacts', 700, 120, true),
          ($1, $3, 'Chokhi Dhani Dinner', 'Authentic Rajasthani village dining experience with folk performances', 1200, 180, true),
          ($1, $4, 'Jantar Mantar', 'UNESCO World Heritage astronomical observatory with fascinating sundials', 200, 60, false),
          ($1, $5, 'Johari Bazaar Shopping', 'Traditional jewelry and textile market in the old city', 0, 120, true),
          ($1, $2, 'Hawa Mahal', 'The iconic Palace of Winds — a stunning 5-story facade with 953 windows', 50, 60, true),
          ($1, $6, 'Nahargarh Fort Sunset', 'Watch the sunset from the hilltop fort overlooking the Pink City', 50, 90, true)
        ON CONFLICT DO NOTHING
      `,
        [
          jaipurId,
          catMap["Sightseeing"],
          catMap["Food & Dining"],
          catMap["Culture & History"],
          catMap["Shopping"],
          catMap["Nature"],
        ],
      );
    }

    // Goa activities
    const goaId = cityMap["Goa"];
    if (goaId) {
      await query(
        `
        INSERT INTO activities (city_id, category_id, name, description, estimated_cost, duration_minutes, is_popular) VALUES
          ($1, $2, 'Baga Beach Day', 'Relax at one of Goa''s most popular beaches with water sports', 500, 240, true),
          ($1, $3, 'Seafood at Fisherman''s Wharf', 'Fresh Goan seafood in a scenic riverside setting', 800, 90, true),
          ($1, $4, 'Old Goa Churches Tour', 'UNESCO-listed Basilica of Bom Jesus and Se Cathedral', 0, 150, false),
          ($1, $5, 'Tito''s Club Night', 'Experience Goa''s legendary nightlife at Asia''s famous beach club', 1500, 300, true),
          ($1, $6, 'Dudhsagar Falls Trek', 'Trek to one of India''s highest waterfalls through dense forest', 600, 360, true)
        ON CONFLICT DO NOTHING
      `,
        [
          goaId,
          catMap["Sightseeing"],
          catMap["Food & Dining"],
          catMap["Culture & History"],
          catMap["Nightlife"],
          catMap["Nature"],
        ],
      );
    }

    // Manali activities
    const manaliId = cityMap["Manali"];
    if (manaliId) {
      await query(
        `
        INSERT INTO activities (city_id, category_id, name, description, estimated_cost, duration_minutes, is_popular) VALUES
          ($1, $2, 'Solang Valley Snow Sports', 'Skiing, snowboarding and zorbing in a stunning snow valley', 1500, 240, true),
          ($1, $3, 'Rohtang Pass Excursion', 'High-altitude mountain pass with breathtaking Himalayan views', 2000, 480, true),
          ($1, $4, 'Hadimba Temple Visit', 'Ancient cave temple dedicated to Goddess Hadimba amidst cedar forests', 0, 60, true),
          ($1, $5, 'Old Manali Market', 'Browse handicrafts, woolens, and local produce in the old bazaar', 0, 90, false)
        ON CONFLICT DO NOTHING
      `,
        [
          manaliId,
          catMap["Adventure"],
          catMap["Nature"],
          catMap["Culture & History"],
          catMap["Shopping"],
        ],
      );
    }

    // Bali activities
    const baliId = cityMap["Bali"];
    if (baliId) {
      await query(
        `
        INSERT INTO activities (city_id, category_id, name, description, estimated_cost, duration_minutes, is_popular) VALUES
          ($1, $2, 'Tanah Lot Temple Sunset', 'Watch the sunset at Bali''s most iconic ocean temple', 600, 120, true),
          ($1, $3, 'Ubud Cooking Class', 'Learn to cook authentic Balinese dishes with local ingredients', 1200, 240, true),
          ($1, $4, 'Tegalalang Rice Terraces', 'Walk through stunning UNESCO-listed rice terrace landscapes', 500, 120, true),
          ($1, $5, 'Kuta Beach Surfing', 'Take surf lessons on one of Bali''s most famous beaches', 800, 180, true),
          ($1, $6, 'Bali Spa & Wellness', 'Traditional Balinese massage and wellness treatments', 600, 120, false)
        ON CONFLICT DO NOTHING
      `,
        [
          baliId,
          catMap["Sightseeing"],
          catMap["Food & Dining"],
          catMap["Nature"],
          catMap["Adventure"],
          catMap["Wellness"],
        ],
      );
    }

    // Bangkok activities
    const bangkokId = cityMap["Bangkok"];
    if (bangkokId) {
      await query(
        `
        INSERT INTO activities (city_id, category_id, name, description, estimated_cost, duration_minutes, is_popular) VALUES
          ($1, $2, 'Grand Palace & Wat Phra Kaew', 'Thailand''s most sacred temple complex with the Emerald Buddha', 700, 180, true),
          ($1, $3, 'Chatuchak Weekend Market', 'One of the world''s largest markets with 15,000+ stalls', 0, 240, true),
          ($1, $4, 'Chinatown Street Food Tour', 'Feast on dim sum, roasted duck, and Thai-Chinese delicacies', 500, 180, true),
          ($1, $5, 'Rooftop Bar at Lebua', 'Iconic rooftop bar from The Hangover Part II with skyline views', 2000, 120, true)
        ON CONFLICT DO NOTHING
      `,
        [
          bangkokId,
          catMap["Sightseeing"],
          catMap["Shopping"],
          catMap["Food & Dining"],
          catMap["Nightlife"],
        ],
      );
    }

    console.log("✅ Activities seeded");
    console.log("\n🎉 Database seeding complete!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
