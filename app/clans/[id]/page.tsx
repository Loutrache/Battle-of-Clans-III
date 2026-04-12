import { supabase } from "../../lib/supabase";

const clanContent: Record<
  string,
  { displayName: string; description: string; image: string }
> = {
  Vampire: {
    displayName: "Vampires",
    description:
      "Élégants, dramatiques et un peu trop convaincus qu’ils sont les héros de l’histoire. Ils préfèrent la nuit, le rouge foncé et les monologues inquiétants.",
    image: "/clans/vampire.png",
  },
  Sorcière: {
    displayName: "Sorcières",
    description:
      "Spécialistes des potions douteuses, des malédictions improvisées et des plans qui semblaient excellents sur le moment.",
    image: "/clans/sorciere.png",
  },
  Dragon: {
    displayName: "Dragons",
    description:
      "Bruyants, puissants et légèrement susceptibles. Ils aiment le feu, les trésors et rappeler qu’ils pourraient détruire tout le monde s’ils en avaient envie.",
    image: "/clans/dragon.png",
  },
  Nécromancien: {
    displayName: "Nécromanciens",
    description:
      "Très calmes, très pâles et toujours entourés de choses un peu inquiétantes. Leur idée d’une bonne ambiance inclut des ossements et du brouillard.",
    image: "/clans/necromancien.png",
  },
    "Faë": {
    displayName: "Faë",
    description:
      "Beaux, mystérieux et profondément incapables de répondre clairement à une question. Ils adorent les énigmes, les promesses tordues et créer le chaos juste pour voir.",
    image: "/clans/fae.png",
  },
};

type PageProps = {
  params: Promise<{ id: string }>;
};

function getAttackLevelLabel(level: string) {
  if (level === "small") return "Petite attaque";
  if (level === "medium") return "Attaque moyenne";
  if (level === "large") return "Grande attaque";
  return level;
}

export default async function ClanDetailPage({ params }: PageProps) {
  const { id } = await params;

  const { data: team, error: teamError } = await supabase
    .from("Teams")
    .select("*")
    .eq("id", id)
    .single();

  const { data: attacks, error: attacksError } = await supabase
    .from("attack_types")
    .select("*")
    .eq("team_id", id)
    .order("attack_cost", { ascending: true });

  if (teamError || !team) {
    return (
      <main className="min-h-screen bg-black px-6 py-16 text-white">
        <div className="mx-auto max-w-4xl">
          <a
            href="/clans"
            className="font-cormorant mb-8 inline-block text-lg text-[#6163FC] transition hover:text-white"
          >
            ← Retour aux clans
          </a>

          <p className="font-cormorant text-xl text-red-400">Clan introuvable.</p>
        </div>
      </main>
    );
  }

  const content = clanContent[team.name] ?? {
    description: "Description à venir.",
    image: "/clans/placeholder.png",
  };

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white">
      <div className="mx-auto max-w-5xl">
        <a
          href="/clans"
          className="font-cormorant mb-8 inline-block text-lg text-[#6163FC] transition hover:text-white"
        >
          ← Retour aux clans
        </a>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0E2028]">
          <div className="flex h-96 items-center justify-center bg-[#0E2028] p-8">
            <img
              src={content.image}
              alt={team.name}
              className="max-h-full max-w-full object-contain"
            />
          </div>

          <div className="p-8">
            <h1 className="font-cormorant text-5xl font-semibold">
  {content.displayName}
</h1>

            <p className="font-cormorant mt-6 max-w-3xl text-xl leading-relaxed text-white/90">
              {content.description}
            </p>
          </div>
        </div>

        <section className="mt-12">
          <h2 className="font-cinzel mb-8 text-2xl uppercase tracking-[0.2em] text-[#6163FC]">
            Attaques du clan
          </h2>

          {attacksError ? (
            <p className="font-cormorant text-xl text-red-400">
              Erreur lors du chargement des attaques.
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {attacks?.map((attack) => (
                <div
                  key={attack.id}
                  className="rounded-2xl border border-white/10 bg-[#0E2028] p-6"
                >
                  <p className="font-cinzel text-sm uppercase tracking-[0.2em] text-[#6163FC]">
                    {getAttackLevelLabel(attack.attack_level)}
                  </p>

                  <h3 className="font-cormorant mt-3 text-3xl font-semibold">
                    {attack.attack_name}
                  </h3>

                  <p className="font-cormorant mt-4 text-xl text-white/90">
                    Coût de lancement : {attack.attack_cost} points
                  </p>

                  <p className="font-cormorant mt-2 text-xl text-white/90">
                    Points retirés : {attack.points_removed} points
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}