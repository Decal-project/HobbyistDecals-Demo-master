import { NextResponse } from "next/server";
import pool from "@/lib/db"; // Assuming this is a pg Pool instance

function getMediaCode(media: string): string {
  const map: Record<string, string> = {
    waterslide: "WD",
    // Add more if needed
  };
  return map[media.toLowerCase()] || media;
}

function getScaleCode(scale: string): string {
  const parts = scale.split("/");
  const denom = parts[1] || parts[0];
  return `S${denom.padStart(3, "0")}`;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");

  if (!name) {
    return NextResponse.json({ error: "Product name is required" }, { status: 400 });
  }

  try {
    const decodedName = decodeURIComponent(decodeURIComponent(name));

    const result = await pool.query(
      `SELECT * FROM products WHERE name = $1`,
      [decodedName]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const product = result.rows[0];
    const baseSkuMatch = product.images?.match(/(HD\d{6})/);
    const baseSku = baseSkuMatch ? baseSkuMatch[1] : "UNKNOWN";

    const images = typeof product.images === "string"
      ? product.images.split(",").map((img: string) => img.trim())
      : [];

    const defaultImage = images[0] || "";

    const attribute_1_values = product.attribute_1_values?.split(",").map((v: string) => v.trim()) || [];

    let rawScaleValues = product.attribute_2_values?.trim().toLowerCase() === "25-jan"
      ? "1/25"
      : product.attribute_2_values || "";

    const attribute_2_values = rawScaleValues
      .split(",")
      .map((v: string) => v.trim())
      .filter((v: string) => v.toLowerCase() !== "25-jan");

    const attribute_3_values = product.attribute_3_values
      ? product.attribute_3_values
          .split(",")
          .map((v: string) => v.trim().split(":")[0].toUpperCase())
          .filter((v: string) => /^(V\d+|C\d+)$/i.test(v))
      : [];

    const attribute_3_name = product.attribute_3_name || "";

    const skuImageMap: Record<string, string> = {};
    const allPrices: number[] = [];
    const usedSkus = new Set<string>();

    for (const media of attribute_1_values) {
      const mediaCode = getMediaCode(media);

      for (const scale of attribute_2_values) {
        const scaleCode = getScaleCode(scale);

        if (attribute_3_values.length > 0) {
          for (const variation of attribute_3_values) {
            const variationCode = variation.toUpperCase();
            const fullSku = `${mediaCode}-${baseSku}-${scaleCode}-${variationCode}`;
            if (usedSkus.has(fullSku)) continue;
            usedSkus.add(fullSku);

            const imageResult = await pool.query(
              `SELECT images FROM products WHERE images LIKE $1 LIMIT 1`,
              [`%${baseSku}-${scaleCode}-${variationCode}%`]
            );

            const priceResult = await pool.query(
              `SELECT regular_price FROM products WHERE sku = $1 LIMIT 1`,
              [fullSku]
            );

            const matchedImage = imageResult.rows[0]?.images || defaultImage;
            const matchedPrice = parseFloat(priceResult.rows[0]?.regular_price) || parseFloat(product.regular_price) || 0;

            skuImageMap[fullSku] = matchedImage;
            allPrices.push(matchedPrice);

            console.log(`✅ SKU: ${fullSku} → Image: ${matchedImage}`);
          }
        } else {
          const fullSku = `${mediaCode}-${baseSku}-${scaleCode}`;
          if (usedSkus.has(fullSku)) continue;
          usedSkus.add(fullSku);

          const imageResult = await pool.query(
            `SELECT images FROM products WHERE images LIKE $1 LIMIT 1`,
            [`%${baseSku}-${scaleCode}%`]
          );

          const priceResult = await pool.query(
            `SELECT regular_price FROM products WHERE sku = $1 LIMIT 1`,
            [fullSku]
          );

          const matchedImage = imageResult.rows[0]?.images || defaultImage;
          const matchedPrice = parseFloat(priceResult.rows[0]?.regular_price) || parseFloat(product.regular_price) || 0;

          skuImageMap[fullSku] = matchedImage;
          allPrices.push(matchedPrice);

          console.log(`✅ SKU: ${fullSku} → Image: ${matchedImage}`);
        }
      }
    }

    let regular_price: string;
    if (attribute_3_values.length > 0 && allPrices.length > 0) {
      const min = Math.min(...allPrices);
      const max = Math.max(...allPrices);
      regular_price = min === max ? `${min.toFixed(2)}` : `${min.toFixed(2)} - ${max.toFixed(2)}`;
    } else {
      regular_price = allPrices[0]?.toFixed(2) || "0.00";
    }

    return NextResponse.json({
      name: product.name,
      regular_price,
      images,
      sku_images: skuImageMap,
      base_sku: baseSku,
      attribute_1_values: product.attribute_1_values || "",
      attribute_2_values: product.attribute_2_values || "",
      attribute_3_name,
      attribute_3_values: product.attribute_3_values || "",
      description: product.description || "",
    });
  } catch (err) {
    console.error("❌ Database error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
