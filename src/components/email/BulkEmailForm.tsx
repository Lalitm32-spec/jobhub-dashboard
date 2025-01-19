import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  recipients: z.string().min(1, "At least one recipient is required"),
  subject: z.string().min(1, "Subject is required"),
  content: z.string().min(1, "Email content is required"),
});

export function BulkEmailForm() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipients: "",
      subject: "",
      content: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    toast({
      title: "Sending emails...",
      description: "Your bulk emails are being processed.",
    });
    
    // Here you would integrate with your email sending service
    console.log("Sending emails:", values);
    
    form.reset();
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
          Send Bulk Emails
        </Button>
      </form>
    </Form>
  );
}