import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "About — Commerce",
  description: "Learn about our mission and the team behind Commerce.",
};

const VALUES = [
  { title: "Customer first", body: "Every decision starts with the people we serve. Fast support, fair prices, no dark patterns." },
  { title: "Quality you can trust", body: "We vet every product and stand behind it with a hassle-free return policy." },
  { title: "Built to last", body: "Sustainable sourcing and durable goods over throwaway trends." },
];

const STATS = [
  { value: "50k+", label: "Happy customers" },
  { value: "12k+", label: "Products" },
  { value: "99.9%", label: "Uptime" },
  { value: "24/7", label: "Support" },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <section className="text-center">
        <h1 className="text-4xl font-bold text-foreground sm:text-5xl">We make great products easy to find.</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">
          Commerce started with a simple idea: shopping online should be fast, honest, and
          delightful. Today we connect thousands of customers with products they love.
        </p>
      </section>

      <section className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {STATS.map((s) => (
          <Card key={s.label} className="text-center">
            <p className="text-3xl font-bold text-brand-600">{s.value}</p>
            <p className="mt-1 text-sm text-muted">{s.label}</p>
          </Card>
        ))}
      </section>

      <section className="mt-16">
        <h2 className="mb-6 text-2xl font-bold text-foreground">What we stand for</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {VALUES.map((v) => (
            <Card key={v.title}>
              <h3 className="font-semibold text-foreground">{v.title}</h3>
              <p className="mt-2 text-sm text-muted">{v.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-16 rounded-2xl bg-brand-50 p-10 text-center dark:bg-white/5">
        <h2 className="text-2xl font-bold text-foreground">Ready to start shopping?</h2>
        <p className="mt-2 text-muted">Join thousands of customers who shop with us every day.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/products"><Button size="lg">Browse products</Button></Link>
          <Link href="/contact"><Button size="lg" variant="outline">Contact us</Button></Link>
        </div>
      </section>
    </div>
  );
}
