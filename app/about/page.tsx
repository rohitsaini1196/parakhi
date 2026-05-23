import Link from "next/link";

export const metadata = {
  title: "About — Parakhi",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 text-zinc-800 dark:text-zinc-200">
      <nav className="mb-6 text-sm text-zinc-500">
        <Link href="/" className="hover:underline">
          ← Back
        </Link>
      </nav>

      <h1 className="font-serif text-3xl font-semibold tracking-tight">
        About this site
      </h1>

      <section className="mt-6 space-y-4 leading-relaxed">
        <p>
          <span className="font-medium">Parakhi</span> — from{" "}
          <em>parakh</em>, to assay or test the purity of a coin — is an
          open-source civic-tech project that breaks down everyday Indian
          consumer products: how much of the price is raw materials, how much
          is tax, how much is the retailer's margin, and how much went to a
          country other than India. <em>Kya hai andar?</em>
        </p>
        <p>
          Most "AI gives you a number" sites lie with confidence. We don't.
          Every number on this site carries a{" "}
          <span className="font-medium">confidence indicator</span> and a{" "}
          <span className="font-medium">source tier</span>. If we don't know
          something, we say so.
        </p>
      </section>

      <h2 className="mt-10 font-serif text-xl font-semibold">
        How we estimate
      </h2>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
        <li>
          <span className="font-medium">Identify</span> the product — barcode
          via Open Food Facts, URL via Open Graph, or free text via a small
          language-model normalizer.
        </li>
        <li>
          <span className="font-medium">Classify</span> it against one of our
          curated category templates (e.g. "packaged biscuits"). If no template
          fits, we show <em>"category not yet supported"</em> — we do not
          invent breakdowns.
        </li>
        <li>
          <span className="font-medium">Compute</span> the breakdown
          deterministically from the category template — no language model
          touches the numbers. Same template, same product, same answer.
          Reproducible.
        </li>
        <li>
          <span className="font-medium">Cache</span> the result in our DB so
          subsequent queries are free.
        </li>
      </ol>

      <h2 className="mt-10 font-serif text-xl font-semibold">
        Division of labor
      </h2>
      <p className="mt-3 text-sm leading-relaxed">
        We use language models only for the parts where they're robust — text
        normalization and classification. The numbers themselves come from
        category templates plus arithmetic. Specifically:
      </p>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
        <li><span className="font-medium">Template authors</span> set the raw-material composition, origin probabilities, and typical cost bands for a category, citing public sources.</li>
        <li><span className="font-medium">A live data layer</span> keeps the inputs fresh: GST rates from the CBIC HSN schedule, brand-to-parent-country from Wikidata, commodity prices from data.gov.in. No human re-types these.</li>
        <li><span className="font-medium">Code</span> computes the per-product breakdown — labels, ranges, rupee amounts, both scores below, and source tiers.</li>
        <li><span className="font-medium">A small LLM</span> (only on our hosted site) resolves typed queries and picks the matching category. It never sees or sets a number. Self-hosted forks can run fully LLM-free.</li>
      </ul>

      <h2 className="mt-10 font-serif text-xl font-semibold">
        Two scores, two questions
      </h2>
      <p className="mt-3 text-sm leading-relaxed">
        "Made in India" smuggles three different questions into one number. We
        split them.
      </p>

      <h3 className="mt-5 font-medium">
        🇮🇳 Indian Value Capture (the headline)
      </h3>
      <p className="mt-2 text-sm leading-relaxed">
        <span className="font-medium">"Where does my rupee go?"</span> The
        MRP-weighted share that flows to Indian sources across every cost
        bucket — raw materials, packaging, manufacturing, logistics, retailer +
        distributor margin, brand margin, advertising, and brand profit. Each
        bucket is multiplied by its probability of Indian origin.
      </p>
      <p className="mt-2 text-sm leading-relaxed">
        <span className="font-medium">GST is deliberately excluded.</span> Tax
        going to the government is a different question from value reaching
        producers, workers, and retailers — and since GST ranges from 0% (milk)
        to 40% (aerated drinks), including it would distort every cross-category
        comparison. We show GST as its own number instead.
      </p>
      <p className="mt-2 text-sm leading-relaxed">
        IVC is sensitive to things people miss: aluminum cans imported from the
        Middle East, royalty flowing to a foreign parent, specialty enzymes
        from China. When a brand has a known foreign parent (via Wikidata), its
        brand-profit share is attributed abroad automatically.
      </p>

      <h3 className="mt-5 font-medium">
        Composition Made-in-India (the secondary chip)
      </h3>
      <p className="mt-2 text-sm leading-relaxed">
        <span className="font-medium">"What is it physically made of, from where?"</span>{" "}
        Weighted probability of Indian origin across raw materials only, by
        composition share. A bottled water or a Diet Coke scores high here —
        it's mostly Indian water by volume — even when its brand value flows
        abroad. Useful as a sanity check, never the headline.
      </p>

      <h3 className="mt-5 font-medium">🏛️ GST (shown separately)</h3>
      <p className="mt-2 text-sm leading-relaxed">
        The rupees per pack that go to the government as tax, sourced from the
        CBIC HSN→rate schedule. Tier 1, always.
      </p>

      <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        Where we can't justify a foreign share from a public source, we default
        to fully Indian — we'd rather under-claim foreignness than invent it.
      </p>

      <h2 className="mt-10 font-serif text-xl font-semibold">Source tiers</h2>
      <ul className="mt-3 space-y-2 text-sm">
        <li>
          <Dot color="bg-emerald-500" /> <span className="font-medium">Tier 1</span> — Hard data (HSN/GST schedules, government commodity prices, RoC filings).
        </li>
        <li>
          <Dot color="bg-emerald-400" /> <span className="font-medium">Tier 2</span> — Structured open data (Open Food Facts, public industry reports).
        </li>
        <li>
          <Dot color="bg-amber-500" /> <span className="font-medium">Tier 3</span> — Public web sources (brand websites, news, annual reports).
        </li>
        <li>
          <Dot color="bg-orange-500" /> <span className="font-medium">Tier 4</span> — LLM reasoning, always shown with ranges.
        </li>
      </ul>

      <h2 className="mt-10 font-serif text-xl font-semibold">What we don't do</h2>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
        <li>No ads.</li>
        <li>No login, no accounts, no tracking beyond rate-limit hashes.</li>
        <li>No invented breakdowns for products without a template.</li>
        <li>No point estimates where ranges are honest.</li>
      </ul>

      <h2 className="mt-10 font-serif text-xl font-semibold">Open source</h2>
      <p className="mt-3 text-sm leading-relaxed">
        Code, templates, and prompts live on{" "}
        <a href="https://github.com/" className="underline" target="_blank" rel="noreferrer">
          GitHub
        </a>
        . If you spot an error, send a{" "}
        <Link href="/feedback" className="underline">
          correction
        </Link>{" "}
        — we read every one.
      </p>
    </main>
  );
}

function Dot({ color }: { color: string }) {
  return (
    <span className={`mr-1.5 inline-block h-2 w-2 rounded-full ${color}`} />
  );
}
