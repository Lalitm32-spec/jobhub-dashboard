import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  recipients: z.string().min(1, "At least one recipient is required"),
  subject: z.string().min(1, "Subject is required"),
  content: z.string().min(1, "Email content is required"),
});

export function BulkEmailForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipients: "",
      subject: "",
      content: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const recipients = values.recipients.split('\n').filter(email => email.trim());
    
    try {
      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to send emails");
        return;
      }

      let successCount = 0;
      let failureCount = 0;

      for (const recipient of recipients) {
        try {
          const { error } = await supabase.functions.invoke('send-cold-email', {
            body: {
              to: recipient.trim(),
              subject: values.subject,
              content: values.content,
            },
          });

          if (error) throw error;
          successCount++;
          
          // Log the email in the job_emails table with user_id
          await supabase.from('job_emails').insert({
            email_id: `cold_email_${Date.now()}`,
            subject: values.subject,
            sender: 'me',
            received_at: new Date().toISOString(),
            email_content: values.content,
            category: 'cold_email',
            user_id: user.id // Add the user_id field
          });

        } catch (error) {
          console.error("Error sending email to", recipient, error);
          failureCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully sent ${successCount} emails`);
      }
      if (failureCount > 0) {
        toast.error(`Failed to send ${failureCount} emails`);
      }

      form.reset();
    } catch (error) {
      console.error("Error in bulk email send:", error);
      toast.error("Failed to send emails");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="recipients"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recipients (one per line)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="john@company.com&#10;jane@company.com&#10;recruiter@company.com"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject Line</FormLabel>
              <FormControl>
                <Input placeholder="Software Engineer Position Application" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Content</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Write your email content here..."
                  className="min-h-[200px]"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full">
          <Send className="mr-2 h-4 w-4" />
          Send Cold Emails
        </Button>
      </form>
    </Form>
  );
}