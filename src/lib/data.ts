export async function fetchCardData() {
    try {
      // You can probably combine these into a single SQL query
      // However, we are intentionally splitting them to demonstrate
      // how to initialize multiple queries in parallel with JS.
    //   const invoiceCountPromise = sql`SELECT COUNT(*) FROM invoices`;
    //   const customerCountPromise = sql`SELECT COUNT(*) FROM customers`;
    //   const invoiceStatusPromise = sql`SELECT
    //        SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
    //        SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
    //        FROM invoices`;
  
    //   const data = await Promise.all([
    //     invoiceCountPromise,
    //     customerCountPromise,
    //     invoiceStatusPromise,
    //   ]);
  
      const numberOfInvoices = "test";
      const numberOfCustomers = "test";
      const totalPaidInvoices = "test";
      const totalPendingInvoices = "test";
  
      return {
        numberOfCustomers,
        numberOfInvoices,
        totalPaidInvoices,
        totalPendingInvoices,
      };
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Failed to fetch card data.');
    }
  }