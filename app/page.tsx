export default function Home() {
  return (
    <main
  className="relative min-h-[calc(100vh-73px)] text-white"
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
      <section className="flex min-h-[calc(100vh-73px)] flex-col items-center justify-center px-6 text-center">
        <p className="font-cinzel mb-4 text-sm uppercase tracking-[0.4em] text-[#6163FC]">
          Battle of Clans III
        </p>

        <h1 className="font-great-vibes mb-6 text-6xl md:text-8xl">
          The Fairypool Rift
        </h1>

        <p className="font-cormorant mx-auto max-w-3xl text-2xl text-white/90 md:text-3xl">
          Une faille s'est ouverte dans la Fairy Pool. Le passé change. Les
          clans se corrompent. Un seul clan pourra refermer la faille… et
          revenir vivant.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <a
            href="/mon-espace"
            className="font-cormorant rounded-full bg-[#6163FC] px-8 py-3 text-xl font-semibold transition hover:bg-[#7B7DFF]"
          >
            Se connecter
          </a>

          <a
            href="/inscription"
            className="font-cormorant rounded-full border border-white/20 px-8 py-3 text-xl font-semibold transition hover:bg-white/10"
          >
            S'inscrire
          </a>
        </div>
      </section>
      </div>
    </main>
  );
}