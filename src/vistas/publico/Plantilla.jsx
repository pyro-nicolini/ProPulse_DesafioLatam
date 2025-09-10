import { useFadeUp } from "../../hooks/useFadeUp";

function Plantilla() {
  // Hook que activa la animación fade-up cuando los elementos entran al viewport
  useFadeUp();
  return (
    <div className="container glass p-1 fade-up">
      {/* TITULOS */}
      <h1 className="text-gradient">Bienvenido a la plantilla H1</h1>
      <h2>Esto es un h2</h2>
      <p>el fondo utiliza una clase llamada .glass</p>

      {/* CARD SUELTA */}
      <div className="card fade-up">
        <h3>Esta es una card responsiva normal</h3>
        <p>Tú card puede tener efecto (FADE-UP) al aparecer</p>
        <p className="text-center">soy un párrafo con text-center</p>
        
        <div className="flex gap-1">
          <button className="btn btn-primary">btn con btn-primary</button>
          <button className="btn btn-secondary">btn con btn-secondary</button>
        </div>
      </div>

      {/* GRID 2 COLUMNAS */}
      <div className="container-cards grid grid-cols-2">
        <div className="card fade-up">
          <h3>Esta es otra card</h3>
          <p>Texto de tu card</p>
          <div className="flex gap-1">
            <button className="btn btn-primary">Click Me</button>
            <button className="btn btn-secondary">Click Me</button>
          </div>
        </div>
        <div className="card fade-up">
          <h3>Esta es otra card</h3>
          <p>Texto de tu card</p>
          <div className="flex gap-1">
            <button className="btn btn-primary">Click Me</button>
            <button className="btn btn-secondary">Click Me</button>
          </div>
        </div>
      </div>

      {/* GRID 4 COLUMNAS */}
      <div className="container-cards grid grid-cols-4">
        <div className="card fade-up">
          <h3>Esta es otra A</h3>
          <p>El FadeUp aparece cuando lo miras</p>
          <div className="flex gap-1 f-wrap">
            <button className="btn btn-primary">Click Me</button>
            <button className="btn btn-secondary">Click Me</button>
          </div>
        </div>
        <div className="card fade-up">
          <h3>Esta es otra B</h3>
          <p>El FadeUp aparece cuando lo miras</p>
          <div className="flex gap-1">
            <button className="btn btn-primary">Click Me</button>
            <button className="btn btn-secondary">Click Me</button>
          </div>
        </div>
        <div className="card fade-up">
          <h3>Esta es otra C</h3>
          <p>El FadeUp aparece cuando lo miras</p>
          <div className="flex gap-1">
            <button className="btn btn-primary">Click Me</button>
            <button className="btn btn-secondary">Click Me</button>
          </div>
        </div>
        <div className="card fade-up">
          <h3>Esta es otra D</h3>
          <p>El FadeUp aparece cuando lo miras</p>
          <div className="flex gap-1">
            <button className="btn btn-primary">Click Me</button>
            <button className="btn btn-secondary">Click Me</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Plantilla;