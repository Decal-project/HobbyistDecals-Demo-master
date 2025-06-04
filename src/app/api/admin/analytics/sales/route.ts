import { NextResponse } from 'next/server';
import  pool  from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();

    // Total orders
    const { rows: totalOrdersRows } = await client.query(`
      SELECT COUNT(*) FROM carts WHERE total_amount IS NOT NULL
    `);
    const totalOrders = parseInt(totalOrdersRows[0].count);

    // Total revenue from checkout_orders
    const { rows: revenueRows } = await client.query(`
      SELECT COALESCE(SUM(total_amount), 0) AS revenue FROM checkout_orders
    `);
    const totalRevenue = parseFloat(revenueRows[0].revenue);

    // Total items sold
    const { rows: itemRows } = await client.query(`
      SELECT COALESCE(SUM(quantity), 0) AS items_sold
      FROM cart_items
      WHERE cart_id IN (SELECT id FROM carts WHERE total_amount IS NOT NULL)
    `);
    const totalItemsSold = parseInt(itemRows[0].items_sold);

    // Average Order Value (AOV)
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Sales by payment method (from checkout_orders)
    const { rows: paymentRows } = await client.query(`
      SELECT payment_method, SUM(total_amount) AS total
      FROM checkout_orders
      GROUP BY payment_method
    `);
    const salesByPaymentMethod = {};
    paymentRows.forEach(row => {
      salesByPaymentMethod[row.payment_method] = parseFloat(row.total);
    });

    // Sales by Date (daily from checkout_orders)
    const { rows: dateRows } = await client.query(`
      SELECT TO_CHAR(created_at::date, 'YYYY-MM-DD') AS day, SUM(total_amount) AS total
      FROM checkout_orders
      GROUP BY day
      ORDER BY day ASC
    `);
    const salesByDate = {};
    dateRows.forEach(row => {
      salesByDate[row.day] = parseFloat(row.total);
    });

    client.release();

    return NextResponse.json({
      totalOrders,
      totalRevenue,
      totalItemsSold,
      avgOrderValue,
      salesByPaymentMethod,
      salesByDate
    });

  } catch (error) {
    console.error('Error loading sales analytics:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
