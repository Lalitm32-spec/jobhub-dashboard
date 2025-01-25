import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, CheckCircle, CreditCard, DollarSign, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Subscription = {
  plan_type: 'trial' | 'basic' | 'pro' | 'enterprise';
  trial_start_date: string;
  trial_end_date: string;
  is_active: boolean;
}

export function SubscriptionTabContent() {
  const { data: subscription, isLoading, error } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .maybeSingle();
      
      if (error) throw error;
      return data as Subscription | null;
    },
  });

  const getPlanDetails = (planType: Subscription['plan_type']) => {
    switch (planType) {
      case 'trial':
        return {
          name: 'Trial Plan',
          description: 'Free 3-day trial to explore all features',
          features: ['Limited API calls', 'Basic support', 'Core features'],
        };
      case 'basic':
        return {
          name: 'Basic Plan',
          description: 'Perfect for individual job seekers',
          features: ['100 API calls/month', 'Email support', 'Core features'],
        };
      case 'pro':
        return {
          name: 'Pro Plan',
          description: 'For power users',
          features: ['Unlimited API calls', 'Priority support', 'Advanced features'],
        };
      case 'enterprise':
        return {
          name: 'Enterprise Plan',
          description: 'Custom solutions for teams',
          features: ['Custom API limits', '24/7 support', 'Custom features'],
        };
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load subscription details. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (!subscription) {
    return (
      <Alert>
        <AlertDescription>
          No subscription found. Please contact support if you believe this is an error.
        </AlertDescription>
      </Alert>
    );
  }

  const planDetails = getPlanDetails(subscription.plan_type);
  const isTrialExpired = subscription.plan_type === 'trial' && 
    new Date(subscription.trial_end_date) < new Date();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Current Plan
          </CardTitle>
          <CardDescription>Manage your subscription plan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
            <div className="space-y-1">
              <h3 className="font-semibold">{planDetails.name}</h3>
              <p className="text-sm text-muted-foreground">{planDetails.description}</p>
            </div>
            <div className="flex items-center gap-2">
              {subscription.is_active ? (
                <CheckCircle className="h-5 w-5 text-success" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive" />
              )}
              <span className={subscription.is_active ? "text-success" : "text-destructive"}>
                {subscription.is_active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          {subscription.plan_type === 'trial' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <CalendarDays className="h-4 w-4" />
                <span>
                  Trial ends on {format(new Date(subscription.trial_end_date), 'PPP')}
                </span>
              </div>
              {isTrialExpired && (
                <div className="text-destructive text-sm">
                  Your trial has expired. Please upgrade to continue using all features.
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <h4 className="font-medium">Plan Features:</h4>
            <ul className="space-y-2">
              {planDetails.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-success" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <Button className="w-full" variant="outline">
              <CreditCard className="mr-2 h-4 w-4" />
              Manage Billing
            </Button>
            {subscription.plan_type === 'trial' && (
              <Button className="w-full">
                Upgrade Plan
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}