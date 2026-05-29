export default function ReglesPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white">
      <div className="mx-auto max-w-3xl">
        <p className="font-cinzel mb-4 text-sm uppercase tracking-[0.4em] text-[#6163FC]">
          Battle of Clans III
        </p>

        <h1 className="font-great-vibes mb-10 text-6xl md:text-8xl">
          Règles du jeu
        </h1>

<div className="font-cormorant space-y-2 text-justify text-xl leading-[1.55] text-white/90 md:text-2xl">          <section>
            <h2 className="mb-6 text-2xl font-semibold text-white md:text-4xl">
              Défis
            </h2>

            <p>
              Un livre ne peut valider qu’un seul défi.
            </p>
            <p className="mt-1">
              Le seul défi pouvant être validé plusieurs fois est le défi « Erreur des Oracles ».
              Les Oracles recommandent 6 livres ou sagas différentes. Vous
              pouvez lire n’importe quel tome des sagas proposées, ou bien le
              one-shot recommandé.
            </p>

            <p className="mt-1">
              Chaque recommandation ne peut rapporter les points qu’une seule
              fois : si vous lisez plusieurs tomes d’une même saga, vous ne
              gagnerez qu’une seule fois les 50 points. En revanche, si vous
              lisez plusieurs recommandations différentes de la liste, vous
              pourrez obtenir plusieurs fois les 50 points.
            </p>

            <p className="mt-1">
              Un même défi peut être réalisé par chaque membre d’une équipe,
              mais qu’une fois par personne.
            </p>

            <p className="mt-1">
              Seuls les romans d’au moins 200 pages sont autorisés. Les romans
              graphiques, mangas, bandes dessinées, recueils de nouvelles et
              formats similaires ne comptent pas.
            </p>
          </section>

          <section>
            <h2 className="mb-6 text-2xl font-semibold text-white md:text-4xl">
              Stratégie de clans
            </h2>

            <p>
              Chaque clan possède un chef de clan. Le chef est le seul joueur
              autorisé à lancer des attaques, déclencher des infiltrations et
              prendre les décisions stratégiques sur le dashboard du clan.
            </p>

            <p className="mt-1">
              Il doit donc échanger avec son équipe afin de choisir au mieux
              les actions à mener. Les autres membres du clan peuvent consulter
              les informations et participer aux discussions, mais ils ne
              peuvent pas déclencher eux-mêmes les actions de guerre.
            </p>

            <p className="mt-1">
              Réunissez votre clan et organisez votre stratégie de guerre :
              délibérez ensemble sur les attaques, les infiltrations et les
              meilleures décisions à prendre pour mener votre équipe à la
              victoire.
            </p>
          </section>

          <section>
            <h2 className="mb-6 text-2xl font-semibold text-white md:text-4xl">
              Attaques
            </h2>

            <p>
              Utilisez les points gagnés grâce aux défis pour lancer des
              attaques et affaiblir un clan adverse. Chaque attaque ne peut être utilisée qu’une seule fois, et une
              seule attaque peut être active contre un même clan à la fois.
            </p>

            <p className="mt-1">
              Lorsqu’une attaque est lancée, son coût est immédiatement retiré
              au clan attaquant, tandis que les points correspondants sont
              retirés au clan ciblé.
            </p>

            <p className="mt-1">
              Une attaque reste active pendant 48 heures, sauf si elle est
              annulée grâce à une infiltration réussie. Les chefs de clan
              doivent donc choisir avec soin le bon moment et la bonne cible
              afin de ne pas gaspiller leurs ressources.
            </p>
          </section>

          <section>
            <h2 className="mb-6 text-2xl font-semibold text-white md:text-4xl">
              Infiltrations
            </h2>

            <p>
              Pour parer une attaque, vous pouvez tenter de vous infiltrer dans
              l’équipe adverse.
            </p>

            <p className="mt-1">
              Chaque équipe possède un code secret : il s’agit d’un titre de
              livre mettant en scène les créatures de son clan. Par exemple,
              pour les vampires, le code pourrait être Dracula.
            </p>

            <p className="mt-1">
              Si vous trouvez le code secret de l’équipe qui vous attaque,
              l’attaque est immédiatement annulée. Pour vous aider, 4 indices sont disponibles :</p>

            <ul className="mt-2 list-disc space-y-1 pl-8 text-left">
              <li>
                le 1er indice est gratuit, à condition que le score du clan
                soit positif ou nul
              </li>
              <li>le 2e coûte 2 points</li>
              <li>le 3e coûte 4 points</li>
              <li>le 4e coûte 6 points</li>
            </ul>

            <p className="mt-1">
              Vous disposez de 48h après le lancement de l’attaque pour trouver
              le code secret, avec un maximum de 3 essais.
            </p>
          </section>

          <section>
            <h2 className="mb-6 text-2xl font-semibold text-white md:text-4xl">
              Évènements flash
            </h2>

            <p>
              Des évènements flash apparaîtront de manière aléatoire pendant
              toute la durée du challenge. Certains ne dureront que quelques
              heures, d’autres plusieurs jours.
            </p>

            <p className="mt-1">
              Pensez à vérifier régulièrement les annonces des Oracles, ainsi
              que l’onglet flash sur votre dashboard, afin de ne manquer aucune
              occasion de gagner des points… ou d’éviter d’en perdre.
            </p>
          </section>

          <section>
            <h2 className="mb-6 text-2xl font-semibold text-white md:text-4xl">
              Corruptions
            </h2>

            <p>
              La faille temporelle corrompt peu à peu les clans. Pendant le
              challenge, des corruptions pourront toucher une équipe entière.
            </p>

            <p className="mt-1">
              Plus le challenge avancera, plus les corruptions deviendront
              puissantes et imprévisibles. À la fin du challenge, la faille deviendra incontrôlable :
              plusieurs corruptions pourront se cumuler en même temps.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}