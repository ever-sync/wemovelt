import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useGoogleMapsKey = () => {
  const { data: apiKey, isLoading } = useQuery({
    queryKey: ["google-maps-key"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("get-maps-key");
      if (error) throw error;
      return data?.apiKey as string | null;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: 1,
  });

  return { apiKey: apiKey ?? null, isLoading };
};
