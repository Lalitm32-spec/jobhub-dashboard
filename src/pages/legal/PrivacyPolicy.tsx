
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Privacy Policy</CardTitle>
          <CardDescription>Last updated: March 2024</CardDescription>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <h2 className="text-2xl font-semibold mt-6">1. Information We Collect</h2>
          <p className="my-4">
            We collect information that you provide directly to us, including when you:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Create an account</li>
            <li>Use our job application tracking features</li>
            <li>Connect your email account</li>
            <li>Contact our support team</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6">2. How We Use Your Information</h2>
          <p className="my-4">
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Provide and maintain our services</li>
            <li>Track your job applications</li>
            <li>Improve our services</li>
            <li>Send you important updates</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6">3. Data Security</h2>
          <p className="my-4">
            We implement appropriate security measures to protect your personal information.
            However, no method of transmission over the internet is 100% secure.
          </p>

          <h2 className="text-2xl font-semibold mt-6">4. Your Rights</h2>
          <p className="my-4">
            You have the right to:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Withdraw consent for data processing</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6">5. Contact Us</h2>
          <p className="my-4">
            If you have any questions about this Privacy Policy, please contact us at:
            support@jobhub.com
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
