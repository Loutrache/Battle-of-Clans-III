"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { ConfirmModal } from "../components/ConfirmModal";

type Profile = {
  id: string;
  email: string;
  username: string | null;
  team_id: number | null;
  role: string;
  clan_confirmed: boolean;
  bonus_points: number | null;
};

type Team = {
  id: number;
  name: string;
  score: number;
  corruption_active: boolean;
};

type ChallengeHistoryRow = {
  id: number;
  user_id: string;
  challenge_id: number;
  book_submission_id: number | null;
  created_at: string;
  challenges: { title: string; point: number } | { title: string; point: number }[] | null;
  book_submissions: { book_title: string } | { book_title: string }[] | null;
};

type AttackLog = {
  id: number;
  attacking_team_id: number;
  target_team_id: number;
  attack_name: string;
  attack_cost: number;
  points_removed: number;
  canceled_by_infiltration: boolean;
  created_at: string;
  expires_at: string | null;
};

type InfiltrationLog = {
  id: number;
  attacking_team_id: number;
  target_team_id: number;
  status: string;
  attempts_used: number;
  max_attempts: number;
  success: boolean;
  created_at: string;
  updated_at: string | null;
  expires_at: string | null;
  successful_attack_id: number | null;
  guess: string | null;
};

type FlashChallenge = {
  id: number;
  title: string;
  description: string;
  point: number;
  category: string;
  is_flash: boolean;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
};

type FlashEvent = {
  id: number;
  title: string;
  description: string | null;
  event_type: string | null;
  start_date: string | null;
  end_date: string | null;
  affected_team_id: number | null;
  points_value: number | null;
  is_active: boolean;
};
type CorruptionType = {
  id: number;
  title: string;
  description: string | null;
  severity: string;
  effect_value: string | null;
  can_stack: boolean | null;
  created_at: string;
};

type CorruptionEvent = {
  id: number;
  corruption_type_id: number;
  affected_team_id: number;
  is_active: boolean;
  is_deleted: boolean;
  activated_at: string | null;
  deactivated_at: string | null;
  deleted_at: string | null;
  effect_value: string | null;
  created_at: string;
};

type OracleClanSubTab =
  | "general"
  | "defis"
  | "attaques"
  | "infiltrations"
  | "corruption";
type OracleFlashSubTab = "defis" | "malus" | "regles";

const CLAN_ORDER = ["Vampire", "Sorcière", "Dragon", "Nécromancien", "Faë"];

export default function MonEspaceOraclePage() {
  const [loading, setLoading] = useState(true);
  const [oracleProfile, setOracleProfile] = useState<Profile | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [challengeHistory, setChallengeHistory] = useState<ChallengeHistoryRow[]>([]);
  const [attacks, setAttacks] = useState<AttackLog[]>([]);
  const [infiltrations, setInfiltrations] = useState<InfiltrationLog[]>([]);
  const [flashChallenges, setFlashChallenges] = useState<FlashChallenge[]>([]);
  const [flashEvents, setFlashEvents] = useState<FlashEvent[]>([]);
  const [flashSubmissions, setFlashSubmissions] = useState<any[]>([]);

  const [activeMainTab, setActiveMainTab] = useState<string>("Vampire");
  const [activeClanSubTab, setActiveClanSubTab] =
    useState<OracleClanSubTab>("general");
  const [activeFlashSubTab, setActiveFlashSubTab] =
    useState<OracleFlashSubTab>("defis");

  const [teamPointInput, setTeamPointInput] = useState<Record<number, string>>({});
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [memberPointInput, setMemberPointInput] = useState<Record<string, string>>({});
  const [corruptionTypes, setCorruptionTypes] = useState<CorruptionType[]>([]);
const [corruptionEvents, setCorruptionEvents] = useState<CorruptionEvent[]>([]);
const [confirmModalOpen, setConfirmModalOpen] = useState(false);
const [confirmModalTitle, setConfirmModalTitle] = useState("");
const [confirmModalMessage, setConfirmModalMessage] = useState("");
const [confirmModalDanger, setConfirmModalDanger] = useState(false);
const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
const [confirmModalConfirmLabel, setConfirmModalConfirmLabel] = useState("Confirmer");
const [confirmModalCancelLabel, setConfirmModalCancelLabel] = useState("Annuler");

  useEffect(() => {
    async function loadOracleDashboard() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/connexion";
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!profileData || profileData.role !== "oracle") {
        window.location.href = "/mon-espace";
        return;
      }

      setOracleProfile(profileData);

      const { data: teamsData } = await supabase
        .from("Teams")
        .select("*")
        .order("score", { ascending: false });

      if (teamsData) {
        setTeams(teamsData);
      }

      const { data: profilesData } = await supabase
        .from("profiles")
        .select("*");

      if (profilesData) {
        setProfiles(profilesData);
      }

      const { data: challengeHistoryData } = await supabase
        .from("completed_challenges")
        .select(`
          id,
          user_id,
          challenge_id,
          book_submission_id,
          created_at,
          challenges (
            title,
            point
          ),
          book_submissions (
            book_title
          )
        `)
        .order("created_at", { ascending: false });

      if (challengeHistoryData) {
        setChallengeHistory(challengeHistoryData as ChallengeHistoryRow[]);
      }

      const { data: attacksData } = await supabase
        .from("attacks")
        .select("*")
        .order("created_at", { ascending: false });

      if (attacksData) {
        setAttacks(attacksData as AttackLog[]);
      }

      const { data: infiltrationsData } = await supabase
        .from("infiltrations")
        .select("*")
        .order("created_at", { ascending: false });

      if (infiltrationsData) {
        setInfiltrations(infiltrationsData as InfiltrationLog[]);
      }

      const { data: flashChallengesData } = await supabase
        .from("challenges")
        .select("*")
        .eq("is_flash", true)
        .order("title", { ascending: true });

      if (flashChallengesData) {
        setFlashChallenges(flashChallengesData as FlashChallenge[]);
      }

      const { data: flashEventsData, error: flashEventsError } = await supabase
  .from("flash_events")
  .select("*")
  .order("title", { ascending: true });

console.log("FLASH EVENTS DATA:", flashEventsData);
console.log("FLASH EVENTS ERROR:", flashEventsError);

if (flashEventsData) {
  setFlashEvents(flashEventsData as FlashEvent[]);
}
const { data: corruptionTypesData } = await supabase
  .from("corruption_types")
  .select("*")
  .order("severity", { ascending: true });

if (corruptionTypesData) {
  setCorruptionTypes(corruptionTypesData as CorruptionType[]);
}

const { data: corruptionEventsData } = await supabase
  .from("corruption_events")
  .select("*");

if (corruptionEventsData) {
  setCorruptionEvents(corruptionEventsData as CorruptionEvent[]);
}
      const { data: flashSubmissionsData } = await supabase
        .from("flash_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (flashSubmissionsData) {
        setFlashSubmissions(flashSubmissionsData);
      }

      setLoading(false);
    }

    loadOracleDashboard();
  }, []);

  const availableClanTabs = useMemo(() => {
    return CLAN_ORDER.filter((clanName) =>
      teams.some((team) => team.name === clanName)
    );
  }, [teams]);

  useEffect(() => {
  if (
    availableClanTabs.length > 0 &&
    activeMainTab !== "flash" &&
    !availableClanTabs.includes(activeMainTab)
  ) {
    setActiveMainTab(availableClanTabs[0]);
  }
}, [availableClanTabs, activeMainTab]);

  const selectedTeam = useMemo(() => {
    return teams.find((team) => team.name === activeMainTab) ?? null;
  }, [teams, activeMainTab]);

  function getProfileById(userId: string) {
    return profiles.find((profile) => profile.id === userId) ?? null;
  }

  function getUsernameByUserId(userId: string) {
    return getProfileById(userId)?.username ?? "Pseudo inconnu";
  }

  function getUserTeamId(userId: string) {
    return getProfileById(userId)?.team_id ?? null;
  }

  function getTeamNameById(teamId: number | null) {
    if (!teamId) return "Clan inconnu";
    return teams.find((team) => team.id === teamId)?.name ?? "Clan inconnu";
  }

  function getPluralClanName(name: string) {
    if (name === "Vampire") return "Vampires";
    if (name === "Sorcière") return "Sorcières";
    if (name === "Dragon") return "Dragons";
    if (name === "Nécromancien") return "Nécromanciens";
    if (name === "Faë") return "Faë";
    return name;
  }

  function formatDateTime(dateString: string | null) {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString("fr-FR", {
      timeZone: "Europe/Paris",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function normalizeCategory(value: string | null | undefined) {
    return (value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }

  function getChallengeTitle(row: ChallengeHistoryRow) {
    if (Array.isArray(row.challenges)) {
      return row.challenges[0]?.title ?? "Défi inconnu";
    }
    return row.challenges?.title ?? "Défi inconnu";
  }

  function getChallengePoints(row: ChallengeHistoryRow) {
    if (Array.isArray(row.challenges)) {
      return row.challenges[0]?.point ?? 0;
    }
    return row.challenges?.point ?? 0;
  }

  function getBookTitle(row: ChallengeHistoryRow) {
    if (Array.isArray(row.book_submissions)) {
      return row.book_submissions[0]?.book_title ?? "Livre inconnu";
    }
    return row.book_submissions?.book_title ?? "Livre inconnu";
  }

  function getMemberPersonalScore(userId: string) {
    return challengeHistory
      .filter((row) => row.user_id === userId)
      .reduce((sum, row) => sum + getChallengePoints(row), 0);
  }

  function getClanRank(teamId: number) {
    const sorted = [...teams].sort((a, b) => b.score - a.score);
    const index = sorted.findIndex((team) => team.id === teamId);
    return index >= 0 ? index + 1 : null;
  }
  const getTeamCorruptionEvents = (teamId: number) => {
  return corruptionEvents.filter(
    (event) => Number(event.affected_team_id) === Number(teamId)
  );
};

const getCorruptionType = (corruptionTypeId: number) => {
  return corruptionTypes.find(
    (type) => Number(type.id) === Number(corruptionTypeId)
  );
};

  function getAttackStatus(attack: AttackLog) {
    if (attack.canceled_by_infiltration) return "Annulée par infiltration";
    if (attack.expires_at && new Date(attack.expires_at) <= new Date()) {
      return "Expirée";
    }
    return "Active";
  }

  const clanMembers = useMemo(() => {
    if (!selectedTeam) return [];

    const members = profiles.filter((profile) => profile.team_id === selectedTeam.id);

    return [...members].sort((a, b) => {
      if (a.role === "chief" && b.role !== "chief") return -1;
      if (a.role !== "chief" && b.role === "chief") return 1;
      return (a.username ?? "").localeCompare(b.username ?? "", "fr", {
        sensitivity: "base",
      });
    });
  }, [profiles, selectedTeam]);

  const clanChallengeHistory = useMemo(() => {
    if (!selectedTeam) return [];
    return challengeHistory.filter(
      (row) => getUserTeamId(row.user_id) === selectedTeam.id
    );
  }, [challengeHistory, selectedTeam, profiles]);

  const clanAttacks = useMemo(() => {
    if (!selectedTeam) return [];
    return attacks.filter((attack) => attack.attacking_team_id === selectedTeam.id);
  }, [attacks, selectedTeam]);

  const clanInfiltrationEnemyTeams = useMemo(() => {
    if (!selectedTeam) return [];
    return teams.filter((team) => team.id !== selectedTeam.id);
  }, [teams, selectedTeam]);

  const flashDefis = useMemo(() => {
    return flashChallenges.filter((item) => {
      const cat = normalizeCategory(item.category);
      return !cat.includes("malus");
    });
  }, [flashChallenges]);

  const flashMalus = useMemo(() => {
    return flashChallenges.filter((item) => {
      const cat = normalizeCategory(item.category);
      return cat.includes("malus");
    });
  }, [flashChallenges]);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  async function adjustTeamScore(teamId: number, delta: number) {
    if (!delta) return;

    const team = teams.find((item) => item.id === teamId);
    if (!team) return;

    const newScore = (team.score ?? 0) + delta;

    const { error } = await supabase
      .from("Teams")
      .update({ score: newScore })
      .eq("id", teamId);

    if (error) {
      setMessageType("error");
      setMessage("Impossible de modifier le score du clan.");
      return;
    }

    setTeams((prev) =>
      prev.map((item) =>
        item.id === teamId ? { ...item, score: newScore } : item
      )
    );

    setTeamPointInput((prev) => ({
      ...prev,
      [teamId]: "",
    }));

    setMessageType("success");
    setMessage("Score du clan mis à jour.");
  }
  async function toggleCorruption(
  corruptionEvent: CorruptionEvent,
  shouldActivate: boolean
) {
  setConfirmModalTitle(
  shouldActivate ? "Activer la corruption" : "Désactiver la corruption"
);
setConfirmModalMessage(
  shouldActivate
    ? "Voulez-vous activer cette corruption pour cette équipe ?"
    : "Voulez-vous désactiver cette corruption pour cette équipe ?"
);
setConfirmModalDanger(false);
setConfirmModalConfirmLabel(shouldActivate ? "Activer" : "Désactiver");
setConfirmModalCancelLabel("Annuler");

setConfirmAction(() => async () => {

  const updates = shouldActivate
    ? {
        is_active: true,
        activated_at: new Date().toISOString(),
        deactivated_at: null,
      }
    : {
        is_active: false,
        deactivated_at: new Date().toISOString(),
      };

  const { error } = await supabase
    .from("corruption_events")
    .update(updates)
    .eq("id", corruptionEvent.id);

  if (error) {
    setMessageType("error");
    setMessage("Impossible de modifier cette corruption.");
    return;
  }

  setCorruptionEvents((prev) =>
    prev.map((event) =>
      event.id === corruptionEvent.id
        ? {
            ...event,
            ...updates,
          }
        : event
    )
  );

  setMessageType("success");
  setMessage(
    shouldActivate
      ? "Corruption activée."
      : "Corruption désactivée."
  );
  });

setConfirmModalOpen(true);
return;
}
async function deleteCorruption(corruptionEvent: CorruptionEvent) {
  setConfirmModalTitle("Supprimer la corruption");
setConfirmModalMessage(
  "Voulez-vous supprimer définitivement cette corruption pour cette équipe ?"
);
setConfirmModalDanger(true);
setConfirmModalConfirmLabel("Supprimer");
setConfirmModalCancelLabel("Annuler");

setConfirmAction(() => async () => {

  const updates = {
    is_active: false,
    is_deleted: true,
    deleted_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("corruption_events")
    .update(updates)
    .eq("id", corruptionEvent.id);

  if (error) {
    setMessageType("error");
    setMessage("Impossible de supprimer cette corruption.");
    return;
  }

  setCorruptionEvents((prev) =>
    prev.map((event) =>
      event.id === corruptionEvent.id
        ? {
            ...event,
            ...updates,
          }
        : event
    )
  );

  setMessageType("success");
  setMessage("Corruption supprimée définitivement.");
  });

setConfirmModalOpen(true);
return;
}
async function adjustMemberScore(memberId: string, amount: number) {
  const member = clanMembers.find((m) => m.id === memberId);

  if (!member) return;

  const currentBonus = member.bonus_points ?? 0;
  const newBonus = currentBonus + amount;
  const memberTeam = teams.find((team) => team.id === member.team_id);

if (!memberTeam) return;

const newTeamScore = (memberTeam.score ?? 0) + amount;

  const { error } = await supabase
    .from("profiles")
    .update({
      bonus_points: newBonus,
    })
    .eq("id", memberId);

  if (error) {
    setMessage("Impossible de modifier les points du membre.");
    return;
  }

  setProfiles((prev) =>
  prev.map((m) =>
    m.id === memberId
      ? {
          ...m,
          bonus_points: newBonus,
        }
      : m
  )
);
setTeams((prev) =>
  prev.map((team) =>
    team.id === member.team_id
      ? {
          ...team,
          score: newTeamScore,
        }
      : team
  )
);

  setMemberPointInput((prev) => ({
    ...prev,
    [memberId]: "",
  }));

  setMessage("Points individuels mis à jour.");
}
  async function handleCancelChallenge(row: ChallengeHistoryRow) {
    setConfirmModalTitle("Annuler le défi");
setConfirmModalMessage("Voulez-vous annuler ce défi validé ?");
setConfirmModalDanger(true);
setConfirmModalConfirmLabel("Annuler le défi");
setConfirmModalCancelLabel("Retour");

setConfirmAction(() => async () => {

    const teamId = getUserTeamId(row.user_id);
    const points = getChallengePoints(row);

    const { error: deleteError } = await supabase
      .from("completed_challenges")
      .delete()
      .eq("id", row.id);

    if (deleteError) {
      setMessageType("error");
      setMessage("Impossible d’annuler ce défi.");
      return;
    }

    if (row.book_submission_id) {
      const { count } = await supabase
        .from("completed_challenges")
        .select("*", { count: "exact", head: true })
        .eq("book_submission_id", row.book_submission_id);

      if ((count ?? 0) === 0) {
        await supabase
          .from("book_submissions")
          .delete()
          .eq("id", row.book_submission_id);
      }
    }

    if (teamId) {
      const team = teams.find((item) => item.id === teamId);
      if (team) {
        const newScore = (team.score ?? 0) - points;
        await supabase
          .from("Teams")
          .update({ score: newScore })
          .eq("id", teamId);

        setTeams((prev) =>
          prev.map((item) =>
            item.id === teamId ? { ...item, score: newScore } : item
          )
        );
      }
    }

    setChallengeHistory((prev) => prev.filter((item) => item.id !== row.id));

    setMessageType("success");
    setMessage("Défi annulé.");
    });

setConfirmModalOpen(true);
return;
  }

  async function handleCancelAttack(attack: AttackLog) {
    setConfirmModalTitle("Annuler l’attaque");
setConfirmModalMessage(
  "Voulez-vous annuler cette attaque et restaurer les points correspondants ?"
);
setConfirmModalDanger(true);
setConfirmModalConfirmLabel("Annuler l’attaque");
setConfirmModalCancelLabel("Retour");

setConfirmAction(() => async () => {

    const attackingTeam = teams.find((team) => team.id === attack.attacking_team_id);
    const targetTeam = teams.find((team) => team.id === attack.target_team_id);

    if (!attackingTeam || !targetTeam) {
      setMessageType("error");
      setMessage("Impossible de retrouver les clans liés à cette attaque.");
      return;
    }

    const newAttackingScore = (attackingTeam.score ?? 0) + attack.attack_cost;
    const newTargetScore = attack.canceled_by_infiltration
      ? targetTeam.score ?? 0
      : (targetTeam.score ?? 0) + attack.points_removed;

    const { error: deleteError } = await supabase
      .from("attacks")
      .delete()
      .eq("id", attack.id);

    if (deleteError) {
      setMessageType("error");
      setMessage("Impossible d’annuler cette attaque.");
      return;
    }

    await supabase
      .from("Teams")
      .update({ score: newAttackingScore })
      .eq("id", attackingTeam.id);

    await supabase
      .from("Teams")
      .update({ score: newTargetScore })
      .eq("id", targetTeam.id);

    setTeams((prev) =>
      prev.map((team) => {
        if (team.id === attackingTeam.id) {
          return { ...team, score: newAttackingScore };
        }
        if (team.id === targetTeam.id) {
          return { ...team, score: newTargetScore };
        }
        return team;
      })
    );

    setAttacks((prev) => prev.filter((item) => item.id !== attack.id));

    setMessageType("success");
    setMessage("Attaque annulée.");
    });

setConfirmModalOpen(true);
return;
  }
  async function disableInfiltrationByOracle(
  attackingTeamId: number,
  targetTeamId: number
) {
  setConfirmModalTitle("Désactiver l’infiltration");
setConfirmModalMessage(
  "Voulez-vous désactiver définitivement cette infiltration pour pénalité Distorsion ?"
);
setConfirmModalDanger(true);

setConfirmAction(() => async () => {

  const existingInfiltration = infiltrations
    .filter(
      (item) =>
        Number(item.attacking_team_id) === Number(attackingTeamId) &&
        Number(item.target_team_id) === Number(targetTeamId)
    )
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];

  if (existingInfiltration) {
    const { error } = await supabase
      .from("infiltrations")
      .update({
        status: "failed",
        success: false,
        guess: "Désactivée par les Oracles - Distorsion",
        expires_at: new Date().toISOString(),
      })
      .eq("id", existingInfiltration.id);

    if (error) {
      setMessageType("error");
      setMessage("Impossible de désactiver cette infiltration.");
      return;
    }

    setInfiltrations((prev) =>
      prev.map((item) =>
        item.id === existingInfiltration.id
          ? {
              ...item,
              status: "failed",
              success: false,
              guess: "Désactivée par les Oracles - Distorsion",
              expires_at: new Date().toISOString(),
            }
          : item
      )
    );
  } else {
    const { data, error } = await supabase
      .from("infiltrations")
      .insert({
        attacking_team_id: attackingTeamId,
        target_team_id: targetTeamId,
        status: "failed",
        success: false,
        attempts_used: 0,
        max_attempts: 3,
        total_clue_penalty: 0,
        guess: "Désactivée par les Oracles - Distorsion",
        started_at: new Date().toISOString(),
        expires_at: new Date().toISOString(),
        hint_1_unlocked: false,
        hint_2_unlocked: false,
        hint_3_unlocked: false,
        hint_4_unlocked: false,
        successful_attack_id: null,
      })
      .select()
      .single();

    if (error || !data) {
      setMessageType("error");
      setMessage("Impossible de désactiver cette infiltration.");
      return;
    }

    setInfiltrations((prev) => [data, ...prev]);
  }

  setMessageType("success");
  setMessage("Infiltration désactivée par les Oracles.");
  });
setConfirmModalOpen(true);
return;
}

  async function activateFlashChallenge(challengeId: number) {
    setConfirmModalTitle("Activer le flash");
setConfirmModalMessage("Voulez-vous activer ce flash ?");
setConfirmModalDanger(false);
setConfirmModalConfirmLabel("Activer");
setConfirmModalCancelLabel("Annuler");

setConfirmAction(() => async () => {
    const now = new Date().toISOString();

    const { error } = await supabase
      .from("challenges")
      .update({
        is_active: true,
        start_date: now,
        end_date: null,
      })
      .eq("id", challengeId);

    if (error) {
      setMessageType("error");
      setMessage("Impossible d’activer ce flash.");
      return;
    }

    setFlashChallenges((prev) =>
      prev.map((item) =>
        item.id === challengeId
          ? { ...item, is_active: true, start_date: now, end_date: null }
          : item
      )
    );

    setMessageType("success");
    setMessage("Flash activé.");
    });

setConfirmModalOpen(true);
return;
  }

  async function deactivateFlashChallenge(challengeId: number) {
    setConfirmModalTitle("Désactiver le flash");
setConfirmModalMessage("Voulez-vous désactiver ce flash ?");
setConfirmModalDanger(false);
setConfirmModalConfirmLabel("Désactiver");
setConfirmModalCancelLabel("Annuler");

setConfirmAction(() => async () => {
    const now = new Date().toISOString();

    const { error } = await supabase
      .from("challenges")
      .update({
        is_active: false,
        end_date: now,
      })
      .eq("id", challengeId);

    if (error) {
      setMessageType("error");
      setMessage("Impossible de désactiver ce flash.");
      return;
    }

    setFlashChallenges((prev) =>
      prev.map((item) =>
        item.id === challengeId
          ? { ...item, is_active: false, end_date: now }
          : item
      )
    );

    setMessageType("success");
    setMessage("Flash désactivé.");
    });

setConfirmModalOpen(true);
return;
  }

  async function activateFlashEvent(eventId: number) {
    setConfirmModalTitle("Activer la règle flash");
setConfirmModalMessage("Voulez-vous activer cette règle flash ?");
setConfirmModalDanger(false);
setConfirmModalConfirmLabel("Activer");
setConfirmModalCancelLabel("Annuler");

setConfirmAction(() => async () => {
    const now = new Date().toISOString();

    const { error } = await supabase
      .from("flash_events")
      .update({
        is_active: true,
        start_date: now,
        end_date: null,
      })
      .eq("id", eventId);

    if (error) {
      setMessageType("error");
      setMessage("Impossible d’activer cette règle flash.");
      return;
    }

    setFlashEvents((prev) =>
      prev.map((item) =>
        item.id === eventId
          ? { ...item, is_active: true, start_date: now, end_date: null }
          : item
      )
    );

    setMessageType("success");
    setMessage("Règle flash activée.");
    });

setConfirmModalOpen(true);
return;
  }

  async function deactivateFlashEvent(eventId: number) {
    setConfirmModalTitle("Désactiver la règle flash");
setConfirmModalMessage("Voulez-vous désactiver cette règle flash ?");
setConfirmModalDanger(false);
setConfirmModalConfirmLabel("Désactiver");
setConfirmModalCancelLabel("Annuler");

setConfirmAction(() => async () => {
    const now = new Date().toISOString();

    const { error } = await supabase
      .from("flash_events")
      .update({
        is_active: false,
        end_date: now,
      })
      .eq("id", eventId);

    if (error) {
      setMessageType("error");
      setMessage("Impossible de désactiver cette règle flash.");
      return;
    }

    setFlashEvents((prev) =>
      prev.map((item) =>
        item.id === eventId
          ? { ...item, is_active: false, end_date: now }
          : item
      )
    );

    setMessageType("success");
    setMessage("Règle flash désactivée.");
    });

setConfirmModalOpen(true);
return;
  }

  function getFlashSubmissionsForChallenge(challengeId: number) {
    return flashSubmissions.filter((item) => item.challenge_id === challengeId);
  }

  function renderFlashCard(item: FlashChallenge) {
    const isUsed = !!item.start_date && !item.is_active;
    const submissions = getFlashSubmissionsForChallenge(item.id);

    return (
      <div
        key={item.id}
        className={`rounded-2xl border p-5 ${
          item.is_active
            ? "border-[#6163FC]/50 bg-[#0E2028]/75"
            : isUsed
            ? "border-white/10 bg-black/10 opacity-60"
            : "border-white/10 bg-[#0E2028]/75"
        }`}
      >
        <h3 className="font-cinzel text-lg uppercase tracking-[0.2em] text-white">
          {item.title}
        </h3>

        <p className="font-cormorant mt-3 text-xl text-white/80">
          {item.description}
        </p>

        <p className="font-cormorant mt-4 text-lg text-white/60">
          Activation : {formatDateTime(item.start_date)}
        </p>
        <p className="font-cormorant mt-1 text-lg text-white/60">
          Désactivation : {formatDateTime(item.end_date)}
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={() => activateFlashChallenge(item.id)}
            disabled={item.is_active || (!!item.start_date && !item.is_active)}
            className="font-cormorant rounded-full bg-[#6163FC] px-5 py-2 text-lg font-semibold text-white transition hover:bg-[#7B7DFF] disabled:opacity-50"
          >
            Activer
          </button>

          <button
            onClick={() => deactivateFlashChallenge(item.id)}
            disabled={!item.is_active}
            className="font-cormorant rounded-full border border-white/20 px-5 py-2 text-lg font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
          >
            Désactiver
          </button>
        </div>

        {item.is_active && submissions.length > 0 && (
          <div className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="font-cinzel text-sm uppercase tracking-[0.2em] text-[#6163FC]">
              Réponses des joueurs
            </p>

            {submissions.map((submission) => (
              <div key={submission.id} className="border-b border-white/10 pb-3 last:border-b-0">
                <p className="font-cormorant text-xl text-white">
                  {getUsernameByUserId(submission.user_id)}
                </p>
                <p className="font-cormorant text-lg text-white/70">
                  Réponse : {submission.answer_text ?? "validé"}
                </p>
                {submission.answer_date && (
                  <p className="font-cormorant text-lg text-white/60">
                    Date saisie : {submission.answer_date}
                  </p>
                )}
                <p className="font-cormorant text-lg text-white/60">
                  Soumis le : {formatDateTime(submission.created_at)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  function renderFlashEventCard(item: FlashEvent) {
    const isUsed = !!item.start_date && !item.is_active;

    return (
      <div
        key={item.id}
        className={`rounded-2xl border p-5 ${
          item.is_active
            ? "border-[#6163FC]/50 bg-[#0E2028]/75"
            : isUsed
            ? "border-white/10 bg-black/10 opacity-60"
            : "border-white/10 bg-[#0E2028]/75"
        }`}
      >
        <h3 className="font-cinzel text-lg uppercase tracking-[0.2em] text-white">
          {item.title}
        </h3>

        {item.description && (
          <p className="font-cormorant mt-3 text-xl text-white/80">
            {item.description}
          </p>
        )}

        <p className="font-cormorant mt-4 text-lg text-white/60">
          Activation : {formatDateTime(item.start_date)}
        </p>
        <p className="font-cormorant mt-1 text-lg text-white/60">
          Désactivation : {formatDateTime(item.end_date)}
        </p>

        {item.affected_team_id && (
          <p className="font-cormorant mt-1 text-lg text-white/60">
            Équipe ciblée : {getTeamNameById(item.affected_team_id)}
          </p>
        )}

        {item.points_value !== null && item.points_value !== undefined && (
          <p className="font-cormorant mt-1 text-lg text-white/60">
            Valeur : {item.points_value}
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={() => activateFlashEvent(item.id)}
            disabled={item.is_active || (!!item.start_date && !item.is_active)}
            className="font-cormorant rounded-full bg-[#6163FC] px-5 py-2 text-lg font-semibold text-white transition hover:bg-[#7B7DFF] disabled:opacity-50"
          >
            Activer
          </button>

          <button
            onClick={() => deactivateFlashEvent(item.id)}
            disabled={!item.is_active}
            className="font-cormorant rounded-full border border-white/20 px-5 py-2 text-lg font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
          >
            Désactiver
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
  return (
    <main
      className="relative min-h-screen px-6 py-16 text-white"
      style={{
        backgroundImage: "url('/images/fond-faille.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute inset-0 bg-black/30" />

      <div className="relative z-10">
        <div className="mx-auto max-w-7xl">
          <p className="font-cormorant text-2xl">Chargement...</p>
        </div>
      </div>
    </main>
  );
}

  return (
  <main
    className="relative min-h-screen px-6 py-16 text-white"
    style={{
      backgroundImage: "url('/images/fond-faille.png')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundAttachment: "fixed",
    }}
  >
    <div className="absolute inset-0 bg-black/40" />

    <div className="relative z-10">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl border border-white/10 bg-[#0E2028]/70 p-8 shadow-xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-cinzel mb-4 text-sm uppercase tracking-[0.4em] text-[#6163FC]">
                Battle of Clans III
              </p>

              <h1 className="font-great-vibes text-6xl md:text-7xl">
                Mon espace Oracle
              </h1>

              <p className="font-cormorant mt-4 text-xl text-white/80">
                Connecté en tant que{" "}
                <span className="text-white">
                  {oracleProfile?.username ?? oracleProfile?.email}
                </span>
              </p>
            </div>

            <button
              onClick={logout}
              className="font-cormorant rounded-full bg-[#6163FC] px-8 py-3 text-xl font-semibold transition hover:bg-[#7B7DFF]"
            >
              Se déconnecter
            </button>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            {availableClanTabs.map((clanName) => (
              <button
                key={clanName}
                onClick={() => {
                  setActiveMainTab(clanName);
                  setActiveClanSubTab("general");
                }}
                className={`font-cormorant rounded-full px-5 py-2 text-lg font-semibold transition ${
                  activeMainTab === clanName
                    ? "bg-[#6163FC] text-white"
                    : "border border-white/15 bg-black/20 text-white/80 hover:bg-white/10"
                }`}
              >
                {getPluralClanName(clanName)}
              </button>
            ))}

            <button
              onClick={() => {
                setActiveMainTab("flash");
                setActiveFlashSubTab("defis");
              }}
              className={`font-cormorant rounded-full px-5 py-2 text-lg font-semibold transition ${
                activeMainTab === "flash"
                  ? "bg-[#6163FC] text-white"
                  : "border border-white/15 bg-black/20 text-white/80 hover:bg-white/10"
              }`}
            >
              Flash
            </button>
          </div>

          {activeMainTab !== "flash" && selectedTeam && (
            <div className="mt-6 flex flex-wrap gap-3">
              {[
                { id: "general", label: "Général" },
                { id: "defis", label: "Défis" },
                { id: "attaques", label: "Attaques" },
                { id: "infiltrations", label: "Infiltrations" },
                { id: "corruption", label: "Corruption" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveClanSubTab(tab.id as OracleClanSubTab)}
                  className={`font-cormorant rounded-full px-5 py-2 text-lg font-semibold transition ${
                    activeClanSubTab === tab.id
                      ? "bg-[#6163FC] text-white"
                      : "border border-white/15 bg-black/20 text-white/80 hover:bg-white/10"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {activeMainTab === "flash" && (
            <div className="mt-6 flex flex-wrap gap-3">
              {[
                { id: "defis", label: "Défis" },
                { id: "malus", label: "Malus" },
                { id: "regles", label: "Règles" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFlashSubTab(tab.id as OracleFlashSubTab)}
                  className={`font-cormorant rounded-full px-5 py-2 text-lg font-semibold transition ${
                    activeFlashSubTab === tab.id
                      ? "bg-[#6163FC] text-white"
                      : "border border-white/15 bg-black/20 text-white/80 hover:bg-white/10"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          <div className="mt-10 rounded-3xl border border-white/10 bg-black/20 p-8">
            {activeMainTab !== "flash" && selectedTeam && activeClanSubTab === "general" && (
              <div>
                <h2 className="font-cinzel mb-6 text-2xl uppercase tracking-[0.2em] text-[#6163FC]">
                  Général — {getPluralClanName(selectedTeam.name)}
                </h2>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-[#0E2028]/75 p-5">
                    <p className="font-cinzel text-sm uppercase tracking-[0.2em] text-[#6163FC]">
                      Score du clan
                    </p>
                    <p className="font-cormorant mt-3 text-4xl text-white">
                      {selectedTeam.score}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[#0E2028]/75 p-5">
                    <p className="font-cinzel text-sm uppercase tracking-[0.2em] text-[#6163FC]">
                      Classement
                    </p>
                    <p className="font-cormorant mt-3 text-4xl text-white">
                      {getClanRank(selectedTeam.id)}e
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[#0E2028]/75 p-5">
                    <p className="font-cinzel text-sm uppercase tracking-[0.2em] text-[#6163FC]">
                      Modifier le score du clan
                    </p>

                    <input
                      type="number"
                      value={teamPointInput[selectedTeam.id] ?? ""}
                      onChange={(e) =>
                        setTeamPointInput((prev) => ({
                          ...prev,
                          [selectedTeam.id]: e.target.value,
                        }))
                      }
                      placeholder="Nombre de points"
                      className="font-cormorant mt-4 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-lg text-white outline-none"
                    />

                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={() =>
                          adjustTeamScore(
                            selectedTeam.id,
                            Number(teamPointInput[selectedTeam.id] ?? 0)
                          )
                        }
                        className="font-cormorant rounded-full bg-[#6163FC] px-5 py-2 text-lg font-semibold text-white transition hover:bg-[#7B7DFF]"
                      >
                        Ajouter
                      </button>

                      <button
                        onClick={() =>
                          adjustTeamScore(
                            selectedTeam.id,
                            -Number(teamPointInput[selectedTeam.id] ?? 0)
                          )
                        }
                        className="font-cormorant rounded-full border border-white/20 px-5 py-2 text-lg font-semibold text-white transition hover:bg-white/10"
                      >
                        Retirer
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-8 rounded-2xl border border-white/10 bg-[#0E2028]/75 p-5">
                  <h3 className="font-cinzel text-lg uppercase tracking-[0.2em] text-white">
                    Membres du clan
                  </h3>

                  <div className="mt-5 space-y-4">
                    {clanMembers.map((member) => (
  <div
    key={member.id}
    className="rounded-2xl border border-white/10 bg-black/20 p-5"
  >
    <p className="font-cormorant text-2xl text-white">
      {member.username ?? member.email}
      {member.role === "chief" && (
        <span className="ml-3 text-[#6163FC]">• Chef</span>
      )}
    </p>

    <p className="font-cormorant mt-2 text-lg text-white/70">
      Score individuel : {getMemberPersonalScore(member.id) + (member.bonus_points ?? 0)}
    </p>

    <div className="mt-4">
      <input
        type="number"
        value={memberPointInput[member.id] ?? ""}
        onChange={(e) =>
          setMemberPointInput((prev) => ({
            ...prev,
            [member.id]: e.target.value,
          }))
        }
        placeholder="Nombre de points"
        className="font-cormorant w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-lg text-white outline-none"
      />

      <div className="mt-4 flex gap-3">
        <button
          onClick={() =>
            adjustMemberScore(
              member.id,
              Number(memberPointInput[member.id] ?? 0)
            )
          }
          className="font-cormorant rounded-full bg-[#6163FC] px-5 py-2 text-lg font-semibold text-white transition hover:bg-[#7B7DFF]"
        >
          Ajouter
        </button>

        <button
          onClick={() =>
            adjustMemberScore(
              member.id,
              -Number(memberPointInput[member.id] ?? 0)
            )
          }
          className="font-cormorant rounded-full border border-white/20 px-5 py-2 text-lg font-semibold text-white transition hover:bg-white/10"
        >
          Retirer
        </button>
      </div>
    </div>
  </div>
))}
                  </div>
                </div>
              </div>
            )}

            {activeMainTab !== "flash" && selectedTeam && activeClanSubTab === "defis" && (
              <div>
                <h2 className="font-cinzel mb-6 text-2xl uppercase tracking-[0.2em] text-[#6163FC]">
                  Défis — {getPluralClanName(selectedTeam.name)}
                </h2>

                <div className="space-y-4">
                  {clanChallengeHistory.map((row) => (
                    <div
                      key={row.id}
                      className="rounded-2xl border border-white/10 bg-[#0E2028]/75 p-5"
                    >
                      <p className="font-cormorant text-2xl text-white">
                        {getUsernameByUserId(row.user_id)}
                      </p>
                      <p className="font-cormorant mt-2 text-lg text-white/80">
                        Défi : {getChallengeTitle(row)}
                      </p>
                      <p className="font-cormorant mt-1 text-lg text-white/80">
                        Livre : {getBookTitle(row)}
                      </p>
                      <p className="font-cormorant mt-1 text-lg text-white/80">
                        Points : {getChallengePoints(row)}
                      </p>
                      <p className="font-cormorant mt-1 text-lg text-white/60">
                        Validé le : {formatDateTime(row.created_at)}
                      </p>

                      <button
                        onClick={() => handleCancelChallenge(row)}
                        className="font-cormorant mt-4 rounded-full border border-red-400/40 px-5 py-2 text-lg font-semibold text-red-300 transition hover:bg-red-400/10"
                      >
                        Annuler
                      </button>
                    </div>
                  ))}

                  {clanChallengeHistory.length === 0 && (
                    <p className="font-cormorant text-2xl text-white/70">
                      Aucun défi pour ce clan.
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeMainTab !== "flash" && selectedTeam && activeClanSubTab === "attaques" && (
              <div>
                <h2 className="font-cinzel mb-6 text-2xl uppercase tracking-[0.2em] text-[#6163FC]">
                  Attaques — {getPluralClanName(selectedTeam.name)}
                </h2>

                <div className="space-y-4">
                  {clanAttacks.map((attack) => (
                    <div
                      key={attack.id}
                      className="rounded-2xl border border-white/10 bg-[#0E2028]/75 p-5"
                    >
                      <p className="font-cormorant text-2xl text-white">
                        {attack.attack_name}
                      </p>
                      <p className="font-cormorant mt-2 text-lg text-white/80">
                        Équipe cible : {getTeamNameById(attack.target_team_id)}
                      </p>
                      <p className="font-cormorant mt-1 text-lg text-white/80">
                        Coût : {attack.attack_cost}
                      </p>
                      <p className="font-cormorant mt-1 text-lg text-white/80">
                        Points retirés : {attack.points_removed}
                      </p>
                      <p className="font-cormorant mt-1 text-lg text-white/80">
                        Statut : {getAttackStatus(attack)}
                      </p>
                      <p className="font-cormorant mt-1 text-lg text-white/60">
                        Lancée le : {formatDateTime(attack.created_at)}
                      </p>

                      <button
                        onClick={() => handleCancelAttack(attack)}
                        className="font-cormorant mt-4 rounded-full border border-red-400/40 px-5 py-2 text-lg font-semibold text-red-300 transition hover:bg-red-400/10"
                      >
                        Annuler
                      </button>
                    </div>
                  ))}

                  {clanAttacks.length === 0 && (
                    <p className="font-cormorant text-2xl text-white/70">
                      Aucune attaque pour ce clan.
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeMainTab !== "flash" &&
              selectedTeam &&
              activeClanSubTab === "infiltrations" && (
                <div>
                  <h2 className="font-cinzel mb-6 text-2xl uppercase tracking-[0.2em] text-[#6163FC]">
                    Infiltrations — {getPluralClanName(selectedTeam.name)}
                  </h2>

                  <div className="grid gap-4 md:grid-cols-2">
                    {clanInfiltrationEnemyTeams.map((enemyTeam) => {
                      const latestInfiltration = infiltrations
  .filter(
    (item) =>
      item.target_team_id === selectedTeam.id &&
      item.attacking_team_id === enemyTeam.id
  )
  .sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )[0];
  const activeAttackForEnemyTeam = attacks.find(
  (attack) =>
    attack.attacking_team_id === enemyTeam.id &&
    attack.target_team_id === selectedTeam.id &&
    attack.canceled_by_infiltration !== true &&
    attack.expires_at &&
    new Date(attack.expires_at) > new Date()
);

                      const relatedCancelledAttack = attacks.find(
                        (attack) =>
                          attack.attacking_team_id === enemyTeam.id &&
                          attack.target_team_id === selectedTeam.id &&
                          attack.canceled_by_infiltration
                      );

                      return (
                        <div
                          key={enemyTeam.id}
                          className="rounded-2xl border border-white/10 bg-[#0E2028]/75 p-5"
                        >
                          <h3 className="font-cinzel text-lg uppercase tracking-[0.2em] text-white">
                            {getPluralClanName(enemyTeam.name)}
                          </h3>
                          <div className="mt-3">
  <button
    onClick={() =>
      disableInfiltrationByOracle(enemyTeam.id, selectedTeam.id)
    }
    className="font-cormorant rounded-full border border-red-500/30 px-4 py-2 text-red-400 transition hover:bg-red-500/10"
  >
    Désactiver l’infiltration
  </button>
</div>

                          {!latestInfiltration ? (
                            <p className="font-cormorant mt-4 text-xl text-white/70">
                              Aucune tentative d’infiltration contre cette équipe.
                            </p>
                          ) : latestInfiltration.status === "success" ? (
                            <div className="mt-4 space-y-2">
                              <p className="font-cormorant text-xl text-white">
                                Code trouvé le {formatDateTime(latestInfiltration.created_at)}
                              </p>
                              {relatedCancelledAttack && (
                                <p className="font-cormorant text-xl text-white/80">
                                  Attaque annulée : {relatedCancelledAttack.attack_name}
                                </p>
                              )}
                            </div>
                          ) : latestInfiltration.status === "failed" ? (
  <div className="mt-4 space-y-2">
  <p className="font-cormorant text-xl text-red-400">
    Infiltration échouée le{" "}
    {formatDateTime(
      latestInfiltration.updated_at ||
      latestInfiltration.expires_at ||
      latestInfiltration.created_at
    )}
  </p>

  <p className="font-cormorant text-lg text-white/60">
    Cause :{" "}
    {latestInfiltration.guess === "Désactivée par les Oracles - Distorsion"
  ? "Pénalité corruption Distorsion"
  : latestInfiltration.attempts_used >= latestInfiltration.max_attempts
  ? "3 essais incorrects"
  : "attaque expirée"}
  </p>
</div>
) : latestInfiltration.status === "expired" ||
  (latestInfiltration.expires_at &&
    new Date(latestInfiltration.expires_at) <= new Date()) ? (
  <div className="mt-4 space-y-2">
    <p className="font-cormorant text-xl text-red-400">
      Infiltration expirée.
    </p>
    <p className="font-cormorant text-lg text-white/60">
      Le : {formatDateTime(latestInfiltration.expires_at)}
    </p>
  </div>
) : !activeAttackForEnemyTeam ? (
  <div className="mt-4 space-y-2">
  <p className="font-cormorant text-xl text-red-400">
    Infiltration expirée.
  </p>
  <p className="font-cormorant text-lg text-white/60">
    L’attaque n’est plus active.
  </p>

  {latestInfiltration.expires_at && (
    <p className="font-cormorant text-lg text-white/60">
      Le : {formatDateTime(latestInfiltration.expires_at)}
    </p>
  )}
</div>
) : (
  <p className="font-cormorant mt-4 text-xl text-white/80">
    Infiltration en cours.
  </p>
)}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {activeMainTab !== "flash" &&
  selectedTeam &&
  activeClanSubTab === "corruption" && (
    <div>
      <h2 className="font-cinzel mb-6 text-2xl uppercase tracking-[0.2em] text-[#6163FC]">
        Corruptions — {getPluralClanName(selectedTeam.name)}
      </h2>

      <div className="space-y-8">
        {["light", "medium"].map((severity) => {
          const severityLabel =
            severity === "light"
              ? "Corruptions légères"
              : "Corruptions modérées";

          const teamCorruptions = getTeamCorruptionEvents(selectedTeam.id)
            .filter((event) => {
              const type = getCorruptionType(event.corruption_type_id);
              return type?.severity === severity;
            });

          return (
            <div
              key={severity}
              className="rounded-2xl border border-white/10 bg-[#0E2028]/75 p-5"
            >
              <h3 className="font-cinzel text-lg uppercase tracking-[0.2em] text-white">
                {severityLabel}
              </h3>

              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {teamCorruptions.map((corruptionEvent) => {
                  const corruptionType = getCorruptionType(
                    corruptionEvent.corruption_type_id
                  );

                  if (!corruptionType) return null;

                  return (
                    <div
                      key={corruptionEvent.id}
                      className={`rounded-2xl border p-5 ${
                        corruptionEvent.is_deleted
                          ? "border-white/10 bg-black/10 opacity-50"
                          : corruptionEvent.is_active
                          ? "border-[#6163FC]/40 bg-[#6163FC]/10"
                          : "border-white/10 bg-black/20"
                      }`}
                    >
                      <h4 className="font-cinzel text-lg text-[#6163FC]">
                        {corruptionType.title}
                      </h4>

                      <p className="font-cormorant mt-3 text-lg text-white/80">
                        {corruptionType.description}
                      </p>

                      <div className="mt-4 space-y-2 text-sm text-white/60">
                        <p>
                          Statut :{" "}
                          {corruptionEvent.is_deleted
                            ? "Supprimée"
                            : corruptionEvent.is_active
                            ? "Active"
                            : "Inactive"}
                        </p>

                        {corruptionEvent.activated_at && (
                          <p>
                            Activée le :{" "}
                            {formatDateTime(corruptionEvent.activated_at)}
                          </p>
                        )}

                        {corruptionEvent.deactivated_at && (
                          <p>
                            Désactivée le :{" "}
                            {formatDateTime(corruptionEvent.deactivated_at)}
                          </p>
                        )}

                        {corruptionEvent.deleted_at && (
                          <p>
                            Supprimée le :{" "}
                            {formatDateTime(corruptionEvent.deleted_at)}
                          </p>
                        )}
                      </div>

                      {!corruptionEvent.is_deleted && (
                        <div className="mt-5 flex flex-wrap gap-2">
                          <button
                            onClick={() =>
                              toggleCorruption(corruptionEvent, true)
                            }
                            disabled={corruptionEvent.is_active}
                            className="font-cormorant rounded-full bg-[#6163FC] px-4 py-2 text-white disabled:opacity-50"
                          >
                            Activer
                          </button>

                          <button
                            onClick={() =>
                              toggleCorruption(corruptionEvent, false)
                            }
                            disabled={!corruptionEvent.is_active}
                            className="font-cormorant rounded-full border border-white/20 px-4 py-2 text-white disabled:opacity-50"
                          >
                            Désactiver
                          </button>

                          <button
                            onClick={() =>
                              deleteCorruption(corruptionEvent)
                            }
                            className="font-cormorant rounded-full border border-red-500/30 px-4 py-2 text-red-400"
                          >
                            Supprimer
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
)}

            {activeMainTab === "flash" && activeFlashSubTab === "defis" && (
              <div>
                <h2 className="font-cinzel mb-6 text-2xl uppercase tracking-[0.2em] text-[#6163FC]">
                  Flash — Défis
                </h2>

                <div className="grid gap-4 md:grid-cols-2">
                  {flashDefis.map((item) => renderFlashCard(item))}
                </div>
              </div>
            )}

            {activeMainTab === "flash" && activeFlashSubTab === "malus" && (
              <div>
                <h2 className="font-cinzel mb-6 text-2xl uppercase tracking-[0.2em] text-[#6163FC]">
                  Flash — Malus
                </h2>

                <div className="grid gap-4 md:grid-cols-2">
                  {flashMalus.map((item) => renderFlashCard(item))}
                </div>
              </div>
            )}

            {activeMainTab === "flash" && activeFlashSubTab === "regles" && (
  <div>
    <h2 className="font-cinzel mb-6 text-2xl uppercase tracking-[0.2em] text-[#6163FC]">
      Flash — Règles
    </h2>

    {flashEvents.length === 0 ? (
      <p className="font-cormorant text-2xl text-white/70">
        Aucune règle flash trouvée.
      </p>
    ) : (
      <div className="grid gap-4 md:grid-cols-2">
        {flashEvents.map((item) => renderFlashEventCard(item))}
      </div>
    )}
  </div>
)}
          </div>

          {message && (
            <p
              className={`font-cormorant mt-6 text-lg ${
                messageType === "success" ? "text-[#6163FC]" : "text-red-400"
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </div>
      </div>
      <ConfirmModal
  isOpen={confirmModalOpen}
  title={confirmModalTitle}
  message={confirmModalMessage}
  confirmLabel={confirmModalConfirmLabel}
  cancelLabel={confirmModalCancelLabel}
  danger={confirmModalDanger}
  onCancel={() => {
    setConfirmModalOpen(false);
    setConfirmAction(null);
  }}
  onConfirm={() => {
    if (confirmAction) {
      confirmAction();
    }

    setConfirmModalOpen(false);
    setConfirmAction(null);
  }}
/>
    </main>
  );
}
