import { BulkEmailForm } from "@/components/email/BulkEmailForm";

export function EmailCompose() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Compose Email</h1>
        <p className="text-muted-foreground">
          Write and send your cold emails
        </p>
      </div>
      <BulkEmailForm />
    </div>
  );
}