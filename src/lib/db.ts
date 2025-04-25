import dotenv from "dotenv";
import { Pool } from "pg";
import { neon } from "@neondatabase/serverless"; 

dotenv.config();

// ✅ Pool setup (for traditional pg queries)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Required by Neon
});

// Optional: Test pool connection
async function testConnection() {
  try {
    const client = await pool.connect();
    console.log("✅ Database connection established successfully");
    client.release();
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
}
testConnection();

// ✅ Neon SQL client setup (for tagged-template queries)
const sql = neon(process.env.DATABASE_URL!); // Use ! only if you're sure it's defined

// Export both
export { pool, sql };
