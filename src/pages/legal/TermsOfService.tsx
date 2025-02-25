
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfService() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Terms of Service</CardTitle>
          <CardDescription>Last updated: March 2024</CardDescription>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <h2 className="text-2xl font-semibold mt-6">1. Acceptance of Terms</h2>
          <p className="my-4">
            By accessing and using JobHub, you accept and agree to be bound by these Terms of Service.
            If you do not agree to these terms, please do not use our service.
          </p>

          <h2 className="text-2xl font-semibold mt-6">2. Use of Service</h2>
          <p className="my-4">
            You agree to use the service only for lawful purposes and in accordance with these Terms.
            You are responsible for maintaining the security of your account.
          </p>

          <h2 className="text-2xl font-semibold mt-6">3. User Accounts</h2>
          <p className="my-4">
            To use certain features of the service, you must register for an account. You agree to:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Provide accurate information</li>
            <li>Maintain the security of your account</li>
            <li>Promptly update your account information</li>
            <li>Not share your account credentials</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6">4. Intellectual Property</h2>
          <p className="my-4">
            The service and its original content, features, and functionality are owned by
            JobHub and are protected by international copyright, trademark, and other laws.
          </p>

          <h2 className="text-2xl font-semibold mt-6">5. Limitation of Liability</h2>
          <p className="my-4">
            JobHub shall not be liable for any indirect, incidental, special, consequential,
            or punitive damages resulting from your use or inability to use the service.
          </p>

          <h2 className="text-2xl font-semibold mt-6">6. Changes to Terms</h2>
          <p className="my-4">
            We reserve the right to modify these terms at any time. We will notify users
            of any material changes via email or through the service.
          </p>

          <h2 className="text-2xl font-semibold mt-6">7. Contact</h2>
          <p className="my-4">
            If you have any questions about these Terms, please contact us at:
            support@jobhub.com
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
