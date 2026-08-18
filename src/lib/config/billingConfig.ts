export const BILLING_CONFIG = {
  business: {
    name: 'Skilvi',
    legalName: 'Skilvi',
    address: '1st B CrossRd 1st B Cross Rd Vidyaranyapura Post AmbaBhavani Nagar,AmbaBhavani Temple Road Doddabettahalli 560097 Bengaluru,KARNATAKA,India',
    email: 'support.skilvi@gmail.com',
    phone: '+91-9731755053',
    website: 'https://www.skilvi.in',

  },
  currency: 'INR',
  currencySymbol: '₹',
  tax: {
    enabled: false,
    cgstPercent: 9,
    sgstPercent: 9,
    igstPercent: 0,
    // By default, assuming the pricePaid is inclusive of GST 18% for Indian B2C.
    // E.g., if you pay 5999, taxable is 5999 / 1.18 = 5083.89, CGST = 457.55, SGST = 457.55
    isInclusive: true,
  },
  labels: {
    invoiceTitle: 'TAX INVOICE',
    billTo: 'Bill To:',
    orderId: 'Order ID:',
    transactionId: 'Transaction ID:',
    invoiceNo: 'Invoice No:',
    orderDate: 'Order Date:',
    paymentStatus: 'Payment Status:',
    paymentMethod: 'Payment Method:',
    item: 'Course / Product',
    qty: 'Qty',
    price: 'Unit Price',
    discount: 'Discount',
    total: 'Total',
    subtotal: 'Subtotal:',
    taxableAmount: 'Taxable Value:',
    cgst: 'CGST (9%):',
    sgst: 'SGST (9%):',
    grandTotal: 'Grand Total:',
  },
  footer: {
    notes: 'Payment & Purchase Note: Payment and course purchases are processed through Skilvi.',
    terms: 'This invoice is generated electronically from the corresponding Skilvi transaction records.',
  }
};
