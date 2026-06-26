"use client";

import { useEffect, useState } from "react";
import { getTournaments, deleteTournament } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Plus, Trophy } from "lucide-react";
import Link from "next/link";
import { TournamentListItem as TournamentListItemType } from "@/types";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { TournamentListItem } from "@/components/tournament/TournamentListItem";

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<TournamentListItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const data = await getTournaments();
    setTournaments(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this tournament?")) return;
    setDeletingId(id);
    try {
      await deleteTournament(id);
      setTournaments((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Tournaments"
        title="All tournaments"
        description={`${tournaments.length} ${tournaments.length === 1 ? "tournament" : "tournaments"} in your workspace`}
      >
        <Link href="/tournaments/create">
          <Button className="gap-1.5">
            <Plus className="h-4 w-4" /> New tournament
          </Button>
        </Link>
      </PageHeader>

      <div className="border-t border-border">
        {loading ? (
          <LoadingSpinner />
        ) : tournaments.length === 0 ? (
          <EmptyState
            icon={Trophy}
            title="No tournaments yet"
            description="Create your first tournament to get started."
          >
            <Link href="/tournaments/create">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Create tournament
              </Button>
            </Link>
          </EmptyState>
        ) : (
          <ul className="divide-y divide-border">
            {tournaments.map((t) => (
              <li key={t.id}>
                <TournamentListItem
                  tournament={t}
                  deletingId={deletingId}
                  onDelete={handleDelete}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
