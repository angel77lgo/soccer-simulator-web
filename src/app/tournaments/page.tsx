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
    if (!confirm("¿Eliminar este torneo?")) return;
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
        eyebrow="Torneos"
        title="Todos los torneos"
        description={`${tournaments.length} ${tournaments.length === 1 ? "torneo en tu espacio" : "torneos en tu espacio"}`}
      >
        <Link href="/tournaments/create">
          <Button className="gap-1.5">
            <Plus className="h-4 w-4" /> Nuevo torneo
          </Button>
        </Link>
      </PageHeader>

      <div className="border-t border-border">
        {loading ? (
          <LoadingSpinner />
        ) : tournaments.length === 0 ? (
          <EmptyState
            icon={Trophy}
            title="No hay torneos aún"
            description="Crea tu primer torneo para empezar."
          >
            <Link href="/tournaments/create">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Crear torneo
              </Button>
            </Link>
          </EmptyState>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 pt-6">
            {tournaments.map((t) => (
              <TournamentListItem
                key={t.id}
                tournament={t}
                deletingId={deletingId}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
