import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Comunidade from "@/pages/Comunidade";

vi.mock("@/components/layout/Header", () => ({
  default: () => <div>header</div>,
}));

vi.mock("@/components/layout/BottomNav", () => ({
  default: () => <div>bottom-nav</div>,
}));

vi.mock("@/components/WhatsAppFAB", () => ({
  default: () => null,
}));

vi.mock("@/components/modals/PostModal", () => ({
  default: () => null,
}));

vi.mock("@/components/modals/CommentsModal", () => ({
  default: () => null,
}));

vi.mock("@/components/PostCard", () => ({
  default: ({ post }: { post: { content: string } }) => <article>{post.content}</article>,
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "user-1" },
  }),
}));

vi.mock("@/hooks/usePosts", () => ({
  usePosts: () => ({
    posts: [
      {
        id: "post-1",
        user_id: "user-1",
        content: "Primeiro treino finalizado.",
        image_url: null,
        likes_count: 3,
        comments_count: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        profiles: null,
        user_has_liked: false,
      },
    ],
    isLoading: false,
    isFetching: false,
    error: null,
    hasNextPage: false,
    fetchNextPage: vi.fn(),
    createPost: vi.fn(),
    isCreating: false,
    deletePost: vi.fn(),
    isDeleting: false,
    toggleLike: vi.fn(),
    isTogglingLike: false,
  }),
}));

describe("Comunidade smoke", () => {
  it("renders feed shell and post list", () => {
    render(
      <MemoryRouter>
        <Comunidade />
      </MemoryRouter>,
    );

    expect(screen.getByText("Compartilhe seu movimento.")).toBeInTheDocument();
    expect(screen.getByText("Primeiro treino finalizado.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Novo post" })).toBeInTheDocument();
  });
});
