import CreditPackChooser from "@/components/billing/CreditPackChooser";

export default function CreditPurchaseBanner() {
  return (
    <section className="border-b border-[color:var(--color-coral-soft)] bg-[color:var(--color-bg-tinted-coral)]">
      <div className="mx-auto max-w-6xl px-6 py-5 sm:px-8">
        <CreditPackChooser compact />
      </div>
    </section>
  );
}
