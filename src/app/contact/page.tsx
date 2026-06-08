import { Card } from "@/components/ui/Card";
import { ContactForm } from "@/components/ContactForm";

export const metadata = {
  title: "Contact — Commerce",
  description: "Get in touch with the Commerce team.",
};

const CHANNELS = [
  { label: "Email", value: "support@commerce.example" },
  { label: "Phone", value: "+1 (555) 012-3456" },
  { label: "Hours", value: "Mon–Fri, 9am–6pm ET" },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="text-4xl font-bold text-foreground">Get in touch</h1>
      <p className="mt-2 text-muted">Questions, feedback, or order help — we&apos;re here.</p>

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-1">
          {CHANNELS.map((c) => (
            <Card key={c.label}>
              <p className="text-sm text-muted">{c.label}</p>
              <p className="mt-1 font-medium text-foreground">{c.value}</p>
            </Card>
          ))}
        </div>
        <Card className="lg:col-span-2">
          <ContactForm />
        </Card>
      </div>
    </div>
  );
}
