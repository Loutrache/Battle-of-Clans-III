export default function DefisPage() {
  const categories = [
    {
      points: "20 points",
      defis: [
        "Souvenir effacé : lire un livre oublié dans ta PAL",
        "Retour en arrière : faire une relecture",
        "Timeline brisée : lire un livre avec des flashbacks",
        "Avant tout : lire un livre avec un personnage enfant / ado",
        "Autre époque : lire un livre historique",
        "Faille temporelle : lire un livre avec voyage dans le temps",
        "Fragment du temps : lire un livre en moins de 48h",
        "Trace du passé : poster une photo d’un livre ancien / abîmé",
        "Réécriture : lire une réécriture (conte, mythe, histoire…)",
        "Entre deux mondes : lire un livre mettant en scène au moins deux créatures appartenant aux clans du challenge",
      ],
    },
    {
      points: "30 points",
      defis: [
        "Mémoire instable : lire un livre avec un personnage amnésique",
        "Destin inévitable : lire un livre avec une prophétie",
        "Écho du passé : lire un livre publié avant 2010",
        "Indice perdu : lire un livre avec une enquête",
        "Tout s’effondre : lire une dystopie",
        "Conséquences : lire un livre avec un sacrifice important",
        "Secret enfoui : lire un livre avec un secret de famille",
        "Réalité altérée : lire un livre où un personnage possède un pouvoir de manipulation mentale",
        "Faux souvenirs : lire un livre dans lequel le personnage principal découvre qu’une partie de ses souvenirs est fausse",
        "Sang ancien : lire un livre avec une famille noble ou royale",
      ],
    },
    {
      points: "40 points",
      defis: [
        "Écho de la Loutrache : lire un livre avec une créature mystique",
        "Une vie avant minuit : lire un livre qui se déroule sur une seule journée ou une seule nuit",
        "Miroir trompeur : lire un livre avec une identité cachée ou une personne qui se fait passer pour quelqu’un d’autre",
        "Corruption : lire un livre où le personnage principal se fait trahir par un proche",
        "Mémoire du monde : lire un classique",
        "Deux temporalités : lire un livre avec plusieurs timelines",
        "Objet clé : lire un livre avec un artefact important",
        "Créature oubliée : lire un livre avec une créature peu connue",
        "Magie interdite : lire un livre où certains pouvoirs sont interdits",
        "Pacte interdit : lire un livre dans lequel un personnage conclut un marché",
      ],
    },
    {
      points: "50 points",
      defis: [
        "Erreur des Oracles : lire une recommandation des Oracles",
        "Au cœur de la Faille : lire un livre de plus de 600 pages",
        "La mort lui va si bien : lire un livre avec un personnage qui revient d’entre les morts",
        "Paradoxe : lire un livre qui t’a fait changer d’avis sur un genre",
        "Tous ne reviendront pas : lire un livre où plusieurs personnages meurent",
        "Infiltration parfaite : lire un livre hors de tes goûts habituels",
        "Le bon moment : lire un livre avec exactement 55 chapitres",
        "Sacrifice ultime : lire un livre avec une fin tragique",
        "Archiviste du temps : lire 13 livres pendant le challenge",
        "Les portes du chaos : lire un livre avec un portail, une faille ou un passage vers un autre monde",
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white">
      <div className="mx-auto max-w-6xl">
        <p className="font-cinzel mb-4 text-sm uppercase tracking-[0.4em] text-[#6163FC]">
          Battle of Clans III
        </p>

        <h1 className="font-great-vibes mb-12 text-6xl md:text-8xl">
          Défis
        </h1>

        <div className="space-y-10">
          {categories.map((categorie) => (
            <section
              key={categorie.points}
              className="rounded-3xl border border-white/10 bg-[#0E2028] p-8 shadow-xl"
            >
              <h2 className="font-cinzel mb-6 text-2xl uppercase tracking-[0.2em] text-[#6163FC]">
                {categorie.points}
              </h2>

              <ul className="font-cormorant space-y-4 text-lg leading-relaxed text-white/90 md:text-xl">
                {categorie.defis.map((defi) => {
  const [titre, description] = defi.split(" : ");

  return (
    <li
      key={defi}
      className="border-b border-white/10 pb-4 last:border-b-0"
    >
      <span className="font-bold text-white">{titre}</span>
      {description && <> : {description}</>}
    </li>
  );
})}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}