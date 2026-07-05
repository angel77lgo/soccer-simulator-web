"use client";

import { useSensor, useSensors, PointerSensor, KeyboardSensor } from "@dnd-kit/core";
import { useWizardState } from "@/hooks/useWizardState";
import { StepProgress } from "@/components/wizard/StepProgress";
import { WizardStep1General } from "@/components/wizard/WizardStep1General";
import { WizardStep2Hosts } from "@/components/wizard/WizardStep2Hosts";
import { WizardStep3Participants } from "@/components/wizard/WizardStep3Participants";
import { WizardStep4Repechaje } from "@/components/wizard/WizardStep4Repechaje";
import { WizardStep5Bombos } from "@/components/wizard/WizardStep5Bombos";
import { WizardStep5Draw as WizardStep6Draw } from "@/components/wizard/WizardStep5Draw";
import { WizardStep6Confirm as WizardStep7Confirm } from "@/components/wizard/WizardStep6Confirm";
import { Button } from "@/components/ui/button";

export default function CreateTournamentPage() {
  const state = useWizardState();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3, delay: 80, tolerance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const stepLabels = state.entityType === "club"
    ? [
        { num: 1, label: "General" },
        { num: 3, label: "Participantes" },
        { num: 5, label: "Bombos" },
        { num: 6, label: "Sorteo" },
        { num: 7, label: "Confirmación" },
      ]
    : [
        { num: 1, label: "General" },
        { num: 2, label: "Anfitriones" },
        { num: 3, label: "Participantes" },
        { num: 4, label: "Repechaje" },
        { num: 5, label: "Bombos" },
        { num: 6, label: "Sorteo" },
        { num: 7, label: "Confirmación" },
      ];

  return (
    <div className="space-y-10">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Nuevo torneo
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
          Creador de Torneos
        </h1>
      </header>

      {/* Step Progress */}
      <StepProgress step={state.step} setStep={state.setStep} stepLabels={stepLabels} />

      <section className="space-y-6 border-t border-border pt-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            {state.step === 1 && "1. Configuración General"}
            {state.step === 2 && "2. Países Anfitriones"}
            {state.step === 3 && "3. Plazas y Participantes"}
            {state.step === 4 && "4. Repechaje (Plazas Extra)"}
            {state.step === 5 && "5. Edición de Bombos"}
            {state.step === 6 && "6. Sorteo de Grupos"}
            {state.step === 7 && "7. Confirmar y Sortear"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {state.step === 1 && "Nombre y tipo de torneo."}
            {state.step === 2 && "Los anfitriones clasifican automáticamente y sus cupos se redistribuyen como repechaje libre."}
            {state.step === 3 && "Selecciona las selecciones base de cada confederación respetando los cupos."}
            {state.step === 4 && "Selecciona cualquier equipo libre (excepto UEFA) para las plazas liberadas por los anfitriones."}
            {state.step === 5 && "Revisa y ajusta manualmente los equipos en cada bombo (cabezas de serie)."}
            {state.step === 6 && "Define el tipo de sorteo (automático o manual) y asigna equipos a grupos."}
            {state.step === 7 && "Revisa todo antes de generar el torneo."}
          </p>
        </div>

        <div className="space-y-8">
          {state.step === 1 && (
            <WizardStep1General
              name={state.name}
              setName={state.setName}
              entityType={state.entityType || "national"}
              setEntityType={state.setEntityType}
              type={state.type}
              setType={state.setType}
              subType={state.subType}
              setSubType={state.setSubType}
              teamsCount={state.teamsCount}
              setTeamsCount={state.setTeamsCount}
              customQuotas={state.customQuotas}
              setCustomQuotas={state.setCustomQuotas}
              templates={state.templates}
              customQuotasSum={state.customQuotasSum}
              isCustomQuotaValid={state.isCustomQuotaValid}
              setSelectedTeamIds={state.setSelectedTeamIds}
              setHostIds={state.setHostIds}
              setRepechajeTeamIds={state.setRepechajeTeamIds}
            />
          )}

          {state.step === 2 && (
            <WizardStep2Hosts
              hostIds={state.hostIds}
              hostTeams={state.hostCandidates.filter(t => state.hostIds.includes(t.id))}
              toggleHost={state.toggleHost}
              hostCandidates={state.hostCandidates}
              baseQuotas={state.effectiveQuotas} // Use effectiveQuotas as baseQuotas for local preview if needed, or pass correct values
              hostsByConfed={state.hostsByConfed}
              effectiveQuotas={state.effectiveQuotas}
              freedSlots={state.freedSlots}
              isWorldCup={state.isWorldCup}
              hostSearchQuery={state.hostSearchQuery}
              setHostSearchQuery={state.setHostSearchQuery}
            />
          )}

          {state.step === 3 && (
            <WizardStep3Participants
              effectiveQuotas={state.effectiveQuotas}
              selectedTeamIds={state.selectedTeamIds}
              totalTeamsExpected={state.totalTeamsExpected}
              freedSlots={state.freedSlots}
              hostIds={state.hostIds}
              isStep3Valid={state.isStep3Valid}
              teamsByConfed={state.teamsByConfed}
              participantSearchQueries={state.participantSearchQueries}
              setParticipantSearchQueries={state.setParticipantSearchQueries}
              toggleParticipant={state.toggleParticipant}
              randomizeConfederation={state.randomizeConfederation}
              getSelectedCountPerConfed={state.getSelectedCountPerConfed}
            />
          )}

          {state.step === 4 && (
            <WizardStep4Repechaje
              repechajeTeamIds={state.repechajeTeamIds}
              freedSlots={state.freedSlots}
              toggleRepechaje={state.toggleRepechaje}
              repechajeCandidates={state.repechajeCandidates}
              repechajeSearchQuery={state.repechajeSearchQuery}
              setRepechajeSearchQuery={state.setRepechajeSearchQuery}
            />
          )}

          {state.step === 5 && (
            <WizardStep5Bombos
              pots={state.pots}
              defaultPotsSizes={state.defaultPotsSizes}
              activeDragTeamId={state.activeDragTeamId}
              activeDragTeam={state.activeDragTeam}
              handleDragStart={state.handleDragStart}
              handleDragCancel={state.handleDragCancel}
              handleDragEnd={state.handleDragEnd}
              sensors={sensors}
            />
          )}

          {state.step === 6 && (
            <WizardStep6Draw
              drawMode={state.drawMode}
              setDrawMode={state.setDrawMode}
              assignedTeamIds={state.assignedTeamIds}
              totalTeamsExpected={state.totalTeamsExpected}
              dropError={state.dropError}
              setDropError={state.setDropError}
              pots={state.pots}
              numGroups={state.numGroups}
              manualGroups={state.manualGroups}
              availableTeams={state.availableTeams}
              activeDragTeamId={state.activeDragTeamId}
              activeDragTeam={state.activeDragTeam}
              shakingSlotId={state.shakingSlotId}
              shakeCounter={state.shakeCounter}
              getAssignedGroupName={state.getAssignedGroupName}
              getSlotInvalidity={state.getSlotInvalidity}
              removeFromGroup={state.removeFromGroup}
              handleDragStart={state.handleDragStart}
              handleDragCancel={state.handleDragCancel}
              handleDragEnd={state.handleDragEnd}
              sensors={sensors}
            />
          )}

          {state.step === 7 && (
            <WizardStep7Confirm
              name={state.name}
              type={state.type}
              subType={state.subType}
              templates={state.templates}
              totalTeamsExpected={state.totalTeamsExpected}
              hostIds={state.hostIds}
              hostTeams={state.availableTeams.filter(t => state.hostIds.includes(t.id))}
              selectedTeamIds={state.selectedTeamIds}
              repechajeTeamIds={state.repechajeTeamIds}
              availableTeams={state.availableTeams}
            />
          )}

          {/* ─── NAVIGATION ─── */}
          <div className="flex justify-between border-t border-border pt-6">
            <Button variant="outline" onClick={state.handlePrev} disabled={state.step === 1 || state.isCreating}>
              Atrás
            </Button>

            {state.step < 7 ? (
              <Button
                onClick={state.handleNext}
                disabled={
                  (state.step === 1 && (!state.isStep1Valid || !state.isCustomQuotaValid)) ||
                  (state.step === 2 && !state.isStep2Valid) ||
                  (state.step === 3 && !state.isStep3Valid) ||
                  (state.step === 4 && !state.isStep4Valid) ||
                  (state.step === 5 && !state.isStep5BombosValid) ||
                  (state.step === 6 && !state.isStep6DrawValid)
                }
              >
                Siguiente →
              </Button>
            ) : (
              <Button onClick={state.handleCreate} disabled={state.isCreating}>
                {state.isCreating ? "Generando…" : "Generar Torneo y Sorteo"}
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
