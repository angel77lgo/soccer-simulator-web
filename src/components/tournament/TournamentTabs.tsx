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
    <div className="flex flex-col gap-4 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
      <nav className="flex gap-6">
        {tabs.filter((t) => t.show).map((t) => (
          <button
            key={t.key}
            onClick={() => onTabChange(t.key)}
            className={`relative pb-1 text-sm font-medium transition-colors ${
              activeTab === t.key
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
            {activeTab === t.key && (
              <span className="absolute -top-px left-0 right-0 h-px bg-foreground" />
            )}
          </button>
        ))}
      </nav>

      {showViewModeToggle && onViewModeChange && (
        <div className="flex gap-1 text-xs">
          {(["tree", "list"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => onViewModeChange(mode)}
              className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
                viewMode === mode
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {mode === "tree" ? "Tree" : "List"}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
