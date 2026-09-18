export const SUPPORT_EMAIL = "FreeMoneySystem@neoai.freshdesk.com"

export const supportRoutes = {
  home: "/support",
  faq: "/support#faq",
} as const

export const support = {
  email: SUPPORT_EMAIL,
  productName: "Free Money Cash",
  pageTitle: "Support",
  pageSubtitle:
    "Help with Free Money Cash — affiliate pages, traffic, training, upgrades, and your account",
  stats: [
    { icon: "clock" as const, label: "Avg response", highlight: "under 2 hours" },
    { icon: "star" as const, label: "4.9/5 support rating" },
    { icon: "shield" as const, label: "98% satisfaction rate" },
  ],
  refundPolicy: {
    title: "Refund Policy",
    subtitle: "Satisfaction guarantee for Free Money Cash",
    items: [
      {
        title: "30-Day Guarantee",
        body: "Full refund available within 30 days of purchase. No questions asked.",
      },
      {
        title: "Request Procedure",
        body: `Email our support team at ${SUPPORT_EMAIL} with your account email and purchase date. We will confirm receipt and begin processing.`,
      },
      {
        title: "Processing Timeline",
        body: "Refunds are typically processed within 5–7 business days. You will receive confirmation once complete.",
      },
    ],
  },
} as const
