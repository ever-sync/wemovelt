import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { postContentSchema, imageFileSchema, validateOrThrow } from "@/lib/validations";
import { sanitizeText } from "@/lib/sanitize";

const PAGE_SIZE = 10;
const STALE_TIME = 1000 * 30;

export interface PostProfile {
  id: string;
  name: string;
  username: string | null;
  avatar_url: string | null;
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  profiles: PostProfile | null;
  user_has_liked?: boolean;
}

type FeedPostRow = Database["public"]["Functions"]["get_posts_feed"]["Returns"][number];
const PROFILES_PUBLIC_TABLE = "profiles_public" as unknown as "profiles";

const fetchProfileForUser = async (userId: string): Promise<PostProfile | null> => {
  const { data, error } = await supabase
    .from(PROFILES_PUBLIC_TABLE)
    .select("id, name, username, avatar_url")
    .eq("id", userId)
    .single();

  if (error || !data) return null;
  return data as unknown as PostProfile;
};

const normalizePost = (post: FeedPostRow): Post => {
  const createdAt = post.created_at ?? new Date().toISOString();
  const updatedAt = post.updated_at ?? createdAt;

  return {
    id: post.id,
    user_id: post.user_id,
    content: post.content,
    image_url: post.image_url,
    likes_count: post.likes_count,
    comments_count: post.comments_count,
    created_at: createdAt,
    updated_at: updatedAt,
    profiles: post.profile_id
      ? {
          id: post.profile_id,
          name: post.profile_name ?? "Usuario",
          username: post.profile_username,
          avatar_url: post.profile_avatar_url,
        }
      : null,
    user_has_liked: post.user_has_liked,
  };
};

export const usePosts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ["posts", user?.id ?? "anon"],
    queryFn: async ({ pageParam = 0 }) => {
      const { data: posts, error } = await supabase.rpc("get_posts_feed", {
        p_limit: PAGE_SIZE,
        p_offset: pageParam * PAGE_SIZE,
      });

      if (error) throw error;
      return (posts ?? []).map(normalizePost);
    },
    getNextPageParam: (lastPage, pages) => {
      return lastPage.length === PAGE_SIZE ? pages.length : undefined;
    },
    initialPageParam: 0,
    staleTime: STALE_TIME,
  });

  const posts = data?.pages.flat() ?? [];

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!user) return null;

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { error } = await supabase.storage.from("post-images").upload(filePath, file);
    if (error) throw error;

    const { data } = supabase.storage.from("post-images").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const createPostMutation = useMutation({
    mutationFn: async ({ content, imageFile }: { content: string; imageFile?: File | null }) => {
      if (!user) throw new Error("Usuario nao autenticado");

      const sanitizedContent = sanitizeText(content);
      validateOrThrow(postContentSchema, sanitizedContent);

      if (imageFile) {
        validateOrThrow(imageFileSchema, {
          size: imageFile.size,
          type: imageFile.type,
        });
      }

      let imageUrl: string | null = null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const { data, error } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          content: sanitizedContent,
          image_url: imageUrl,
        })
        .select()
        .single();

      if (error) throw error;

      const profile = await fetchProfileForUser(user.id);

      return {
        ...data,
        created_at: data.created_at ?? new Date().toISOString(),
        updated_at: data.updated_at ?? data.created_at ?? new Date().toISOString(),
        profiles: profile,
        user_has_liked: false,
      } as Post;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast({
        title: "Post publicado!",
        description: "Seu post foi compartilhado com a comunidade.",
      });
    },
    onError: (error) => {
      console.error("Error creating post:", error);
      toast({
        title: "Erro ao publicar",
        description: "Nao foi possivel criar o post. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      if (!user) throw new Error("Usuario nao autenticado");

      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", postId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast({
        title: "Post excluido",
        description: "O post foi removido.",
      });
    },
    onError: (error) => {
      console.error("Error deleting post:", error);
      toast({
        title: "Erro ao excluir",
        description: "Nao foi possivel excluir o post.",
        variant: "destructive",
      });
    },
  });

  const toggleLikeMutation = useMutation({
    mutationFn: async (postId: string) => {
      if (!user) throw new Error("Usuario nao autenticado");

      const { data: existing } = await supabase
        .from("post_likes")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .single();

      if (existing) {
        const { error } = await supabase.from("post_likes").delete().eq("id", existing.id);
        if (error) throw error;
        return { action: "unliked" as const };
      }

      const { error } = await supabase.from("post_likes").insert({ post_id: postId, user_id: user.id });
      if (error) throw error;
      return { action: "liked" as const };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      if (result.action === "liked") {
        toast({
          title: "Curtido",
          duration: 1500,
        });
      }
    },
    onError: (error) => {
      console.error("Error toggling like:", error);
    },
  });

  return {
    posts,
    isLoading,
    isFetching,
    error,
    hasNextPage,
    fetchNextPage,
    createPost: createPostMutation.mutateAsync,
    isCreating: createPostMutation.isPending,
    deletePost: deletePostMutation.mutateAsync,
    isDeleting: deletePostMutation.isPending,
    toggleLike: toggleLikeMutation.mutate,
    isTogglingLike: toggleLikeMutation.isPending,
  };
};
