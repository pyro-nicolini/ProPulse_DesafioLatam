import { useFadeUp } from "../../hooks/useFadeUp";
import Hero from "../../componentes/Hero";

function Home() {
  // Hook que activa la animación fade-up cuando los elementos entran al viewport
  useFadeUp();

  return (
    <div className="container glass p-1 fade-up">
      <h1>Home</h1>
      <Hero />
      <div className="card fade-up">
        <h2 className="text-gradient">Bienvenido a la plantilla</h2>
        <h3 className="text-gradient">Bienvenido a la plantilla</h3>
        <p className="text-gradient text-center">Bienvenido a la plantilla</p>
      </div>
        <p className="text-center m-2">Recuerda usar CONTAINER-CARD, GRID y GRID-COLS-(12345) para cards en columnas responsivas</p>
      <div className="container-cards grid grid-cols-3 gap-1">
        <div className="card fade-up ">
          <h3>Esta es una card</h3>
          <p>Texto de tu card</p>
        </div>
        <div className="card fade-up">
          <h3>Esta es una card</h3>
          <p>Texto de tu card</p>
      </div>
        <div className="card fade-up">
          <h3>Esta es una card</h3>
          <p>Texto de tu card</p>
      </div>
      </div>
    </div>
  );
}

export default Home;
