import { NextResponse } from "next/server";
import pool from "@/lib/db"; // Adjust this path if necessary

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.trim().toLowerCase();

  if (!query) {
    return NextResponse.json({ results: [] }); // Return empty array if no query provided
  }

  try {
    const client = await pool.connect();

    // ✅ Use const since we're not reassigning searchTerms
    const searchTerms = [query];
    if (query.endsWith("s")) {
      searchTerms.push(query.slice(0, -1)); // e.g., "trucks" → "truck"
    } else if (query.length > 0 && !query.endsWith("s")) {
      searchTerms.push(query + "s"); // e.g., "truck" → "trucks"
    }

    const finalParamValues: string[] = [];
    let paramIndex = 1;

    const buildLikeConditions = (columns: string[]) => {
      const columnConditions: string[] = [];
      for (const column of columns) {
        const colReference = `COALESCE(${column}::TEXT, '')`;
        for (let i = 0; i < searchTerms.length; i++) {
          columnConditions.push(`LOWER(${colReference}) LIKE $${paramIndex}`);
          finalParamValues.push(`%${searchTerms[i]}%`);
          paramIndex++;
        }
      }
      return `(${columnConditions.join(" OR ")})`;
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
        NULL::numeric AS price,
        'product' AS source
      FROM products
      WHERE
        ${buildLikeConditions(["name", "sku", "categories"])}
      ORDER BY name ASC
      LIMIT 100;
    `;

    console.log("Generated Product Search SQL:\n", sql);
    console.log("Final Parameters:", finalParamValues);

    const result = await client.query(sql, finalParamValues);
    client.release();

    console.log(`Product search for: ${searchTerms.join(", ")}`);
    console.log(`Found ${result.rows.length} product results for query: "${query}"`);
    if (result.rows.length > 0) {
      console.log(
        "Sample product search results (first 5):",
        JSON.stringify(result.rows.slice(0, 5), null, 2)
      );
    }

    const formattedResults = result.rows.map((row) => ({
      id: row.id,
      name: row.title,
      image_url: row.image_url,
      price: row.price,
    }));

    return NextResponse.json({ results: formattedResults });
  } catch (error) {
    console.error("Error fetching product search results:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
