import type { Blog, BlogMetrics } from "@/types/blogs"

export const mockBlogs: Blog[] = [
  {
    id: "1",
    title: "The Ultimate Guide to Building a Skincare Routine",
    slug: "ultimate-guide-skincare-routine",
    description:
      "Everything you need to know about building a consistent, effective skincare routine tailored to your skin's unique needs.",
    body: `<h2>Why a Routine Matters</h2><p>Consistency is the cornerstone of great skin. A well-structured routine ensures your skin receives the right actives at the right time, morning and night.</p><h2>The Core Steps</h2><ul><li><strong>Cleanse</strong> – Remove dirt, oil, and makeup without stripping the skin barrier.</li><li><strong>Tone</strong> – Balance pH and prep skin for the next step.</li><li><strong>Treat</strong> – Apply serums targeting your specific concerns (dark spots, acne, ageing).</li><li><strong>Moisturise</strong> – Lock in hydration and strengthen the barrier.</li><li><strong>Protect</strong> – Sunscreen is non-negotiable every morning.</li></ul><p>Start simple with three products and build from there as your skin adjusts.</p>`,
    author: "Amara Osei",
    status: "published",
    createdAt: "2026-01-10T08:00:00Z",
    publishedAt: "2026-01-12T09:00:00Z",
    tags: ["skincare", "routine", "beginners"],
  },
  {
    id: "2",
    title: "Understanding Your Skin Type: A Complete Breakdown",
    slug: "understanding-skin-type-breakdown",
    description:
      "Dry, oily, combination, or sensitive? Learn how to identify your true skin type and choose products that actually work.",
    body: `<h2>The Five Skin Types</h2><p>Most people fall into one of five categories: normal, oily, dry, combination, or sensitive. Understanding where you land changes everything about how you shop for skincare.</p><h2>How to Test at Home</h2><p>The bare-face test: cleanse your face, wait one hour without applying anything, then observe. Shine all over = oily. Tight and flaky = dry. Shiny T-zone only = combination. Redness or itching = sensitive.</p><p>Knowing your skin type is step one — from here, every product choice becomes clearer.</p>`,
    author: "Nkechi Adeyemi",
    status: "published",
    createdAt: "2026-01-18T10:30:00Z",
    publishedAt: "2026-01-20T08:00:00Z",
    tags: ["skin type", "oily skin", "dry skin"],
  },
  {
    id: "3",
    title: "The Science Behind Vitamin C in Skincare",
    slug: "science-behind-vitamin-c-skincare",
    description:
      "Vitamin C is one of the most researched skincare ingredients. Here's what the science actually says about its brightening and anti-ageing benefits.",
    body: `<h2>What Makes Vitamin C Special?</h2><p>L-Ascorbic acid (pure Vitamin C) is a potent antioxidant that neutralises free radicals caused by UV exposure and pollution. It also inhibits melanin production, making it a powerful brightening agent.</p><h2>Stability Challenges</h2><p>Vitamin C is notoriously unstable. It oxidises on exposure to air and light, turning orange or brown. Look for formulas in airless pumps or opaque packaging, and store them away from sunlight.</p><h2>Concentration Guide</h2><p>Beginners: 5–10%. Intermediate: 15%. Advanced: 20%+. Higher is not always better — start low to avoid irritation.</p>`,
    author: "Amara Osei",
    status: "published",
    createdAt: "2026-02-03T09:00:00Z",
    publishedAt: "2026-02-05T09:00:00Z",
    tags: ["vitamin C", "brightening", "ingredients"],
  },
  {
    id: "4",
    title: "How to Layer Skincare Products for Maximum Efficacy",
    slug: "how-to-layer-skincare-products",
    description:
      "Applying products in the wrong order can reduce their effectiveness or cause irritation. Learn the golden rules of product layering.",
    body: `<h2>The Thin-to-Thick Rule</h2><p>Always apply products from lightest to heaviest consistency. This allows each formula to penetrate the skin without being blocked by a heavier product applied first.</p><h2>The Correct Order</h2><ol><li>Water-based cleanser</li><li>Toner / essence</li><li>Watery serums (e.g. Hyaluronic Acid)</li><li>Active serums (Vitamin C, Niacinamide, Retinol)</li><li>Eye cream</li><li>Moisturiser</li><li>Face oil (seals everything in)</li><li>SPF (AM only)</li></ol><p>Wait 30–60 seconds between layers to allow absorption.</p>`,
    author: "Fatima Bello",
    status: "draft",
    createdAt: "2026-02-14T11:00:00Z",
    tags: ["layering", "routine", "tips"],
  },
  {
    id: "5",
    title: "Retinol 101: Benefits, Side Effects, and How to Start",
    slug: "retinol-101-benefits-side-effects",
    description:
      "Retinol is the gold standard for anti-ageing, but it can be intimidating. This guide walks you through everything from choosing a strength to managing the adjustment period.",
    body: `<h2>What Is Retinol?</h2><p>Retinol is a derivative of Vitamin A. It accelerates cell turnover, stimulates collagen production, and reduces the appearance of fine lines, wrinkles, and dark spots over time.</p><h2>The Purge Period</h2><p>Many new users experience increased breakouts, dryness, and peeling in the first 4–6 weeks. This is normal — it means the product is working. Introduce retinol slowly: twice a week, then every other night, then nightly.</p><h2>Golden Rules</h2><ul><li>Always use SPF the next morning.</li><li>Do not mix with Vitamin C or AHA/BHAs in the same routine step.</li><li>Moisturiser before retinol ("sandwich method") reduces irritation for beginners.</li></ul>`,
    author: "Nkechi Adeyemi",
    status: "published",
    createdAt: "2026-02-20T14:00:00Z",
    publishedAt: "2026-02-22T08:00:00Z",
    tags: ["retinol", "anti-ageing", "ingredients"],
  },
  {
    id: "6",
    title: "SPF Demystified: Why Sunscreen Is Your Best Anti-Ageing Product",
    slug: "spf-demystified-why-sunscreen-is-essential",
    description:
      "Up to 80% of visible skin ageing is caused by UV exposure. Here's why daily sunscreen use is the most impactful thing you can do for your skin.",
    body: `<h2>UVA vs UVB</h2><p>UVB rays cause sunburn. UVA rays penetrate deeper, causing premature ageing, hyperpigmentation, and increasing the risk of skin cancer. You need broad-spectrum protection against both.</p><h2>What SPF Actually Means</h2><p>SPF 30 blocks ~97% of UVB rays. SPF 50 blocks ~98%. The difference is small but matters over a lifetime of daily exposure. For everyday use, SPF 30–50 is sufficient.</p><h2>Chemical vs Mineral</h2><p>Chemical sunscreens absorb UV radiation and convert it to heat. Mineral sunscreens (zinc oxide, titanium dioxide) create a physical barrier. Both work — the best SPF is the one you'll wear every day.</p>`,
    author: "Amara Osei",
    status: "published",
    createdAt: "2026-03-01T09:00:00Z",
    publishedAt: "2026-03-03T08:00:00Z",
    tags: ["SPF", "sunscreen", "anti-ageing"],
  },
  {
    id: "7",
    title: "Dealing With Hyperpigmentation: What Actually Works",
    slug: "dealing-with-hyperpigmentation",
    description:
      "Dark spots, post-acne marks, and uneven skin tone are among the most common skin concerns. Here's a science-backed guide to treating them.",
    body: `<h2>Types of Hyperpigmentation</h2><p>Post-inflammatory hyperpigmentation (PIH) follows acne or injury. Melasma is hormonal. Sun spots result from chronic UV exposure. Each type responds differently to treatment.</p><h2>Proven Ingredients</h2><ul><li><strong>Vitamin C</strong> – Inhibits melanin production</li><li><strong>Niacinamide</strong> – Reduces melanin transfer to skin cells</li><li><strong>Alpha Arbutin</strong> – Gentle brightener, suitable for most skin types</li><li><strong>Kojic Acid</strong> – Derived from fungi, effective for stubborn spots</li><li><strong>Azelaic Acid</strong> – Anti-inflammatory and brightening, great for sensitive skin</li></ul><p>Consistency is key — most brightening treatments take 8–12 weeks to show visible results. Always pair with SPF or you're undoing your progress daily.</p>`,
    author: "Fatima Bello",
    status: "draft",
    createdAt: "2026-03-10T13:00:00Z",
    tags: ["hyperpigmentation", "dark spots", "brightening"],
  },
  {
    id: "8",
    title: "The eBuy Edit: Our Best-Selling Products of Q1 2026",
    slug: "ebuy-edit-best-selling-q1-2026",
    description:
      "A curated roundup of the products our customers loved most this quarter — with honest reviews and tips on how to get the most out of each one.",
    body: `<h2>No. 1 — Barrier Repair Moisturiser</h2><p>Our top seller three quarters running. Rich but non-greasy, it works for all skin types and has become a cult staple. Apply as the final step in your PM routine.</p><h2>No. 2 — Brightening Serum with 15% Vitamin C</h2><p>Customers report visible improvement in radiance within two weeks. Key tip: store in a cool, dark place and use within three months of opening.</p><h2>No. 3 — Hydrating Toner</h2><p>A lightweight first step that preps skin beautifully for everything that follows. Works as a standalone hydration boost or as a toner replacement.</p>`,
    author: "Amara Osei",
    status: "archived",
    createdAt: "2026-04-01T10:00:00Z",
    publishedAt: "2026-04-02T08:00:00Z",
    tags: ["product roundup", "bestsellers"],
  },
  {
    id: "9",
    title: "Niacinamide: The Multitasking Ingredient Your Skin Needs",
    slug: "niacinamide-multitasking-skincare-ingredient",
    description:
      "Niacinamide does it all — reduces pores, fades dark spots, strengthens the barrier, and controls oil. Find out why it deserves a permanent spot in your routine.",
    body: `<h2>What Is Niacinamide?</h2><p>Niacinamide is the active form of Vitamin B3. It's water-soluble, highly stable, and well-tolerated by almost all skin types, including sensitive skin.</p><h2>Key Benefits</h2><ul><li>Minimises the appearance of pores</li><li>Reduces sebum production (great for oily skin)</li><li>Fades post-acne marks and dark spots</li><li>Strengthens the skin barrier</li><li>Improves skin texture and smoothness</li></ul><h2>How to Use It</h2><p>Apply a 5–10% niacinamide serum after toning, morning or evening. It pairs well with most actives — including Vitamin C (despite popular myth to the contrary).</p>`,
    author: "Nkechi Adeyemi",
    status: "draft",
    createdAt: "2026-04-04T11:00:00Z",
    tags: ["niacinamide", "ingredients", "oily skin"],
  },
  {
    id: "10",
    title: "Skincare in Your 30s: What Changes and How to Adapt",
    slug: "skincare-in-your-30s",
    description:
      "Your 30s bring real changes to skin — slower cell turnover, early signs of ageing, and shifting hormones. Here's how to update your routine to meet your skin where it is.",
    body: `<h2>What Happens in Your 30s</h2><p>Collagen production starts declining at about 1% per year from your mid-20s. By your 30s, you may notice fine lines, dullness, and slower recovery from breakouts or irritation.</p><h2>Ingredients to Add</h2><ul><li><strong>Retinol</strong> – Start in your early 30s at a low concentration</li><li><strong>Peptides</strong> – Support collagen synthesis</li><li><strong>Hyaluronic Acid</strong> – Skin holds less moisture with age</li><li><strong>Antioxidants</strong> – Protect against environmental damage</li></ul><h2>Don't Overcomplicate It</h2><p>The temptation is to add everything at once. Resist it. Introduce one new active at a time, monitor your skin's response, and build from there. A simple, consistent routine outperforms a complicated one every time.</p>`,
    author: "Fatima Bello",
    status: "archived",
    createdAt: "2026-03-25T09:30:00Z",
    publishedAt: "2026-03-26T08:00:00Z",
    tags: ["ageing", "30s skincare", "collagen"],
  },
]

export const mockBlogMetrics: BlogMetrics = {
  total: 10,
  published: 5,
  drafts: 3,
  archived: 2,
}
