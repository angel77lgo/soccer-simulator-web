"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Play, FastForward, Swords, Crown } from "lucide-react";
import {
  getTournamentStatus,
  getTournamentStandings,
  getTournamentBracket,
  generateGroupMatches,
  simulateGroupStage,
  generateKnockoutBracket,
  simulateKnockoutRound,
  getTournamentGroupMatches,
  getTournamentLeaguePhase,
  updateMatchScore,
} from "@/lib/api";
import { StandingRow, GroupData, GroupMatch, BracketMatch, TournamentData, MatchSaveData } from "@/types";
import { phaseLabels, phaseOrder, statusLabels } from "@/lib/constants";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { GroupMatchCard } from "@/components/tournament/GroupMatchCard";
import { BracketMatchCard } from "@/components/tournament/BracketMatchCard";
import { BracketNode } from "@/components/tournament/BracketNode";
import { GroupTable } from "@/components/tournament/GroupTable";
import { ChampionOverlay } from "@/components/tournament/ChampionOverlay";
import { TournamentTabs } from "@/components/tournament/TournamentTabs";

export default function TournamentDashboard() {
  const params = useParams();
  const tournamentId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [tournament, setTournament] = useState<TournamentData | null>(null);
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [bracket, setBracket] = useState<Record<string, BracketMatch[]>>({});
  const [groupMatches, setGroupMatches] = useState<GroupMatch[]>([]);
  const [leagueStandings, setLeagueStandings] = useState<StandingRow[]>([]);
  const [leagueMatches, setLeagueMatches] = useState<GroupMatch[]>([]);

  const [activeTab, setActiveTab] = useState<"groups" | "bracket" | "standings">("groups");
  const [viewMode, setViewMode] = useState<"list" | "tree">("tree");
  const [showChampion, setShowChampion] = useState(false);
  const championDismissed = useRef(false);

  const fetchData = async () => {
    try {
      const [status, standings, bracketData, groupMatchesData] = await Promise.all([
        getTournamentStatus(tournamentId),
        getTournamentStandings(tournamentId),
        getTournamentBracket(tournamentId),
        getTournamentGroupMatches(tournamentId),
      ]);
      setTournament(status);
      setGroups(Array.isArray(standings) ? standings : []);
      setBracket(bracketData || {});
      setGroupMatches(groupMatchesData || []);

      if (status?.hasLeaguePhase) {
        const league = await getTournamentLeaguePhase(tournamentId);
        setLeagueStandings(league?.standings ?? []);
        setLeagueMatches(league?.matches ?? []);
      } else {
        setLeagueStandings([]);
        setLeagueMatches([]);
      }

      if (status?.status === "finished" && !championDismissed.current) setShowChampion(true);
    } catch (e) {
      console.error("Failed to fetch tournament data", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMatchScore = async (matchId: string, data: MatchSaveData) => {
    try {
      await updateMatchScore(matchId, data);
      await fetchData();
    } catch (e) {
      console.error("Failed to update match score", e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tournamentId]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasGroupMatches = groups.length > 0 && groups[0]?.standings?.length > 0;
  const hasLeaguePhase = tournament?.hasLeaguePhase === true;
  const allLeagueMatchesFinished =
    hasLeaguePhase && leagueMatches.length > 0 && leagueMatches.every((m) => m.status === "finished");
  const allGroupsFinished = hasGroupMatches && groups.every((g) => g.standings.every((s) => s.played >= 3));
  const bracketPhases = phaseOrder.filter((p) => bracket[p]?.length > 0);
  const isFinished = tournament?.status === "finished";

  useEffect(() => {
    if (loading) return;
    if (!hasGroupMatches && !hasLeaguePhase && bracketPhases.length > 0) {
      setActiveTab("bracket");
    }
  }, [loading, hasGroupMatches, hasLeaguePhase, bracketPhases.length]);

  const handleGenerateMatches = async () => {
    setSimulating(true);
    try { await generateGroupMatches(tournamentId); await fetchData(); }
    finally { setSimulating(false); }
  };

  const handleSimulateGroups = async () => {
    setSimulating(true);
    try { await simulateGroupStage(tournamentId); await fetchData(); }
    finally { setSimulating(false); }
  };

  const handleGenerateKnockout = async () => {
    setSimulating(true);
    try { await generateKnockoutBracket(tournamentId); await fetchData(); setActiveTab("bracket"); }
    finally { setSimulating(false); }
  };

  const handleSimulateRound = async (phase: string) => {
    setSimulating(true);
    try { await simulateKnockoutRound(tournamentId, phase); await fetchData(); }
    finally { setSimulating(false); }
  };

  if (loading) {
    return <LoadingSpinner size={24} />;
  }

  const computeUnifiedStandings = (): StandingRow[] => {
    if (groups.length === 0) return [];
    const standingsMap = new Map<string, StandingRow>();
    groups.forEach((g) => {
      g.standings.forEach((s) => standingsMap.set(s.teamCode, { ...s }));
    });
    if (bracket) {
      Object.values(bracket).forEach((phaseMatches) => {
        phaseMatches.forEach((m) => {
          if (m.status === "finished") {
            const home = standingsMap.get(m.homeCode);
            const away = standingsMap.get(m.awayCode);
            const homeScore = m.homeScore + (m.home_extra || 0);
            const awayScore = m.awayScore + (m.away_extra || 0);
            if (home) {
              home.played += 1;
              home.goalsFor += homeScore;
              home.goalsAgainst += awayScore;
              home.goalDiff = home.goalsFor - home.goalsAgainst;
              if (homeScore > awayScore) { home.wins += 1; home.points += 3; }
              else if (homeScore === awayScore) { home.draws += 1; home.points += 1; }
              else home.losses += 1;
            }
            if (away) {
              away.played += 1;
              away.goalsFor += awayScore;
              away.goalsAgainst += homeScore;
              away.goalDiff = away.goalsFor - away.goalsAgainst;
              if (awayScore > homeScore) { away.wins += 1; away.points += 3; }
              else if (awayScore === homeScore) { away.draws += 1; away.points += 1; }
              else away.losses += 1;
            }
          }
        });
      });
    }
    return Array.from(standingsMap.values()).sort(
      (a, b) => b.points - a.points || b.goalDiff - a.goalDiff || b.goalsFor - a.goalsFor
    );
  };

  const allTeamsStanding = computeUnifiedStandings();
  const tabs = [
    { key: "groups" as const, label: hasLeaguePhase ? "Fase de liga" : "Grupos", show: hasGroupMatches || hasLeaguePhase },
    { key: "bracket" as const, label: "Eliminatorias", show: bracketPhases.length > 0 },
    { key: "standings" as const, label: "Clasificación", show: allTeamsStanding.length > 0 || leagueStandings.length > 0 },
  ];

  return (
    <div className="space-y-12">
      {showChampion && isFinished && tournament && (
        <ChampionOverlay tournament={tournament} onClose={() => { championDismissed.current = true; setShowChampion(false); }} />
      )}

      <header className="flex flex-col gap-8">
        <PageHeader
          eyebrow="Torneo"
          title={tournament?.name || "Torneo"}
          description={statusLabels[tournament?.status || ""] || tournament?.status}
        >
          <div className="flex flex-wrap gap-2">
            {tournament?.status === "pending" && (
              <Button variant="field" onClick={handleGenerateMatches} disabled={simulating}>
                <Play className="mr-1.5 h-4 w-4" /> Generar partidos
              </Button>
            )}
            {tournament?.status === "group_stage" && !allGroupsFinished && (
              <Button variant="field" onClick={handleSimulateGroups} disabled={simulating}>
                <FastForward className="mr-1.5 h-4 w-4" /> Simular fase de grupos
              </Button>
            )}
            {tournament?.status === "league_phase" && !allLeagueMatchesFinished && (
              <Button variant="field" onClick={handleSimulateGroups} disabled={simulating}>
                <FastForward className="mr-1.5 h-4 w-4" /> Simular fase de liga
              </Button>
            )}
            {(allGroupsFinished || (hasLeaguePhase && allLeagueMatchesFinished)) && !bracketPhases.length && (
              <Button variant="field" onClick={handleGenerateKnockout} disabled={simulating}>
                <Swords className="mr-1.5 h-4 w-4" /> Generar eliminatorias
              </Button>
            )}
            {bracketPhases.map((phase) => {
              const hasPending = bracket[phase]?.some((m) => m.status === "pending");
              if (!hasPending) return null;
              return (
                <Button
                  key={phase}
                  variant="outline"
                  onClick={() => handleSimulateRound(phase)}
                  disabled={simulating}
                >
                  <FastForward className="mr-1.5 h-4 w-4" /> Simular {phaseLabels[phase]}
                </Button>
              );
            })}
            {isFinished && (
              <Button variant="field" onClick={() => { championDismissed.current = false; setShowChampion(true); }}>
                <Crown className="mr-1.5 h-4 w-4" /> Ver Campeón
              </Button>
            )}
          </div>
        </PageHeader>

        <TournamentTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          showViewModeToggle={activeTab === "bracket" && bracketPhases.length > 0}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      </header>

      {/* Group stage / League phase */}
      {activeTab === "groups" && (hasGroupMatches || hasLeaguePhase) && (
        <div className="space-y-12">
          {hasLeaguePhase && (
            <section className="space-y-6">
              <div className="flex items-baseline justify-between border-b border-border pb-3 pl-3 relative">
                <span className="absolute left-0 top-0 bottom-3 w-0.5 rounded-full bg-field" />
                <h2 className="font-display text-xl font-semibold leading-tight">Fase de liga</h2>
                <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  {leagueStandings.length} equipos · {leagueMatches.length} partidos
                </span>
              </div>

              {leagueMatches.length > 0 && (
                <div className="grid grid-cols-1 gap-x-12 gap-y-4 xl:grid-cols-2">
                  {(() => {
                    const matchdays: GroupMatch[][] = [];
                    let remaining = [...leagueMatches];
                    while (remaining.length > 0) {
                      const currentMatchday: GroupMatch[] = [];
                      const usedTeams = new Set<string>();
                      const nextRemaining: GroupMatch[] = [];
                      for (const match of remaining) {
                        if (!usedTeams.has(match.homeTeamId) && !usedTeams.has(match.awayTeamId)) {
                          currentMatchday.push(match);
                          usedTeams.add(match.homeTeamId);
                          usedTeams.add(match.awayTeamId);
                        } else {
                          nextRemaining.push(match);
                        }
                      }
                      matchdays.push(currentMatchday);
                      remaining = nextRemaining;
                    }
                    return matchdays.map((matchday, mdIndex) => (
                      <div key={mdIndex}>
                        <p className="mb-1 text-xs font-display font-semibold tracking-wide text-muted-foreground">
                          Jornada {mdIndex + 1}
                        </p>
                        <div>
                          {matchday.map((match) => (
                            <GroupMatchCard key={match.id} match={match} onSave={handleSaveMatchScore} />
                          ))}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              )}
            </section>
          )}

          {hasGroupMatches && (
            <div className="grid grid-cols-1 gap-x-12 gap-y-10 xl:grid-cols-2">
              {groups.map((group) => (
                <section key={group.groupName} className="space-y-6">
                  <div className="flex items-baseline justify-between border-b border-border pb-3 pl-3 relative">
                    <span className="absolute left-0 top-0 bottom-3 w-0.5 rounded-full bg-field" />
                    <h2 className="font-display text-xl font-semibold leading-tight">Grupo {group.groupName}</h2>
                    <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      {group.standings.length} equipos
                    </span>
                  </div>

                  <GroupTable standings={group.standings} />

                  {/* Matches grouped by matchday */}
                  <div className="space-y-6 pt-2">
                    {(() => {
                      const matches = groupMatches.filter((m) => m.groupId === group.groupId);
                      if (matches.length === 0) {
                        return <p className="text-sm text-muted-foreground">No hay partidos aún.</p>;
                      }
                      const matchdays: GroupMatch[][] = [];
                      let remaining = [...matches];
                      while (remaining.length > 0) {
                        const currentMatchday: GroupMatch[] = [];
                        const usedTeams = new Set<string>();
                        const nextRemaining: GroupMatch[] = [];
                        for (const match of remaining) {
                          if (!usedTeams.has(match.homeTeamId) && !usedTeams.has(match.awayTeamId)) {
                            currentMatchday.push(match);
                            usedTeams.add(match.homeTeamId);
                            usedTeams.add(match.awayTeamId);
                          } else {
                            nextRemaining.push(match);
                          }
                        }
                        matchdays.push(currentMatchday);
                        remaining = nextRemaining;
                      }
                      return matchdays.map((matchday, mdIndex) => (
                        <div key={mdIndex}>
                          <p className="mb-1 text-xs font-display font-semibold tracking-wide text-muted-foreground">
                            Jornada {mdIndex + 1}
                          </p>
                          <div>
                            {matchday.map((match) => (
                              <GroupMatchCard key={match.id} match={match} onSave={handleSaveMatchScore} />
                            ))}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Knockout */}
      {activeTab === "bracket" && bracketPhases.length > 0 && (
        <>
          {viewMode === "list" ? (
            <div className="space-y-12">
              {bracketPhases.map((phase) => {
                const matches = bracket[phase] || [];
                if (matches.length === 0) return null;
                return (
                  <section key={phase} className="space-y-6">
                    <div className="flex items-baseline justify-between border-b border-border pb-3 pl-3 relative">
                      <span className="absolute left-0 top-0 bottom-3 w-0.5 rounded-full bg-field" />
                      <h2 className="font-display text-xl font-semibold leading-tight">{phaseLabels[phase]}</h2>
                      <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                        {matches.length} {matches.length === 1 ? "partido" : "partidos"}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {matches.map((match: BracketMatch) => (
                        <BracketMatchCard key={match.id} match={match} onSave={handleSaveMatchScore} />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          ) : (
            <div className="overflow-x-auto pt-8">
              <div className="flex justify-start min-w-max pb-6">
                {bracketPhases.map((phase, phaseIndex) => {
                  const matches = bracket[phase] || [];
                  const isLastPhase = phaseIndex === bracketPhases.length - 1;
                  return (
                    <div key={phase} className="flex flex-col" style={{ width: isLastPhase ? 240 : 300 }}>
                      <h3 className="mb-6 text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        {phaseLabels[phase]}
                      </h3>
                      <div className="flex flex-1 flex-col justify-around gap-6 relative">
                        {matches.map((match, matchIndex) => (
                          <div key={match.id} className="relative flex items-center justify-center w-full my-2">
                            <BracketNode match={match} onSave={handleSaveMatchScore} />
                            {!isLastPhase && (
                              <>
                                <div className="absolute top-1/2 left-[224px] w-12 border-t border-dashed border-border/60" />
                                {matchIndex % 2 === 0 && (
                                  <>
                                    <div className="absolute top-1/2 left-[272px] w-3 border-r border-dashed border-t border-border/60 h-[calc(50%+2rem)] origin-top" />
                                    <div className="absolute top-[calc(100%+2rem)] left-[272px] w-12 border-t border-dashed border-border/60" />
                                  </>
                                )}
                                {matchIndex % 2 === 1 && (
                                  <div className="absolute bottom-1/2 left-[272px] w-3 border-r border-dashed border-b border-border/60 h-[calc(50%+2rem)] origin-bottom" />
                                )}
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Standings */}
      {activeTab === "standings" && (allTeamsStanding.length > 0 || leagueStandings.length > 0) && (
        <section>
          <div className="mb-6 flex items-baseline justify-between border-b border-border pb-3 pl-3 relative">
            <span className="absolute left-0 top-0 bottom-3 w-0.5 rounded-full bg-field" />
            <h2 className="font-display text-xl font-semibold leading-tight">Clasificación general</h2>
            <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              {(hasLeaguePhase ? leagueStandings.length : allTeamsStanding.length)} equipos
            </span>
          </div>
          <GroupTable
            standings={hasLeaguePhase ? leagueStandings : allTeamsStanding}
            showGoalsDetails
            championCode={tournament?.championCode}
          />
        </section>
      )}

      {!hasGroupMatches && !hasLeaguePhase && !bracketPhases.length && (
        <section className="flex flex-col items-center justify-center border-t border-border py-20 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary ring-1 ring-border mb-4">
            <Play className="h-5 w-5 text-muted-foreground/50" strokeWidth={1.5} />
          </div>
          <p className="text-sm font-medium">No hay partidos aún</p>
          <p className="mt-1 text-sm text-muted-foreground max-w-xs">
            Genera los partidos para comenzar el torneo.
          </p>
        </section>
      )}
    </div>
  );
}
