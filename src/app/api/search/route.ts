import { NextResponse } from "next/server";
import pool from "@/lib/db"; // Assuming this path is correct for your project

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.trim().toLowerCase();

  if (!query) {
    return NextResponse.json({ results: [] }); // Return an empty array if no query is provided
  }

  try {
    const client = await pool.connect();

    // Use multiple search terms for singular/plural matching
    let searchTerms = [query];
    if (query.endsWith('s')) {
      searchTerms.push(query.slice(0, -1)); // e.g., 'trucks' -> 'truck'
    } else if (query.length > 0 && !query.endsWith('s')) {
      searchTerms.push(query + 's'); // e.g., 'truck' -> 'trucks'
    }

    // Prepare an array of parameters for the SQL query
    const finalParamValues: string[] = [];
    let paramIndex = 1; // Start parameter index from 1

    // Build the LIKE conditions dynamically based on searchTerms
    const buildLikeConditions = (columns: string[]) => {
      const columnConditions: string[] = [];
      for (const column of columns) {
        // Always COALESCE and cast to TEXT for robust LIKE comparisons
        const colReference = `COALESCE(${column}::TEXT, '')`;

        for (let i = 0; i < searchTerms.length; i++) {
          columnConditions.push(`LOWER(${colReference}) LIKE $${paramIndex}`);
          finalParamValues.push(`%${searchTerms[i]}%`); // CORRECTED: Use searchTerms[i] here
          paramIndex++; // Increment for the next parameter
        }
      }
      // Each set of conditions for a column should be ORed together
      // and then each column's combined conditions should be ORed with others.
      // Example: (LOWER(name) LIKE $1 OR LOWER(name) LIKE $2) OR (LOWER(sku) LIKE $3 OR LOWER(sku) LIKE $4)
      return `(${columnConditions.join(' OR ')})`; // Wrap all conditions for clarity
    };

    const sql = `
      SELECT
          id,
          name AS title,
          short_description AS description,
          CASE
            WHEN images IS NOT NULL AND (images LIKE 'http://%' OR images LIKE 'https://%' OR images LIKE '/%') THEN images
            ELSE NULL
          END AS image_url,
          NULL::numeric AS price, -- CORRECTED: Explicitly set price to NULL as it doesn't exist in products table
          'product' AS source
      FROM products
      WHERE
          ${buildLikeConditions(['name', 'sku', 'categories'])}
      ORDER BY name ASC -- Order by name for better live suggestions
      LIMIT 100; -- Limit results for performance, especially for live suggestions
    `;

    console.log("Generated Product Search SQL:\n", sql);
    console.log("Final Parameters:", finalParamValues);

    const result = await client.query(sql, finalParamValues); // Pass parameters as a single array
    client.release();

    console.log(`Product search for: ${searchTerms.join(', ')}`);
    console.log(`Found ${result.rows.length} product results for query: "${query}"`);
    if (result.rows.length > 0) {
      console.log("Sample product search results (first 5):", JSON.stringify(result.rows.slice(0, 5), null, 2));
    }

    // Format results to match the desired "Live Suggestions" format (name, image, price)
    const formattedResults = result.rows.map(row => ({
      id: row.id,
      name: row.title,       // Using 'title' from SQL alias
      image_url: row.image_url,
      price: row.price // This will now be NULL if price is not in products table
    }));

    return NextResponse.json({ results: formattedResults });

  } catch (error) {
    console.error("Error fetching product search results:", error);
    // Return a 500 status code for internal server errors
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}