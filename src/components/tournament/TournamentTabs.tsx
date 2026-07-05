interface TabItem {
  key: "groups" | "bracket" | "standings";
  label: string;
  show: boolean;
}

interface TournamentTabsProps {
  tabs: TabItem[];
  activeTab: "groups" | "bracket" | "standings";
  onTabChange: (tab: "groups" | "bracket" | "standings") => void;
  showViewModeToggle?: boolean;
  viewMode?: "list" | "tree";
  onViewModeChange?: (mode: "list" | "tree") => void;
}

export function TournamentTabs({
  tabs,
  activeTab,
  onTabChange,
  showViewModeToggle = false,
  viewMode = "tree",
  onViewModeChange,
}: TournamentTabsProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-1 rounded-lg bg-secondary p-1">
        {tabs.filter((t) => t.show).map((t) => (
          <button
            key={t.key}
            onClick={() => onTabChange(t.key)}
            className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors ${
              activeTab === t.key
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {showViewModeToggle && onViewModeChange && (
        <div className="flex gap-1 rounded-lg bg-secondary p-1">
          {(["tree", "list"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => onViewModeChange(mode)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                viewMode === mode
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {mode === "tree" ? "Árbol" : "Lista"}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
