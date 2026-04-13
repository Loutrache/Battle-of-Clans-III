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
};

type Team = {
  id: number;
  name: string;
  score: number;
  corruption_active: boolean;
};

type AttackType = {
  id: number;
  team_id: number;
  attack_name: string;
  attack_level: string;
  attack_cost: number;
  points_removed: number;
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
type Infiltration = {
  id: number;
  attacking_team_id: number;
  target_team_id: number;
  guess: string | null;
  success: boolean;
  attempts_used: number;
  max_attempts: number;
  total_clue_penalty: number;
  status: string;
  started_at: string | null;
  expires_at: string | null;
  hint_1_unlocked: boolean;
  hint_2_unlocked: boolean;
  hint_3_unlocked: boolean;
  hint_4_unlocked: boolean;
  successful_attack_id: number | null;
  created_at: string;
  updated_at: string | null;
};

type Challenge = {
  id: number;
  title: string;
  description: string;
  point: number;
  category: string;
  is_flash: boolean;
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

type TabId =
  | "clan"
  | "conseil"
  | "infiltration"
  | "validation"
  | "mes-defis"
  | "flash";
type WarTabId = "arsenal" | "declarer" | "carnet";

export default function MonEspacePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [attackTypes, setAttackTypes] = useState<AttackType[]>([]);
  const [receivedAttacks, setReceivedAttacks] = useState<AttackLog[]>([]);
const [launchedAttacks, setLaunchedAttacks] = useState<AttackLog[]>([]);
  const [personalScore, setPersonalScore] = useState(0);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  
  const [completedChallengeIds, setCompletedChallengeIds] = useState<number[]>([]);
  const [completedChallengesData, setCompletedChallengesData] = useState<any[]>([]);
  const [message, setMessage] = useState("");
const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [activeTab, setActiveTab] = useState<TabId>("clan");
  const [activeWarTab, setActiveWarTab] = useState<WarTabId>("arsenal");
  const [selectedTargetTeam, setSelectedTargetTeam] = useState("");
const [selectedAttackId, setSelectedAttackId] = useState("");
const [infiltrationGuess, setInfiltrationGuess] = useState("");
const [secretCodeClues, setSecretCodeClues] = useState<any[]>([]);
const [submittingAttack, setSubmittingAttack] = useState(false);
const [startingInfiltrationForClanId, setStartingInfiltrationForClanId] = useState<number | null>(null);
const [flashAnswers, setFlashAnswers] = useState<Record<number, string>>({});
const [submittingFlashId, setSubmittingFlashId] = useState<number | null>(null);
const [activeFlashEvents, setActiveFlashEvents] = useState<any[]>([]);



  const [bookTitle, setBookTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [pages, setPages] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedChallenge, setSelectedChallenge] = useState("");
  const [selectedSecondChallenge, setSelectedSecondChallenge] = useState("");
  const [submittingChallenge, setSubmittingChallenge] = useState(false);
  const [activeFlashChallenges, setActiveFlashChallenges] = useState<any[]>([]);
const [flashSubmissions, setFlashSubmissions] = useState<any[]>([]);
const [flashAnswerText, setFlashAnswerText] = useState("");
const [flashAnswerDate, setFlashAnswerDate] = useState("");
const [submittingFlash, setSubmittingFlash] = useState(false);
  const [infiltrations, setInfiltrations] = useState<any[]>([]);
const [activeEnemyAttacks, setActiveEnemyAttacks] = useState<any[]>([]);
const [corruptionTypes, setCorruptionTypes] = useState<CorruptionType[]>([]);
const [corruptionEvents, setCorruptionEvents] = useState<CorruptionEvent[]>([]);
const [confirmModalOpen, setConfirmModalOpen] = useState(false);
const [confirmModalTitle, setConfirmModalTitle] = useState("");
const [confirmModalMessage, setConfirmModalMessage] = useState("");
const [confirmModalDanger, setConfirmModalDanger] = useState(false);
const [confirmModalConfirmLabel, setConfirmModalConfirmLabel] = useState("Confirmer");
const [confirmModalCancelLabel, setConfirmModalCancelLabel] = useState("Annuler");
const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);

async function markExpiredInfiltrationsAsFailed(teamId: number) {
  const now = new Date().toISOString();

  const { data: expiredInfiltrations, error } = await supabase
    .from("infiltrations")
    .select("*")
    .eq("target_team_id", teamId)
    .eq("status", "active")
    .lt("expires_at", now);

  if (error || !expiredInfiltrations || expiredInfiltrations.length === 0) {
    return;
  }

  const ids = expiredInfiltrations.map((item) => item.id);

  await supabase
    .from("infiltrations")
    .update({ status: "failed" })
    .in("id", ids);
}
  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/connexion";
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError || !profileData) {
        setMessage("Impossible de charger votre profil.");
        const { data: attacksData, error: attacksError } = await supabase
  .from("attacks")
  .select("*");
if (attacksData) {
  const now = new Date();

  const filteredAttacks = attacksData.filter((attack) => {
    const expiresAt = attack.expires_at
      ? new Date(attack.expires_at)
      : null;

    return (
      Number(attack.target_team_id) === Number(profileData.team_id) &&
      attack.canceled_by_infiltration !== true &&
      expiresAt &&
      expiresAt > now
    );
  });

  setActiveEnemyAttacks(filteredAttacks);
}

const { data: infiltrationsData } = await supabase
  .from("infiltrations")
  .select("*")
  .eq("target_team_id", profileData.team_id);

if (infiltrationsData) {
  setInfiltrations(infiltrationsData);
}
        setLoading(false);
        return;
      }

      setProfile(profileData);
      if (profileData.team_id) {
  await markExpiredInfiltrationsAsFailed(profileData.team_id);
}
      const { data: completedWithChallenges } = await supabase
  .from("completed_challenges")
  .select(`
    challenge_id,
    book_submission_id,
    challenges (
      id,
      title,
      point
    ),
    book_submissions (
      book_title
    )
  `)
  .eq("user_id", profileData.id);

if (completedWithChallenges) {
  setCompletedChallengesData(completedWithChallenges);
  setCompletedChallengeIds(
    completedWithChallenges.map((item: any) => item.challenge_id)
  );

  const total = completedWithChallenges.reduce((sum, item: any) => {
    const challengePoints = item.challenges?.point ?? 0;
    return sum + challengePoints;
  }, 0);

  setPersonalScore(total);
}

      const { data: teamsData } = await supabase
        .from("Teams")
        .select("*")
        .order("score", { ascending: false });

      if (teamsData) {
        setAllTeams(teamsData);
      }

      const { data: challengesData, error: challengesError } = await supabase
  .from("challenges")
  .select("*")
  .eq("is_flash", false)
  .eq("is_active", true);
  

console.log("CHALLENGES DATA:", challengesData);
console.log("CHALLENGES ERROR:", challengesError);

if (challengesData) {
  setChallenges(challengesData);
}
const { data: activeFlashData } = await supabase
  .from("challenges")
  .select("*")
  .eq("is_flash", true)
  .eq("is_active", true);

if (activeFlashData) {
  setActiveFlashChallenges(activeFlashData);
}
const { data: activeFlashEventsData } = await supabase
  .from("flash_events")
  .select("*")
  .eq("is_active", true);

if (activeFlashEventsData) {
  setActiveFlashEvents(activeFlashEventsData);
}

const { data: flashSubmissionsData } = await supabase
  .from("flash_submissions")
  .select("*")
  .eq("user_id", profileData.id)
  .order("created_at", { ascending: false });

if (flashSubmissionsData) {
  setFlashSubmissions(flashSubmissionsData);
}


     if (profileData.team_id) {
  const { data: teamData } = await supabase
    .from("Teams")
    .select("*")
    .eq("id", profileData.team_id)
    .single();

  if (teamData) {
    setTeam(teamData);
  }

  const { data: attackData } = await supabase
    .from("attack_types")
    .select("*")
    .eq("team_id", profileData.team_id)
    .order("attack_cost", { ascending: true });

  if (attackData) {
    setAttackTypes(attackData);
  }

  const { data: receivedData } = await supabase
    .from("attacks")
    .select("*")
    .eq("target_team_id", profileData.team_id)
    .order("id", { ascending: false });

  if (receivedData) {
    setReceivedAttacks(receivedData);
  }

  const { data: launchedData } = await supabase
    .from("attacks")
    .select("*")
    .eq("attacking_team_id", profileData.team_id)
    .order("id", { ascending: false });

  if (launchedData) {
    setLaunchedAttacks(launchedData);
  }
  const { data: cluesData } = await supabase
  .from("secret_code_clues")
  .select(`
    *,
    secret_codes!inner(
      id,
      team_id
    )
  `)
  .order("clue_order", { ascending: true });

if (cluesData) {
  setSecretCodeClues(cluesData);
}
  const { data: attacksData, error: attacksError } = await supabase
  .from("attacks")
  .select("*");

if (attacksData) {
  const now = new Date();

  const filteredAttacks = attacksData.filter((attack) => {
    const expiresAt = attack.expires_at
      ? new Date(attack.expires_at)
      : null;

    return (
      Number(attack.target_team_id) === Number(profileData.team_id) &&
      attack.canceled_by_infiltration !== true &&
      expiresAt &&
      expiresAt > now
    );
  });

  setActiveEnemyAttacks(filteredAttacks);
}

const { data: infiltrationsData, error: infiltrationsError } = await supabase
  .from("infiltrations")
  .select("*")
  .eq("target_team_id", profileData.team_id);

if (infiltrationsData) {
  setInfiltrations(infiltrationsData);
}
const { data: corruptionTypesData } = await supabase
  .from("corruption_types")
  .select("*");

if (corruptionTypesData) {
  setCorruptionTypes(corruptionTypesData as CorruptionType[]);
}

const { data: corruptionEventsData } = await supabase
  .from("corruption_events")
  .select("*")
  .eq("affected_team_id", teamData.id)
  .eq("is_active", true)
  .eq("is_deleted", false);

if (corruptionEventsData) {
  setCorruptionEvents(corruptionEventsData as CorruptionEvent[]);
}
}

      setLoading(false);
    }

    loadProfile();
  }, []);

  const isChief = profile?.role === "chief";
  const isOracle = profile?.role === "oracle";

  const availableTabs = useMemo(() => {
    const baseTabs = [
      { id: "clan" as TabId, label: "Clan" },
      { id: "validation" as TabId, label: "Validation de défis" },
      { id: "mes-defis" as TabId, label: "Mes défis" },
      { id: "flash" as TabId, label: "Flash" },
    ];

    baseTabs.splice(1, 0, { id: "conseil" as TabId, label: "Conseil de guerre" });
baseTabs.splice(2, 0, { id: "infiltration" as TabId, label: "Infiltration" });

    return baseTabs;
  }, [isChief, isOracle]);

  const clanRank = useMemo(() => {
    if (!team || allTeams.length === 0) return null;
    const index = allTeams.findIndex((t) => t.id === team.id);
    return index >= 0 ? index + 1 : null;
  }, [team, allTeams]);
const repeatableChallengeTitle = "Erreur des Oracles";
const availableChallenges = useMemo(() => {
  return challenges.filter(
    (challenge) =>
      challenge.title === repeatableChallengeTitle ||
      !completedChallengeIds.includes(challenge.id)
  );
}, [challenges, completedChallengeIds]);

  const enemyClans = useMemo(() => {
  if (!team) return [];
  return allTeams.filter((t) => t.id !== team.id);
}, [team, allTeams]);
const getActiveAttackFromClan = (enemyClanId: number) => {
  return receivedAttacks.find((attack) => {
    const expiresAt = attack.expires_at ? new Date(attack.expires_at) : null;

    return (
      Number(attack.attacking_team_id) === Number(enemyClanId) &&
      attack.canceled_by_infiltration !== true &&
      expiresAt &&
      expiresAt > new Date()
    );
  });
};

const getInfiltrationAgainstClan = (enemyClanId: number) => {
  return infiltrations
    .filter(
      (infiltration) =>
        Number(infiltration.attacking_team_id) === Number(enemyClanId) &&
        Number(infiltration.target_team_id) === Number(team?.id)
    )
    .sort(
      (a, b) =>
        new Date(b.started_at ?? b.created_at).getTime() -
        new Date(a.started_at ?? a.created_at).getTime()
    )[0];
};
const getCluesForClan = (enemyClanId: number) => {
  return secretCodeClues.filter(
    (clue) =>
      Number(clue.secret_codes?.team_id) === Number(enemyClanId)
  );
};
const oraclesMagnanimesActive = activeFlashEvents.some(
  (flash) => flash.title === "Oracles magnanimes"
);
const selectedAttack = useMemo(() => {
  return attackTypes.find(
    (attack) => String(attack.id) === selectedAttackId
  );
}, [attackTypes, selectedAttackId]);

const usedAttackNames = useMemo(() => {
  return launchedAttacks.map((attack) => attack.attack_name);
}, [launchedAttacks]);

const availableAttackTypes = useMemo(() => {
  return attackTypes.filter(
    (attack) => !usedAttackNames.includes(attack.attack_name)
  );
}, [attackTypes, usedAttackNames]);
const failleOuverteActive = activeFlashEvents.some(
  (flash) => flash.title === "Faille ouverte"
);

const selectedAttackCost = useMemo(() => {
  if (!selectedAttack) return 0;

  if (failleOuverteActive) {
    return Math.max(0, selectedAttack.attack_cost - 5);
  }

  return selectedAttack.attack_cost;
}, [selectedAttack, failleOuverteActive]);
const canAffordSelectedAttack = useMemo(() => {
  if (!team || !selectedAttack) return false;
  return (team.score ?? 0) >= selectedAttackCost;
}, [team, selectedAttack]);
function getAttackLevelLabel(level: string) {
  if (level === "small") return "Petite attaque";
  if (level === "medium") return "Attaque moyenne";
  if (level === "large") return "Grande attaque";
  return level;
}
function getTeamNameById(teamId: number, allTeams: Team[]) {
  return allTeams.find((team) => team.id === teamId)?.name ?? "Clan inconnu";
}
function getPluralClanName(name: string) {
  if (name === "Vampire") return "Vampires";
  if (name === "Sorcière") return "Sorcières";
  if (name === "Dragon") return "Dragons";
  if (name === "Nécromancien") return "Nécromanciens";
  if (name === "Faë") return "Faë";
  return name;
}
function getCorruptionTypeById(corruptionTypeId: number) {
  return corruptionTypes.find(
    (corruption) => corruption.id === corruptionTypeId
  );
}
function formatAttackDate(dateString: string) {
  return new Date(dateString).toLocaleString("fr-FR", {
    timeZone: "Europe/Paris",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
function getRemainingTime(expiresAt: string) {
  const now = new Date();
  const end = new Date(expiresAt);
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) return "Expirée";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours}h ${minutes}min`;
}
function isInfiltrationClosed(infiltration: Infiltration | undefined | null) {
  if (!infiltration) return false;

  return (
    infiltration.status === "success" ||
    infiltration.status === "failed" ||
    infiltration.status === "expired" ||
    (infiltration.expires_at &&
      new Date(infiltration.expires_at) <= new Date())
  );
}
const instabilityActive = corruptionEvents.some((event) => {
  const corruption = getCorruptionTypeById(event.corruption_type_id);

  return (
    corruption?.title?.toLowerCase() === "instabilité" &&
    event.is_active
  );
});
const chiefTitle = useMemo(() => {
  if (!team) return "";

  const titles: Record<string, string> = {
    Vampire: "Vampire en chef",
    Sorcière: "Sorcière en chef",
    Dragon: "Dragon en chef",
    Nécromancien: "Nécromancien en chef",
    "Faë": "Faë en chef",
  };

  return titles[team.name] ?? "Chef de clan";
}, [team]);

const challengesByPoints = useMemo(() => {
  const grouped = [...challenges].sort((a, b) => a.point - b.point);

  return grouped.reduce((acc, challenge) => {
    const key = challenge.point;
    if (!acc[key]) acc[key] = [];
    acc[key].push(challenge);
    return acc;
  }, {} as Record<number, Challenge[]>);
}, [challenges]);

  async function confirmClan() {
    if (!profile) return;

    const { error } = await supabase
      .from("profiles")
      .update({ clan_confirmed: true })
      .eq("id", profile.id);

    if (error) {
      setMessage("Impossible de confirmer votre clan.");
      return;
    }

    window.location.reload();
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }
  async function handleAttackSubmit() {
  if (!team || !selectedTargetTeam || !selectedAttack) return;

  if ((team.score ?? 0) < selectedAttackCost) {
    setMessageType("error");
    setMessage("Votre clan n’a pas assez de points pour lancer cette attaque.");
    return;
  }

  const targetTeam = allTeams.find(
    (t) => t.id === Number(selectedTargetTeam)
  );

  if (!targetTeam) {
    setMessageType("error");
    setMessage("Clan cible introuvable.");
    return;
  }
  const existingActiveAttackAgainstTarget = launchedAttacks.find((attack) => {
  const expiresAt = attack.expires_at ? new Date(attack.expires_at) : null;

  return (
    Number(attack.target_team_id) === Number(selectedTargetTeam) &&
    expiresAt &&
    expiresAt > new Date()
  );
});

if (existingActiveAttackAgainstTarget) {
  setMessageType("error");
  setMessage(
    "Une attaque contre ce clan est déjà active. Vous devez attendre son expiration avant d’en relancer une."
  );
  return;
}

  setSubmittingAttack(true);
  setMessage("");
  setMessageType("");

  const { data: insertedAttack, error } = await supabase
    .from("attacks")
    .insert({
  attacking_team_id: team.id,
  target_team_id: Number(selectedTargetTeam),
  attack_name: selectedAttack.attack_name,
 attack_cost: selectedAttackCost,
  points_removed: selectedAttack.points_removed,
  canceled_by_infiltration: false,
  expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
})
    .select()
    .single();

  if (error) {
    setMessageType("error");
    setMessage("Impossible de lancer l’attaque.");
    setSubmittingAttack(false);
    return;
  }

  const newAttackingScore = (team.score ?? 0) - selectedAttackCost;
  const newTargetScore = (targetTeam.score ?? 0) - selectedAttack.points_removed;

  const { error: attackingScoreError } = await supabase
    .from("Teams")
    .update({ score: newAttackingScore })
    .eq("id", team.id);

  if (attackingScoreError) {
    setMessageType("error");
    setMessage("Attaque lancée, mais impossible de mettre à jour le score de votre clan.");
    setSubmittingAttack(false);
    return;
  }

  const { error: targetScoreError } = await supabase
    .from("Teams")
    .update({ score: newTargetScore })
    .eq("id", targetTeam.id);

  if (targetScoreError) {
    setMessageType("error");
    setMessage("Attaque lancée, mais impossible de retirer les points au clan adverse.");
    setSubmittingAttack(false);
    return;
  }

  setTeam({
    ...team,
    score: newAttackingScore,
  });

  setAllTeams((prev) =>
    prev.map((t) => {
      if (t.id === team.id) {
        return { ...t, score: newAttackingScore };
      }
      if (t.id === targetTeam.id) {
        return { ...t, score: newTargetScore };
      }
      return t;
    })
  );

  if (insertedAttack) {
    setLaunchedAttacks((prev) => [insertedAttack, ...prev]);
  }

  setMessageType("success");
  setMessage("Attaque lancée avec succès.");
  setSelectedTargetTeam("");
  setSelectedAttackId("");
  setSubmittingAttack(false);
}
async function handleStartInfiltration(enemyClanId: number) {
  if (!team) return;
  const existingInfiltration = getInfiltrationAgainstClan(enemyClanId);

if (existingInfiltration) {
  setMessageType("error");
  setMessage("Une infiltration a déjà été utilisée contre ce clan.");
  return;
}

  const activeAttack = getActiveAttackFromClan(enemyClanId);

  if (!activeAttack) {
    setMessageType("error");
    setMessage("Aucune attaque active de ce clan.");
    return;
  }

  setStartingInfiltrationForClanId(enemyClanId);
  setMessage("");
  setMessageType("");

 const startedAt = new Date();

const distorsionActive = corruptionEvents.some((event) => {
  const corruption = getCorruptionTypeById(event.corruption_type_id);

  return (
    corruption?.title?.toLowerCase() === "distorsion" &&
    event.is_active
  );
});

const expiresAt = distorsionActive
  ? new Date(startedAt.getTime() + 24 * 60 * 60 * 1000)
  : activeAttack.expires_at
  ? new Date(activeAttack.expires_at)
  : new Date(startedAt.getTime() + 48 * 60 * 60 * 1000);

  const { data: newInfiltration, error } = await supabase
    .from("infiltrations")
    .insert({
      attacking_team_id: enemyClanId,
      target_team_id: team.id,
      status: "active",
      started_at: startedAt.toISOString(),
      expires_at: expiresAt.toISOString(),
      attempts_used: 0,
      max_attempts: 3,
      success: false,
      guess: null,
      total_clue_penalty: 0,
      hint_1_unlocked: false,
      hint_2_unlocked: false,
      hint_3_unlocked: false,
      hint_4_unlocked: false,
      successful_attack_id: null,
    })
    .select()
    .single();

  if (error) {
  setMessageType("error");
  setMessage("Impossible de commencer l’infiltration.");
  setStartingInfiltrationForClanId(null);
  return;
}

  setInfiltrations((prev) => [...prev, newInfiltration]);
  setMessageType("success");
  setMessage("Infiltration commencée.");
  setStartingInfiltrationForClanId(null);
}
async function handleValidateInfiltration(
  infiltration: Infiltration,
  enemyClanName: string
) {
  if (!team) return;
  if (
  infiltration.expires_at &&
  new Date(infiltration.expires_at) <= new Date()
) {
  await supabase
    .from("infiltrations")
    .update({
      status: "failed",
    })
    .eq("id", infiltration.id);

  setInfiltrations((prev) =>
    prev.map((item) =>
      item.id === infiltration.id
        ? {
            ...item,
            status: "failed",
          }
        : item
    )
  );

  setMessageType("error");
  setMessage("L’attaque n’est plus active. L’infiltration a échoué.");
  return;
}

  if (!infiltrationGuess.trim()) {
    setMessageType("error");
    setMessage("Entrez un code avant de valider.");
    return;
  }

  const normalize = (text: string) =>
    text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ");

  const normalizedGuess = normalize(infiltrationGuess);

  const attackingTeamId = Number(infiltration.attacking_team_id);

const { data: codeRows, error: codeError } = await supabase
  .from("secret_codes")
  .select("*")
  .eq("team_id", attackingTeamId)
  .order("id", { ascending: true });

if (codeError || !codeRows || codeRows.length === 0) {
  setMessageType("error");
  setMessage(
    `Impossible de récupérer le code secret pour team_id=${attackingTeamId}`
  );
  return;
}

const codeData = codeRows[0];

  const normalizedSecret = normalize(codeData.secret_book_title);

  const newAttemptsUsed = (infiltration.attempts_used ?? 0) + 1;
  const isCorrect = normalizedGuess === normalizedSecret;

  if (isCorrect) {
    await supabase
      .from("infiltrations")
      .update({
        status: "success",
        success: true,
        guess: infiltrationGuess,
        attempts_used: newAttemptsUsed,
      })
      .eq("id", infiltration.id);

    const refundedAttack = receivedAttacks.find(
  (attack) =>
    Number(attack.attacking_team_id) === Number(infiltration.attacking_team_id) &&
    Number(attack.target_team_id) === Number(team.id) &&
    attack.canceled_by_infiltration !== true
);

await supabase
  .from("attacks")
  .update({
    canceled_by_infiltration: true,
  })
  .eq("attacking_team_id", infiltration.attacking_team_id)
  .eq("target_team_id", team.id)
  .eq("canceled_by_infiltration", false);

if (refundedAttack && team) {
  const newTeamScore = (team.score ?? 0) + (refundedAttack.points_removed ?? 0);

  const { error: refundError } = await supabase
    .from("Teams")
    .update({ score: newTeamScore })
    .eq("id", team.id);

  if (!refundError) {
    setTeam({
      ...team,
      score: newTeamScore,
    });

    setAllTeams((prev) =>
      prev.map((t) =>
        t.id === team.id ? { ...t, score: newTeamScore } : t
      )
    );
  }
}

setInfiltrations((prev) =>
  prev.map((item) =>
    item.id === infiltration.id
      ? {
          ...item,
          status: "success",
          success: true,
          guess: infiltrationGuess,
          attempts_used: newAttemptsUsed,
        }
      : item
  )
);

setReceivedAttacks((prev) =>
  prev.map((attack) =>
    Number(attack.attacking_team_id) ===
      Number(infiltration.attacking_team_id) &&
    Number(attack.target_team_id) === Number(team.id)
      ? {
          ...attack,
          canceled_by_infiltration: true,
        }
      : attack
  )
);

    setMessageType("success");
    setMessage(
      `Code trouvé ! L’attaque des ${enemyClanName} a été annulée.`
    );
    setInfiltrationGuess("");
    return;
  }

  const hasFailed = newAttemptsUsed >= (infiltration.max_attempts ?? 3);

  await supabase
    .from("infiltrations")
    .update({
      attempts_used: newAttemptsUsed,
      guess: infiltrationGuess,
      status: hasFailed ? "failed" : "active",
    })
    .eq("id", infiltration.id);

  setInfiltrations((prev) =>
    prev.map((item) =>
      item.id === infiltration.id
        ? {
            ...item,
            attempts_used: newAttemptsUsed,
            guess: infiltrationGuess,
            status: hasFailed ? "failed" : "active",
          }
        : item
    )
  );

  setMessageType("error");
  setMessage(
    hasFailed
      ? `Vous avez utilisé vos 3 essais contre les ${enemyClanName}.`
      : `Mauvais code. Il vous reste ${
          (infiltration.max_attempts ?? 3) - newAttemptsUsed
        } essai(s).`
  );

    setInfiltrationGuess("");
}

async function handleUnlockClue(
  infiltration: Infiltration,
  clue: any,
  clueNumber: number
) {
  if (!team) return;

  const alreadyUnlocked =
    (clueNumber === 1 && infiltration.hint_1_unlocked) ||
    (clueNumber === 2 && infiltration.hint_2_unlocked) ||
    (clueNumber === 3 && infiltration.hint_3_unlocked) ||
    (clueNumber === 4 && infiltration.hint_4_unlocked);

  if (alreadyUnlocked) return;

  if (clueNumber === 2 && !infiltration.hint_1_unlocked) return;
  if (
    clueNumber === 3 &&
    (!infiltration.hint_1_unlocked || !infiltration.hint_2_unlocked)
  ) {
    return;
  }
  if (
    clueNumber === 4 &&
    (!infiltration.hint_1_unlocked ||
      !infiltration.hint_2_unlocked ||
      !infiltration.hint_3_unlocked)
  ) {
    return;
  }

  const clueCost = clue.clue_cost ?? 0;

  if ((team.score ?? 0) < clueCost) {
    setMessageType("error");
    setMessage("Votre clan n’a pas assez de points pour débloquer cet indice.");
    return;
  }

  const updates: Record<string, any> = {
    total_clue_penalty: (infiltration.total_clue_penalty ?? 0) + clueCost,
  };

  if (clueNumber === 1) updates.hint_1_unlocked = true;
  if (clueNumber === 2) updates.hint_2_unlocked = true;
  if (clueNumber === 3) updates.hint_3_unlocked = true;
  if (clueNumber === 4) updates.hint_4_unlocked = true;

  const { error } = await supabase
    .from("infiltrations")
    .update(updates)
    .eq("id", infiltration.id);

  if (error) {
    setMessageType("error");
    setMessage("Impossible de débloquer cet indice.");
    return;
  }

  const newTeamScore = (team.score ?? 0) - clueCost;

  const { error: teamScoreError } = await supabase
    .from("Teams")
    .update({ score: newTeamScore })
    .eq("id", team.id);

  if (teamScoreError) {
    setMessageType("error");
    setMessage("Indice débloqué, mais impossible de mettre à jour le score du clan.");
    return;
  }

  setTeam({
    ...team,
    score: newTeamScore,
  });

  setAllTeams((prev) =>
    prev.map((t) =>
      t.id === team.id ? { ...t, score: newTeamScore } : t
    )
  );

  setInfiltrations((prev) =>
    prev.map((item) =>
      item.id === infiltration.id
        ? {
            ...item,
            ...updates,
          }
        : item
    )
  );

  setMessageType("success");
  setMessage(`Indice ${clueNumber} débloqué.`);
}
  async function handleChallengeSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!profile) return;

    if (!bookTitle || !author || !pages || !startDate || !endDate || !selectedChallenge) {
        setMessageType("error");
      setMessage("Merci de remplir tous les champs pour valider un défi.");
      return;
    }

    setSubmittingChallenge(true);
    setMessage("");

    const { data: submissionData, error: submissionError } = await supabase
      .from("book_submissions")
      .insert({
        user_id: profile.id,
        book_title: bookTitle,
        author,
        started_at: startDate,
        finished_at: endDate,
      })
      .select()
      .single();

    if (submissionError || !submissionData) {
        setMessageType("error");
  setMessage("Impossible d’enregistrer le livre.");
  setSubmittingChallenge(false);
  return;
}
const selectedChallengeData = challenges.find(
  (challenge) => challenge.id === Number(selectedChallenge)
);
const secondChallengeData = challenges.find(
  (challenge) => String(challenge.id) === selectedSecondChallenge
);
    const completedChallengesToInsert = [
  {
    user_id: profile.id,
    challenge_id: Number(selectedChallenge),
    book_submission_id: submissionData.id,
    proof: pages,
    validated: true,
  },
];

if (
  oraclesMagnanimesActive &&
  secondChallengeData &&
  secondChallengeData.id !== Number(selectedChallenge)
) {
  completedChallengesToInsert.push({
    user_id: profile.id,
    challenge_id: secondChallengeData.id,
    book_submission_id: submissionData.id,
    proof: pages,
    validated: true,
  });
}

const { error: completedError } = await supabase
  .from("completed_challenges")
  .insert(completedChallengesToInsert);

    if (completedError) {
  setMessageType("error");
  setMessage("Livre enregistré, mais impossible de valider le défi.");
  setSubmittingChallenge(false);
  return;
}

if (selectedChallengeData && team) {
  const secondChallengePoints =
  oraclesMagnanimesActive &&
  secondChallengeData &&
  secondChallengeData.id !== selectedChallengeData.id
    ? secondChallengeData.point
    : 0;

const totalPointsEarned =
  selectedChallengeData.point + secondChallengePoints;

const newTeamScore = (team.score ?? 0) + totalPointsEarned;

  const { error: teamScoreError } = await supabase
    .from("Teams")
    .update({ score: newTeamScore })
    .eq("id", team.id);

  if (teamScoreError) {
    setMessageType("error");
    setMessage("Défi validé, mais impossible de mettre à jour le score du clan.");
    setSubmittingChallenge(false);
    return;
  }

  setTeam({
    ...team,
    score: newTeamScore,
  });

  setPersonalScore((prev) => prev + totalPointsEarned);
  setCompletedChallengeIds((prev) => {
  const updated = [...prev, selectedChallengeData.id];

  if (
    oraclesMagnanimesActive &&
    secondChallengeData &&
    secondChallengeData.id !== selectedChallengeData.id
  ) {
    updated.push(secondChallengeData.id);
  }

  return updated;
});
}

setMessageType("success");
setMessage("Défi validé avec succès.");
setBookTitle("");
setAuthor("");
setPages("");
setStartDate("");
setEndDate("");
setSelectedChallenge("");
setSubmittingChallenge(false);
  }

  async function handleFlashSubmission(challengeId: number) {
  if (!profile) return;

setConfirmModalTitle("Envoyer la réponse flash");
setConfirmModalMessage("Voulez-vous confirmer l’envoi de votre réponse flash ?");
setConfirmModalDanger(false);
setConfirmModalConfirmLabel("Envoyer");
setConfirmModalCancelLabel("Annuler");

setConfirmAction(() => async () => {
  const answer = flashAnswers[challengeId]?.trim() || "";

  setSubmittingFlashId(challengeId);

  const { error } = await supabase.from("flash_submissions").insert({
    challenge_id: challengeId,
    user_id: profile.id,
    answer_text: answer,
  });

  if (error) {
    setMessage("Impossible d'envoyer la réponse flash.");
    setSubmittingFlashId(null);
    return;
  }

  const { data: updatedSubmissions } = await supabase
    .from("flash_submissions")
    .select("*")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  if (updatedSubmissions) {
    setFlashSubmissions(updatedSubmissions);
  }

  setSubmittingFlashId(null);
  });

setConfirmModalOpen(true);
return;
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
        <div className="mx-auto max-w-4xl">
          <p className="font-cormorant text-2xl">Chargement...</p>
        </div>
  </div>
</main>
    );
  }

  if (!profile?.team_id) {
    return (
      <main className="min-h-screen bg-black px-6 py-16 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-[#0E2028]/75 p-8">
          <p className="font-cinzel mb-4 text-sm uppercase tracking-[0.4em] text-[#6163FC]">
            Battle of Clans III
          </p>

          <h1 className="font-great-vibes mb-6 text-6xl">Mon espace</h1>

          <p className="font-cormorant text-2xl leading-relaxed text-white/90">
            Votre clan n’a pas encore été attribué par les Oracles. Revenez bientôt.
          </p>

          <button
            onClick={logout}
            className="font-cormorant mt-8 rounded-full bg-[#6163FC] px-8 py-3 text-xl font-semibold transition hover:bg-[#7B7DFF]"
          >
            Se déconnecter
          </button>
        </div>
      </main>
    );
  }

  if (!profile.clan_confirmed) {
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
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-[#0E2028]/75 p-8">
          <p className="font-cinzel mb-4 text-sm uppercase tracking-[0.4em] text-[#6163FC]">
            Battle of Clans III
          </p>

          <h1 className="font-great-vibes mb-6 text-6xl">Confirme ton clan</h1>

          <p className="font-cormorant text-2xl leading-relaxed text-white/90">
            Les Oracles vous ont attribué le clan :
          </p>

          <p className="font-cinzel mt-6 text-3xl uppercase tracking-[0.2em] text-white">
            {team?.name}
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <button
              onClick={confirmClan}
              className="font-cormorant rounded-full bg-[#6163FC] px-8 py-3 text-xl font-semibold transition hover:bg-[#7B7DFF]"
            >
              Confirmer mon clan
            </button>

            <button
              onClick={logout}
              className="font-cormorant rounded-full border border-white/20 px-8 py-3 text-xl font-semibold transition hover:bg-white/10"
            >
              Se déconnecter
            </button>
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
        <div className="rounded-3xl border border-white/10 bg-[#0E2028]/75 p-8 shadow-xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-cinzel mb-4 text-sm uppercase tracking-[0.4em] text-[#6163FC]">
                Battle of Clans III
              </p>

              <h1 className="font-great-vibes text-6xl md:text-7xl">Mon espace</h1>

              <p className="font-cormorant mt-4 text-xl text-white/80">
                Clan confirmé :{" "}
                <span className="font-cinzel uppercase tracking-[0.2em] text-white">
                  {team?.name}
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
            {availableTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
  setActiveTab(tab.id);
  if (tab.id === "conseil") {
    setActiveWarTab("arsenal");
  }
}}
                className={`font-cormorant rounded-full px-5 py-2 text-lg font-semibold transition ${
                  activeTab === tab.id
                    ? "bg-[#6163FC] text-white"
                    : "border border-white/15 bg-black/20 text-white/80 hover:bg-white/10"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {activeTab === "conseil" && (
  <div className="mt-6 flex flex-wrap gap-3">
    <button
      onClick={() => setActiveWarTab("arsenal")}
      className={`font-cormorant rounded-full px-5 py-2 text-lg font-semibold transition ${
        activeWarTab === "arsenal"
          ? "bg-[#6163FC] text-white"
          : "border border-white/15 bg-black/20 text-white/80 hover:bg-white/10"
      }`}
    >
      Arsenal du clan
    </button>

    {(isChief || isOracle) && (
  <button
    onClick={() => setActiveWarTab("declarer")}
    className={`font-cormorant rounded-full px-5 py-2 text-lg font-semibold transition ${
      activeWarTab === "declarer"
        ? "bg-[#6163FC] text-white"
        : "border border-white/15 bg-black/20 text-white/80 hover:bg-white/10"
    }`}
  >
    Déclarer la guerre
  </button>
)}

    <button
      onClick={() => setActiveWarTab("carnet")}
      className={`font-cormorant rounded-full px-5 py-2 text-lg font-semibold transition ${
        activeWarTab === "carnet"
          ? "bg-[#6163FC] text-white"
          : "border border-white/15 bg-black/20 text-white/80 hover:bg-white/10"
      }`}
    >
      Carnet de bataille
    </button>
  </div>
)}

          <div className="mt-10 rounded-3xl border border-white/10 bg-black/20 p-8">
            {activeTab === "clan" && (
              <div>
                <h2 className="font-cinzel mb-6 text-2xl uppercase tracking-[0.2em] text-[#6163FC]">
                  Clan
                </h2>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl border border-white/10 bg-[#0E2028]/75 p-5">
                    <p className="font-cinzel text-sm uppercase tracking-[0.2em] text-[#6163FC]">
                      Clan du joueur
                    </p>
                    <p className="font-cormorant mt-3 text-3xl text-white">
  {team?.name}
</p>

<p className="font-cormorant mt-2 text-lg text-white/70">
  {profile?.role === "chief" ? chiefTitle : `Membre du clan ${team?.name}`}
</p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[#0E2028]/75 p-5">
                    <p className="font-cinzel text-sm uppercase tracking-[0.2em] text-[#6163FC]">
                      Score personnel
                    </p>
                    <p className="font-cormorant mt-3 text-3xl text-white">
  {personalScore}
</p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[#0E2028]/75 p-5">
                    <p className="font-cinzel text-sm uppercase tracking-[0.2em] text-[#6163FC]">
                      Score du clan
                    </p>
                    <p className="font-cormorant mt-3 text-3xl text-white">
                      {team?.score ?? 0}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[#0E2028]/75 p-5">
                    <p className="font-cinzel text-sm uppercase tracking-[0.2em] text-[#6163FC]">
                      Rang du clan
                    </p>
                    <p className="font-cormorant mt-3 text-3xl text-white">
                      {clanRank ? `${clanRank}e` : "À venir"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-white/10 bg-[#0E2028]/75 p-5">
  <p className="font-cinzel text-sm uppercase tracking-[0.2em] text-[#6163FC]">
    Corruptions actives
  </p>

  {corruptionEvents.length === 0 ? (
    <p className="font-cormorant mt-3 text-2xl text-white">
      Aucune corruption active pour le moment.
    </p>
  ) : (
    <div className="mt-4 space-y-4">
      {corruptionEvents.map((event) => {
        const corruption = getCorruptionTypeById(
          event.corruption_type_id
        );

        if (!corruption) return null;

        return (
          <div
            key={event.id}
            className="rounded-2xl border border-[#6163FC]/20 bg-black/20 p-4"
          >
            <p className="font-cinzel text-lg uppercase tracking-[0.2em] text-[#6163FC]">
              {corruption.title}
            </p>

            <p className="font-cormorant mt-2 text-xl text-white/90">
              {corruption.description}
            </p>

            {event.activated_at && (
              <p className="font-cormorant mt-2 text-lg text-white/60">
                Activée le {formatAttackDate(event.activated_at)}
              </p>
            )}
          </div>
        );
      })}
    </div>
  )}
</div>
              </div>
            )}

            {activeTab === "conseil" && (
  <div>
    <h2 className="font-cinzel mb-6 text-2xl uppercase tracking-[0.2em] text-[#6163FC]">
      Conseil de guerre
    </h2>

    {activeWarTab === "arsenal" && (
      <div className="rounded-2xl border border-white/10 bg-[#0E2028]/75 p-5">
        <h3 className="font-cinzel text-lg uppercase tracking-[0.2em] text-white">
          Arsenal du clan
        </h3>

        {attackTypes.length === 0 ? (
          <p className="font-cormorant mt-4 text-xl text-white/80">
            Aucune attaque trouvée pour ce clan.
          </p>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {attackTypes.map((attack) => {
  const isUsed = usedAttackNames.includes(attack.attack_name);

  return (
    <div
      key={attack.id}
      className="rounded-2xl border border-white/10 bg-black/20 p-5"
    >
      <p className="font-cinzel text-sm uppercase tracking-[0.2em] text-[#6163FC]">
        {getAttackLevelLabel(attack.attack_level)}
      </p>

      <h4 className="font-cormorant mt-3 text-3xl font-semibold text-white">
        {attack.attack_name}
      </h4>

      <p className="font-cormorant mt-4 text-xl text-white/80">
        Coût de lancement : {attack.attack_cost} points
      </p>

      <p className="font-cormorant mt-2 text-xl text-white/80">
        Points retirés : {attack.points_removed} points
      </p>

      <p className="font-cormorant mt-4 text-lg text-white/60">
        Statut : {isUsed ? "utilisée" : "disponible"}
      </p>
    </div>
  );
})}
          </div>
        )}
      </div>
    )}

    {activeWarTab === "declarer" && (
  <div className="rounded-2xl border border-white/10 bg-[#0E2028]/75 p-5">
    <h3 className="font-cinzel text-lg uppercase tracking-[0.2em] text-white">
      Déclarer la guerre
    </h3>

    <div className="mt-6 grid gap-4 md:grid-cols-2">
      <div>
        <label className="font-cormorant mb-2 block text-lg text-white/80">
          Clan cible
        </label>

        <select
          value={selectedTargetTeam}
          onChange={(e) => setSelectedTargetTeam(e.target.value)}
          className="font-cormorant w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-lg text-white outline-none"
        >
          <option value="">Choisir un clan</option>
          {enemyClans.map((clan) => (
            <option key={clan.id} value={clan.id}>
              {clan.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="font-cormorant mb-2 block text-lg text-white/80">
          Attaque à lancer
        </label>

        <select
          value={selectedAttackId}
          onChange={(e) => setSelectedAttackId(e.target.value)}
          className="font-cormorant w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-lg text-white outline-none"
        >
          <option value="">Choisir une attaque</option>
          {availableAttackTypes.map((attack) => {
  const displayedCost = failleOuverteActive
    ? Math.max(0, attack.attack_cost - 5)
    : attack.attack_cost;

  return (
    <option key={attack.id} value={attack.id}>
      {attack.attack_name} ({displayedCost} pts / {attack.points_removed} dégâts)
    </option>
  );
})}
        </select>
      </div>
    </div>

    <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">
      <p className="font-cinzel text-sm uppercase tracking-[0.2em] text-[#6163FC]">
        Récapitulatif
      </p>

      {selectedTargetTeam && selectedAttack ? (
        <div className="mt-4 space-y-2">
          <p className="font-cormorant text-xl text-white/90">
            Clan ciblé :{" "}
            <span className="text-white">
              {enemyClans.find((clan) => String(clan.id) === selectedTargetTeam)?.name}
            </span>
          </p>

          <p className="font-cormorant text-xl text-white/90">
            Attaque choisie :{" "}
            <span className="text-white">{selectedAttack.attack_name}</span>
          </p>

          <p className="font-cormorant text-xl text-white/90">
            Coût de lancement :{" "}
            <span className="text-white">{selectedAttackCost} points</span>
          </p>

          <p className="font-cormorant text-xl text-white/90">
            Points retirés :{" "}
            <span className="text-white">{selectedAttack.points_removed} points</span>
          </p>
          {!canAffordSelectedAttack && (
  <p className="font-cormorant text-xl text-red-400">
    Votre clan n’a pas assez de points pour lancer cette attaque.
  </p>
)}
        </div>
      ) : (
        <p className="font-cormorant mt-4 text-xl text-white/70">
          Choisissez un clan cible et une attaque pour afficher le récapitulatif.
        </p>
      )}
    </div>

    <button
  type="button"
  onClick={handleAttackSubmit}
  disabled={
  !selectedTargetTeam ||
  !selectedAttackId ||
  submittingAttack ||
  !canAffordSelectedAttack ||
  launchedAttacks.some((attack) => {
  const expiresAt = attack.expires_at ? new Date(attack.expires_at) : null;

  return (
    Number(attack.target_team_id) === Number(selectedTargetTeam) &&
    expiresAt &&
    expiresAt > new Date()
  );
})
}
  className="font-cormorant mt-6 rounded-full bg-[#6163FC] px-8 py-3 text-xl font-semibold transition hover:bg-[#7B7DFF] disabled:opacity-50"
>
  {submittingAttack ? "Lancement..." : "Lancer l’attaque"}
</button>
  </div>
)}

    {activeWarTab === "carnet" && (
  <div className="space-y-6">
    <div className="rounded-2xl border border-white/10 bg-[#0E2028]/75 p-5">
      <h3 className="font-cinzel text-lg uppercase tracking-[0.2em] text-white">
        Attaques reçues
      </h3>

      {receivedAttacks.length === 0 ? (
        <p className="font-cormorant mt-4 text-xl text-white/80">
          Aucune attaque reçue pour le moment.
        </p>
      ) : (
        <div className="mt-5 space-y-4">
          {receivedAttacks.map((attack) => (
            <div
              key={attack.id}
              className="rounded-2xl border border-white/10 bg-black/20 p-5"
            >
              <p className="font-cormorant text-2xl text-white">
                {attack.attack_name}
              </p>

              <p className="font-cormorant mt-3 text-lg text-white/80">
                Reçue de :{" "}
                <span className="text-white">
                  {getTeamNameById(attack.attacking_team_id, allTeams)}
                </span>
              </p>

              <p className="font-cormorant mt-2 text-lg text-white/80">
                Points retirés :{" "}
                <span className="text-white">{attack.points_removed}</span>
              </p>
              <p className="font-cormorant mt-2 text-lg text-white/80">
  Date :{" "}
  <span className="text-white">{formatAttackDate(attack.created_at)}</span>
</p>

              <p className="font-cormorant mt-2 text-lg text-white/80">
                Statut :{" "}
                <span className="text-white">
                  {attack.canceled_by_infiltration ? "Annulée" : "Active"}
                </span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>

    <div className="rounded-2xl border border-white/10 bg-[#0E2028]/75 p-5">
      <h3 className="font-cinzel text-lg uppercase tracking-[0.2em] text-white">
        Attaques lancées
      </h3>

      {launchedAttacks.length === 0 ? (
        <p className="font-cormorant mt-4 text-xl text-white/80">
          Aucune attaque lancée pour le moment.
        </p>
      ) : (
        <div className="mt-5 space-y-4">
          {launchedAttacks.map((attack) => (
            <div
              key={attack.id}
              className="rounded-2xl border border-white/10 bg-black/20 p-5"
            >
              <p className="font-cormorant text-2xl text-white">
                {attack.attack_name}
              </p>

              <p className="font-cormorant mt-3 text-lg text-white/80">
                Lancée vers :{" "}
                <span className="text-white">
                  {getTeamNameById(attack.target_team_id, allTeams)}
                </span>
              </p>

              <p className="font-cormorant mt-2 text-lg text-white/80">
                Coût payé :{" "}
                <span className="text-white">{attack.attack_cost}</span>
              </p>

              <p className="font-cormorant mt-2 text-lg text-white/80">
                Points retirés :{" "}
                <span className="text-white">{attack.points_removed}</span>
              </p>
              <p className="font-cormorant mt-2 text-lg text-white/80">
  Date :{" "}
  <span className="text-white">{formatAttackDate(attack.created_at)}</span>
</p>

              <p className="font-cormorant mt-2 text-lg text-white/80">
                Statut :{" "}
                <span className="text-white">
                  {attack.canceled_by_infiltration ? "Annulée" : "Active"}
                </span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
)}
  </div>
)}

            {activeTab === "infiltration" && (
  <div className="space-y-6">
    <div className="bg-[#0E2028]/75 border border-[#6163FC]/30 rounded-2xl p-6">
      <h2 className="text-2xl text-[#6163FC] mb-2 font-cinzel">
        Infiltration
      </h2>
      
      <p className="font-cormorant text-2xl text-white/80">
        Trouvez le code secret des clans ennemis pour annuler une attaque.
      </p>
     
    </div>

    <div className="grid gap-6 md:grid-cols-2">
      {enemyClans.map((enemyClan) => {
  const activeAttack = getActiveAttackFromClan(enemyClan.id);
const infiltration = getInfiltrationAgainstClan(enemyClan.id);
const clanClues = getCluesForClan(enemyClan.id);

const hasInfiltration = !!infiltration;

const infiltrationSuccess = infiltration?.status === "success";

const infiltrationExpired =
  !!infiltration?.expires_at &&
  new Date(infiltration.expires_at) <= new Date();

const infiltrationFailed =
  !!infiltration &&
  (
    infiltration.status === "failed" ||
    infiltration.status === "expired" ||
    infiltration.attempts_used >= (infiltration.max_attempts ?? 3) ||
    infiltrationExpired
  );

const canStartInfiltration = !!activeAttack && !hasInfiltration;

const showActiveInfiltration =
  !!activeAttack &&
  !!infiltration &&
  infiltration.status === "active" &&
  !infiltrationSuccess &&
  !infiltrationFailed;

const showBlockedInfiltration =
  !!infiltration &&
  !infiltrationSuccess &&
  infiltrationFailed;

  return (
          <div
            key={enemyClan.id}
            className="bg-[#0E2028]/75 border border-[#6163FC]/20 rounded-2xl p-6 space-y-4"
          >
            <div>
              <h3 className="text-xl text-[#6163FC] font-cinzel capitalize">
                {enemyClan.name}
              </h3>
            </div>

           {!activeAttack && !hasInfiltration && (
  <p className="font-cormorant text-2xl text-white/70">
    Pas d’attaque active des {getPluralClanName(enemyClan.name)}.
  </p>
)}
{canStartInfiltration && instabilityActive && (
  <div className="space-y-3">
    <p className="font-cormorant text-2xl text-white">
      Attaque des {getPluralClanName(enemyClan.name)} en cours.
    </p>

    <p className="font-cormorant text-lg text-red-300">
      Instabilité active : l’infiltration est temporairement indisponible.
    </p>
  </div>
)}
{canStartInfiltration && (isChief || isOracle) && !instabilityActive && (
  <div className="space-y-3">
    <p className="font-cormorant text-2xl text-white">
      Attaque des {getPluralClanName(enemyClan.name)} en cours.
    </p>

    <p className="font-cormorant text-lg text-white/70">
      Souhaitez-vous commencer une infiltration ?
    </p>

    <button
      onClick={() => handleStartInfiltration(enemyClan.id)}
      disabled={startingInfiltrationForClanId === enemyClan.id}
      className="font-cormorant rounded-full bg-[#6163FC] px-6 py-2 text-lg text-white transition hover:bg-[#7b7dff] disabled:opacity-50"
    >
      {startingInfiltrationForClanId === enemyClan.id
        ? "Démarrage..."
        : "Commencer une infiltration"}
    </button>
  </div>
)}
{canStartInfiltration && !isChief && !isOracle && !instabilityActive && (
  <div className="space-y-3">
    <p className="font-cormorant text-2xl text-white">
      Attaque active des {getPluralClanName(enemyClan.name)} en cours.
    </p>

    <p className="font-cormorant text-lg text-white/70">
      Seul le chef de clan peut démarrer l’infiltration.
    </p>
  </div>
)}

{showActiveInfiltration && !instabilityActive && (
  <div className="space-y-4">
    <p className="font-cinzel text-sm uppercase tracking-[0.2em] text-[#6163FC]">
      Statut
    </p>

    <p className="font-cormorant text-2xl text-green-400">
      Infiltration en cours
    </p>

    <p className="font-cormorant text-lg text-white/80">
      Temps restant :{" "}
      <span className="text-white">
        {infiltration.expires_at
          ? getRemainingTime(infiltration.expires_at)
          : "Inconnu"}
      </span>
    </p>

    <p className="font-cormorant text-lg text-white/80">
      Essais restants :{" "}
      <span className="text-white">
        {Math.max(
          0,
          (infiltration.max_attempts ?? 3) - (infiltration.attempts_used ?? 0)
        )}
      </span>
      {" / "}
      {infiltration.max_attempts ?? 3}
    </p>

    {(isChief || isOracle) && (
  <input
    type="text"
    placeholder="Entrez le code secret"
    value={infiltrationGuess}
    onChange={(e) => setInfiltrationGuess(e.target.value)}
    className="font-cormorant w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-lg text-white outline-none"
  />
)}

    <div className="grid grid-cols-2 gap-2">
      {clanClues.map((clue, index) => {
        const clueNumber = index + 1;

        const isUnlocked =
          (clueNumber === 1 && infiltration.hint_1_unlocked) ||
          (clueNumber === 2 && infiltration.hint_2_unlocked) ||
          (clueNumber === 3 && infiltration.hint_3_unlocked) ||
          (clueNumber === 4 && infiltration.hint_4_unlocked);

        const canUnlock =
          clueNumber === 1 ||
          (clueNumber === 2 && infiltration.hint_1_unlocked) ||
          (clueNumber === 3 &&
            infiltration.hint_1_unlocked &&
            infiltration.hint_2_unlocked) ||
          (clueNumber === 4 &&
            infiltration.hint_1_unlocked &&
            infiltration.hint_2_unlocked &&
            infiltration.hint_3_unlocked);

        return (
          <div key={clue.id} className="space-y-2">
            <button
              onClick={() =>
                handleUnlockClue(infiltration, clue, clueNumber)
              }
              disabled={
  !canUnlock ||
  isUnlocked ||
  (!isChief && !isOracle) ||
  instabilityActive
}
              className={`w-full px-3 py-3 rounded-xl border text-left transition ${
                isUnlocked
                  ? "bg-[#6163FC]/20 border-[#6163FC]/40"
                  : canUnlock && (isChief || isOracle)
                  ? "bg-black/30 border-white/10 hover:border-[#6163FC]/50"
                  : "bg-black/10 border-white/5 opacity-40 cursor-not-allowed"
              }`}
            >
              <span className="font-cinzel uppercase tracking-[0.15em] text-xs text-[#6163FC] block mb-1">
                Indice {clueNumber}
              </span>

              <span className="font-cormorant text-base text-white">
                {isUnlocked
                  ? "Débloqué"
                  : clue.clue_cost > 0
                  ? `Coût : -${clue.clue_cost} pts`
                  : "Gratuit"}
              </span>
            </button>

            {isUnlocked && (
              <div className="rounded-xl border border-[#6163FC]/20 bg-black/20 p-3">
                <p className="font-cormorant text-white text-lg">
                  {clue.clue_text}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>

    {(isChief || isOracle) && (
  <button
    onClick={() =>
      handleValidateInfiltration(
        infiltration,
        getPluralClanName(enemyClan.name)
      )
    }
    className="font-cormorant w-full rounded-xl bg-[#6163FC] px-4 py-3 text-xl font-semibold text-white transition hover:bg-[#7b7dff]"
  >
    Valider la réponse
  </button>
)}
  </div>
)}
{showBlockedInfiltration && (
  <p className="font-cormorant text-2xl text-red-400">
    {infiltration?.guess === "Désactivée par les Oracles - Distorsion"
      ? "Infiltration désactivée par les Oracles en pénalité à la corruption Distorsion."
      : "Infiltration définitivement indisponible contre cette équipe."}
  </p>
)}
{hasInfiltration && infiltrationSuccess && (
  <p className="font-cormorant text-2xl text-green-400">
    Vous avez déjà trouvé le code de cette équipe.
  </p>
)}
          </div>
        );
      })}
    </div>
  </div>
)}

            {activeTab === "validation" && (
              <div>
                <h2 className="font-cinzel mb-6 text-2xl uppercase tracking-[0.2em] text-[#6163FC]">
                  Validation de défis
                </h2>

                <form onSubmit={handleChallengeSubmit} className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="font-cormorant mb-2 block text-lg text-white/80">
                      Titre du livre
                    </label>
                    <input
                      value={bookTitle}
                      onChange={(e) => setBookTitle(e.target.value)}
                      placeholder="Titre du livre"
                      className="font-cormorant w-full rounded-xl border border-white/10 bg-[#0E2028]/75 px-4 py-3 text-lg text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-cormorant mb-2 block text-lg text-white/80">
                      Auteur
                    </label>
                    <input
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="Auteur"
                      className="font-cormorant w-full rounded-xl border border-white/10 bg-[#0E2028]/75 px-4 py-3 text-lg text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-cormorant mb-2 block text-lg text-white/80">
                      Nombre de pages
                    </label>
                    <input
                      value={pages}
                      onChange={(e) => setPages(e.target.value)}
                      placeholder="Nombre de pages"
                      className="font-cormorant w-full rounded-xl border border-white/10 bg-[#0E2028]/75 px-4 py-3 text-lg text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-cormorant mb-2 block text-lg text-white/80">
                      Date de début
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="font-cormorant w-full rounded-xl border border-white/10 bg-[#0E2028]/75 px-4 py-3 text-lg text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-cormorant mb-2 block text-lg text-white/80">
                      Date de fin
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="font-cormorant w-full rounded-xl border border-white/10 bg-[#0E2028]/75 px-4 py-3 text-lg text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-cormorant mb-2 block text-lg text-white/80">
  Défi choisi
</label>
<select
  value={selectedChallenge}
  onChange={(e) => setSelectedChallenge(e.target.value)}
  className="font-cormorant w-full rounded-xl border border-white/10 bg-[#0E2028]/75 px-4 py-3 text-lg text-white outline-none"
>
  <option value="">
    {availableChallenges.length > 0
      ? "Choisir un défi"
      : "Aucun défi disponible"}
  </option>
  {availableChallenges.map((challenge) => (
    <option key={challenge.id} value={challenge.id}>
      {challenge.title} ({challenge.point} pts)
    </option>
  ))}
</select>

{oraclesMagnanimesActive && (
  <div className="mt-4">
    <label className="font-cormorant mb-2 block text-lg text-white/80">
      Deuxième défi
    </label>
    <select
      value={selectedSecondChallenge}
      onChange={(e) => setSelectedSecondChallenge(e.target.value)}
      className="font-cormorant w-full rounded-xl border border-white/10 bg-[#0E2028]/75 px-4 py-3 text-lg text-white outline-none"
    >
      <option value="">
        {availableChallenges.length > 0
          ? "Choisir un deuxième défi"
          : "Aucun défi disponible"}
      </option>
      {availableChallenges.map((challenge) => (
        <option key={challenge.id} value={challenge.id}>
          {challenge.title} ({challenge.point} pts)
        </option>
      ))}
    </select>
  </div>
)}
                    
                  </div>

                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      disabled={submittingChallenge}
                      className="font-cormorant mt-2 rounded-full bg-[#6163FC] px-8 py-3 text-xl font-semibold transition hover:bg-[#7B7DFF] disabled:opacity-50"
                    >
                      {submittingChallenge ? "Validation..." : "Valider"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "mes-defis" && (
  <div>
    <h2 className="font-cinzel mb-6 text-2xl uppercase tracking-[0.2em] text-[#6163FC]">
      Mes défis
    </h2>

    <div className="space-y-8">
      {Object.entries(challengesByPoints).map(([points, groupedChallenges]) => (
        <section
          key={points}
          className="rounded-3xl border border-white/10 bg-[#0E2028]/75 p-6"
        >
          <h3 className="font-cinzel mb-5 text-xl uppercase tracking-[0.2em] text-[#6163FC]">
            {points} points
          </h3>

          <ul className="font-cormorant space-y-3 text-lg leading-relaxed text-white/90 md:text-xl">
            {groupedChallenges.map((challenge) => {
              const isCompleted =
  challenge.title !== repeatableChallengeTitle &&
  completedChallengeIds.includes(challenge.id);

              return (
                <li
                  key={challenge.id}
                  className="border-b border-white/10 pb-3 last:border-b-0"
                >
                  <span
                    className={
                      isCompleted
                        ? "text-white/40 line-through"
                        : "text-white"
                    }
                  >
                    {challenge.title}
                  </span>
                  {challenge.description && (
                    <span
                      className={
                        isCompleted
                          ? "text-white/30 line-through"
                          : "text-white/70"
                      }
                    >
                      {" "}
                      : {challenge.description}
                    </span>
                  )}
                  {challenge.title === repeatableChallengeTitle && (
  <ul className="mt-2 ml-4 space-y-1 text-sm text-white/60">
    {completedChallengesData
      .filter(
        (item) =>
          item.challenges?.title === repeatableChallengeTitle
      )
      .map((item, index) => (
        <li key={index}>
          • {item.book_submissions?.book_title}
        </li>
      ))}
  </ul>
)}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  </div>
)}

            {activeTab === "flash" && (
              <div>
                <h2 className="font-cinzel mb-6 text-2xl uppercase tracking-[0.2em] text-[#6163FC]">
                  Flash
                </h2>

                {activeFlashChallenges.length === 0 &&
activeFlashEvents.length === 0 ? (
  <div className="rounded-2xl border border-white/10 bg-[#0E2028]/75 p-6">
    <p className="font-cormorant text-2xl text-white/70">
      Pas de défi, malus ou règle flash pour le moment.
    </p>
  </div>
) : (
  <div className="space-y-6">
    {activeFlashChallenges.map((flash) => {
      const alreadyAnswered = flashSubmissions.find(
        (submission) => submission.challenge_id === flash.id
      );
const simpleValidationFlashes = [
  "Objectif lecture",
  "Lecture nocturne",
  "Lecture express",
];
const infoOnlyFlashes = [
  "Silence des clans",
  "Mauvaise stratégie",
  "Distorsion temporelle",
  "Faille instable",
  "Fracture du passé",
  "Éveil de la Loutrache",
  "Colère des Oracles",
];

const isInfoOnly = infoOnlyFlashes.includes(flash.title);

const needsTextInput =
  !simpleValidationFlashes.includes(flash.title) && !isInfoOnly;
      return (
        <div
          key={flash.id}
          className="rounded-2xl border border-[#6163FC]/20 bg-[#0E2028]/75 p-6"
        >
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h3 className="font-cinzel text-2xl text-[#6163FC]">
                {flash.title}
              </h3>

              <p className="font-cormorant mt-2 text-xl text-white/80">
                {flash.description}
              </p>
            </div>

            <span className="rounded-full border border-[#6163FC]/30 px-3 py-1 text-xs uppercase tracking-[0.2em] text-[#6163FC]">
              {flash.category}
            </span>
          </div>

          {flash.flash_image_url && (
  <img
    src={flash.flash_image_url}
              alt={flash.title}
              className="mb-4 max-h-96 w-full rounded-2xl object-contain bg-black/20"
            />
          )}

          {flash.flash_display_text && (
  <div className="mb-4 rounded-2xl border border-white/10 bg-black/20 p-4">
    <p className="font-cormorant text-xl text-white">
      {flash.flash_display_text}
    </p>
  </div>
)}

          {alreadyAnswered ? (
  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
    <p className="font-cormorant text-xl text-emerald-300">
      Réponse envoyée
    </p>
  </div>
) : isInfoOnly ? (
  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
    <p className="font-cormorant text-lg text-white/70">
      Ce flash est automatique. Les Oracles vérifieront les actions de votre clan.
    </p>
  </div>
) : (
  <div className="space-y-4 rounded-2xl border border-white/10 bg-black/20 p-4">
    {needsTextInput ? (
  flash.title === "Corruption grandissante" ? (
    <div className="space-y-3">
      <input
        type="text"
        placeholder="Livre terminé"
        value={(flashAnswers[flash.id] || "").split(" | ")[0] || ""}
        onChange={(e) => {
          const currentDate =
            (flashAnswers[flash.id] || "").split(" | ")[1] || "";

          setFlashAnswers((prev) => ({
            ...prev,
            [flash.id]: `${e.target.value} | ${currentDate}`,
          }));
        }}
        className="font-cormorant w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-lg text-white outline-none"
      />

      <input
        type="date"
        value={(flashAnswers[flash.id] || "").split(" | ")[1] || ""}
        onChange={(e) => {
          const currentBook =
            (flashAnswers[flash.id] || "").split(" | ")[0] || "";

          setFlashAnswers((prev) => ({
            ...prev,
            [flash.id]: `${currentBook} | ${e.target.value}`,
          }));
        }}
        className="font-cormorant w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-lg text-white outline-none"
      />
    </div>
  ) : (
    <input
      type="text"
      placeholder="Votre réponse..."
      value={flashAnswers[flash.id] || ""}
      onChange={(e) =>
        setFlashAnswers((prev) => ({
          ...prev,
          [flash.id]: e.target.value,
        }))
      }
      className="font-cormorant w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-lg text-white outline-none"
    />
  )
) : (
  <p className="font-cormorant text-lg text-white/70">
    Cliquez simplement sur valider si vous avez rempli les conditions du flash.
  </p>
)}

    <button
      onClick={() => handleFlashSubmission(flash.id)}
      disabled={submittingFlashId === flash.id}
      className="font-cormorant rounded-full bg-[#6163FC] px-6 py-2 text-lg text-white transition hover:bg-[#7b7dff] disabled:opacity-50"
    >
      {submittingFlashId === flash.id ? "Envoi..." : "Valider"}
    </button>
  </div>
)}
        </div>
      );
    })}
    {activeFlashEvents.map((flash) => (
  <div
    key={`event-${flash.id}`}
    className="rounded-2xl border border-[#6163FC]/20 bg-[#0E2028]/75 p-6"
  >
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h3 className="font-cinzel text-2xl text-[#6163FC]">
          {flash.title}
        </h3>

        <p className="font-cormorant mt-2 text-xl text-white/80">
          {flash.description}
        </p>
      </div>

      <span className="rounded-full border border-[#6163FC]/30 px-3 py-1 text-xs uppercase tracking-[0.2em] text-[#6163FC]">
        Règle
      </span>
    </div>

    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="font-cormorant text-lg text-white/70">
        Cette règle flash est actuellement active.
      </p>
    </div>
  </div>
))}
  </div>
)}
              </div>
            )}
          </div>

          {message && (
  <p
    className={`font-cormorant mt-6 text-lg ${
      messageType === "success"
        ? "text-[#6163FC]"
        : "text-red-400"
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