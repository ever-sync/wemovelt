import { supabase } from "@/integrations/supabase/client";

export const deletePushSubscriptionByEndpoint = async (endpoint: string, userId: string) => {
  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("endpoint", endpoint)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
};
