import LoginButton from "@/components/LoginButton";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <LoginButton />
        <h1 className="text-4xl font-bold mt-8 mb-4">RESIO</h1>
        <p className="text-lg text-gray-600 text-center max-w-md">
          Explora una amplia variedad de opciones de alojamiento que se adapten
          a tus necesidades.
        </p>
      </main>
      <Footer />
    </div>
  );
}
