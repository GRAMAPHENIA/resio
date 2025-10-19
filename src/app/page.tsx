import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="mt-32 flex flex-col bg-background">
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <h1 className="text-9xl font-bold mb-4 text-foreground">RESIO</h1>
        <p className="text-lg text-neutral-400 text-center max-w-md">
          Explora una amplia variedad de opciones de alojamiento que se adapten
          a tus necesidades.
        </p>
      </main>
      <Footer />
    </div>
  );
}
