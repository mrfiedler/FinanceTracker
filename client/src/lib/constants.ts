// Revenue categories
export const revenueCategories = [
  { value: "design", label: "Design Services" },
  { value: "development", label: "Development" },
  { value: "marketing", label: "Marketing" },
  { value: "consulting", label: "Consulting" },
  { value: "maintenance", label: "Maintenance" },
  { value: "subscription", label: "Subscription" },
  { value: "other", label: "Other" }
];

// Expense categories
export const expenseCategories = [
  { value: "rent", label: "Rent & Utilities" },
  { value: "salaries", label: "Salaries & Benefits" },
  { value: "software", label: "Software & Tools" },
  { value: "hardware", label: "Hardware & Equipment" },
  { value: "marketing", label: "Marketing & Advertising" },
  { value: "office", label: "Office Supplies" },
  { value: "travel", label: "Travel & Entertainment" },
  { value: "professional", label: "Professional Services" },
  { value: "taxes", label: "Taxes & Insurance" },
  { value: "other", label: "Other" }
];

// Subscription frequency options
export const frequencyOptions = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "biannually", label: "Bi-annually" },
  { value: "annually", label: "Annually" }
];

// Quote status options
export const quoteStatusOptions = [
  { value: "Pending", label: "Pending Approval" },
  { value: "Accepted", label: "Accepted" },
  { value: "Declined", label: "Declined" }
];

// Business types for clients
export const businessTypes = [
  { value: "Marketing Agency", label: "Marketing Agency" },
  { value: "Design Studio", label: "Design Studio" },
  { value: "Software House", label: "Software House" },
  { value: "Architecture Firm", label: "Architecture Firm" },
  { value: "Media Company", label: "Media Company" },
  { value: "Small Business", label: "Small Business" },
  { value: "Freelancer", label: "Freelancer" },
  { value: "Other", label: "Other" }
];

// Date range options
export const dateRanges = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
  { value: "365", label: "Past year" },
  { value: "custom", label: "Custom range" }
];

// Chart color palette
export const chartColors = {
  revenue: "#22C55E", // green
  expenses: "#EF4444", // red
  profit: "#7764E4", // primary
  accepted: "#16A34A", // green-600
  declined: "#DC2626", // red-600
  pending: "#F59E0B", // amber-500
};

// Bank/payment accounts
export const bankAccounts = [
  { value: "default", label: "Default Account", icon: "wallet" },
  { value: "chase", label: "Chase Bank", icon: "chase" },
  { value: "bankofamerica", label: "Bank of America", icon: "bankofamerica" },
  { value: "wells_fargo", label: "Wells Fargo", icon: "wells_fargo" },
  { value: "citibank", label: "Citibank", icon: "citibank" },
  { value: "hsbc", label: "HSBC", icon: "hsbc" },
  { value: "paypal", label: "PayPal", icon: "paypal" },
  { value: "stripe", label: "Stripe", icon: "stripe" },
  { value: "square", label: "Square", icon: "square" },
  { value: "transferwise", label: "Wise (TransferWise)", icon: "transferwise" },
  { value: "revolut", label: "Revolut", icon: "revolut" },
  { value: "venmo", label: "Venmo", icon: "venmo" },
  { value: "cash", label: "Cash", icon: "banknote" },
  { value: "other", label: "Other Account", icon: "landmark" }
];
