import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Define a type for each row returned from the SQL query
interface OrderItemRow {
  order_id: number;
  billing_first_name: string;
  billing_last_name: string;
  total_amount: number;
  created_at: string;
  billing_country: string;
  billing_street_address: string;
  billing_city: string;
  billing_state: string;
  billing_postal_code: string;
  billing_phone: string;
  item_id: number;
  item_name: string;
  quantity: number;
  price: number;
}

interface GroupedOrder {
  orderId: number;
  customerName: string;
  totalAmount: number;
  createdAt: string;
  billingAddress: {
    country: string;
    streetAddress: string;
    city: string;
    state: string;
    postalCode: string;
    phone: string;
  };
  items: {
    id: number;
    name: string;
    quantity: number;
    price: number;
  }[];
}

export async function GET() {
  try {
    const { rows: orders } = await pool.query<OrderItemRow>(`
      SELECT 
        o.id AS order_id, 
        o.billing_first_name, 
        o.billing_last_name, 
        o.total_amount, 
        o.created_at,
        o.billing_country,
        o.billing_street_address,
        o.billing_city,
        o.billing_state,
        o.billing_postal_code,
        o.billing_phone,
        c.id AS item_id,
        c.name AS item_name,
        c.quantity,
        c.price
      FROM checkout_orders o
      JOIN cart_items c ON o.cart_id = c.cart_id
      ORDER BY o.created_at DESC
    `);

    const groupedOrders: Record<number, GroupedOrder> = {};

    for (const row of orders) {
      const {
        order_id,
        billing_first_name,
        billing_last_name,
        total_amount,
        created_at,
        billing_country,
        billing_street_address,
        billing_city,
        billing_state,
        billing_postal_code,
        billing_phone,
        item_id,
        item_name,
        quantity,
        price
      } = row;

      if (!groupedOrders[order_id]) {
        groupedOrders[order_id] = {
          orderId: order_id,
          customerName: `${billing_first_name} ${billing_last_name}`,
          totalAmount: total_amount,
          createdAt: created_at,
          billingAddress: {
            country: billing_country,
            streetAddress: billing_street_address,
            city: billing_city,
            state: billing_state,
            postalCode: billing_postal_code,
            phone: billing_phone
          },
          items: [],
        };
      }

      groupedOrders[order_id].items.push({
        id: item_id,
        name: item_name,
        quantity,
        price
      });
    }

    return NextResponse.json(Object.values(groupedOrders));
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to load orders' }, { status: 500 });
  }
}
