import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Treinos from "@/pages/Treinos";

vi.mock("@/components/layout/Header", () => ({
  default: () => <div>header</div>,
}));

vi.mock("@/components/layout/BottomNav", () => ({
  default: () => <div>bottom-nav</div>,
}));

vi.mock("@/components/WhatsAppFAB", () => ({
  default: () => null,
}));

vi.mock("@/components/modals/EquipmentModal", () => ({
  default: () => null,
}));

vi.mock("@/components/modals/MyWorkoutsModal", () => ({
  default: () => null,
}));

vi.mock("@/components/modals/DailyWorkoutModal", () => ({
  default: () => null,
}));

vi.mock("@/components/modals/CreateWorkoutModal", () => ({
  default: () => null,
}));

vi.mock("@/hooks/useEquipment", () => ({
  useEquipment: () => ({
    isLoading: false,
    categories: ["forca"],
    equipment: [
      {
        id: "eq-1",
        name: "Barra paralela",
        category: "forca",
        muscles: ["peito", "triceps"],
        image_url: null,
      },
    ],
  }),
}));

describe("Treinos smoke", () => {
  it("renders workout entry points and equipment catalog", () => {
    render(
      <MemoryRouter>
        <Treinos />
      </MemoryRouter>,
    );

    expect(screen.getByText("Escolha seu fluxo.")).toBeInTheDocument();
    expect(screen.getByText("Meus treinos")).toBeInTheDocument();
    expect(screen.getByText("Barra paralela")).toBeInTheDocument();
  });
});
