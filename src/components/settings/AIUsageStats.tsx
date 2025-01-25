import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Progress } from "@/components/ui/progress";

export function AIUsageStats() {
  const { data: usageData } = useQuery({
    queryKey: ['aiUsage'],
    queryFn: async () => {
      const { data: usage, error } = await supabase
        .from('ai_usage')
        .select('*')
        .order('date', { ascending: true })
        .limit(30);
      
      if (error) throw error;
      return usage || [];
    }
  });

  const totalTokens = usageData?.reduce((acc, curr) => acc + curr.tokens, 0) || 0;
  const monthlyQuota = 100000; // Example quota
  const usagePercentage = Math.min((totalTokens / monthlyQuota) * 100, 100);

  return (
    <div className="space-y-4 pt-4">
      <h4 className="text-sm font-medium">Usage Statistics</h4>
      <Progress value={usagePercentage} className="h-2" />
      <p className="text-sm text-muted-foreground">
        {usagePercentage.toFixed(1)}% of monthly quota used ({totalTokens.toLocaleString()} tokens)
      </p>
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={usageData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="tokens" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}