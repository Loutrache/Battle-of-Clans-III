import { supabase } from "../lib/supabase";

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

export default async function ClansPage() {
  const { data: teams, error } = await supabase.from("Teams").select("*");

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white">
      <div className="mx-auto max-w-6xl">
        <p className="font-cinzel mb-4 text-sm uppercase tracking-[0.4em] text-[#6163FC]">
          Battle of Clans III
        </p>

        <h1 className="font-great-vibes mb-12 text-6xl md:text-8xl">Clans</h1>

        {error ? (
          <p className="font-cormorant text-xl text-red-400">
            Erreur lors du chargement des clans.
          </p>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            {teams?.map((team) => {
              const content = clanContent[team.name] ?? {
                description: "Description à venir.",
                image: "/clans/placeholder.png",
              };

              return (
                <a
                  key={team.id}
                  href={`/clans/${team.id}`}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-[#0E2028] transition hover:border-[#6163FC] hover:bg-[#132b35]"
                >
                  <div className="flex h-80 items-center justify-center bg-[#0E2028] p-6">
                    <img
                      src={content.image}
                      alt={team.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>

                  <div className="p-6">
                    <h2 className="font-cormorant text-4xl font-semibold">
  {content.displayName}
</h2>

                    <p className="font-cormorant mt-4 text-xl leading-relaxed text-white/90">
                      {content.description}
                    </p>

                    <p className="font-cinzel mt-6 text-sm uppercase tracking-[0.2em] text-[#6163FC]">
                      Clique ici pour découvrir les attaques du clan
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}