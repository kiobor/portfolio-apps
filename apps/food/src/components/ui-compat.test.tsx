import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QuantityStepper, SegmentedToggle, TabBar } from "@portfolio/ui";

describe("TabBar", () => {
  it("with 3 items renders three buttons in a 3-column grid", () => {
    render(
      <TabBar
        items={[
          { id: "a", label: "Search", icon: null },
          { id: "b", label: "Trips", icon: null },
          { id: "c", label: "Account", icon: null },
        ]}
        activeId="a"
        onChange={() => {}}
      />,
    );
    expect(screen.getAllByRole("button")).toHaveLength(3);
    expect(screen.getByRole("list")).toHaveStyle({ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" });
  });
});

describe("SegmentedToggle", () => {
  it("text variant shows visible labels", () => {
    render(
      <SegmentedToggle
        variant="text"
        label="Trip type"
        value="one"
        onChange={() => {}}
        options={[
          { value: "one", label: "One way" },
          { value: "round", label: "Round trip" },
        ]}
      />,
    );
    expect(screen.getByText("One way")).toBeVisible();
    expect(screen.getByText("Round trip")).toBeVisible();
    expect(screen.getByRole("button", { name: "One way" })).toHaveAttribute("aria-pressed", "true");
  });
});

describe("QuantityStepper", () => {
  it("disables add at max and remove at min", async () => {
    const onAdd = vi.fn();
    const onRemove = vi.fn();
    render(<QuantityStepper quantity={1} min={1} max={1} name="adult" onAdd={onAdd} onRemove={onRemove} />);
    const add = screen.getByRole("button", { name: "Add another adult" });
    const remove = screen.getByRole("button", { name: "Remove one adult" });
    expect(add).toBeDisabled();
    expect(remove).toBeDisabled();
    await userEvent.click(add);
    await userEvent.click(remove);
    expect(onAdd).not.toHaveBeenCalled();
    expect(onRemove).not.toHaveBeenCalled();
  });

  it("uses custom labels", () => {
    render(
      <QuantityStepper
        quantity={2}
        name="adult"
        min={1}
        labels={{ add: "More adults", remove: "Fewer adults", quantity: "Adults" }}
        onAdd={() => {}}
        onRemove={() => {}}
      />,
    );
    expect(screen.getByRole("group", { name: "Adults" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "More adults" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Fewer adults" })).toBeInTheDocument();
  });
});
