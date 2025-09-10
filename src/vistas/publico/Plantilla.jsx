import { useFadeUp } from "../../hooks/useFadeUp";
import logoColor1 from "../../assets/img/logos/logo_propulse.svg";
import logoColor2 from "../../assets/img/logos/logo_propulse2.svg";
import logoColor3 from "../../assets/img/logos/logo_propulse_white.png";
import foto1 from "../../assets/img/ejemplos/jump.jpg";
import foto2 from "../../assets/img/ejemplos/nike-running.webp";
import foto3 from "../../assets/img/ejemplos/silueta.webp";
import foto4 from "../../assets/img/ejemplos/run.jpeg";

function Plantilla() {
  // Hook que activa la animación fade-up cuando los elementos entran al viewport
  useFadeUp();
  return (
    <div className="container glass p-1 fade-up">
      {/* TITULOS */}
      <h1 className="text-gradient">Bienvenido a la plantilla H1</h1>
      <h2>Esto es un h2</h2>
      <p className="subtitle">Subtitulo</p>
      <p>este fondo del container utiliza una clase llamada .glass</p>

      {/* CARD SUELTA */}
      <div className="card fade-up">
        <h3>Esta es una card responsiva</h3>
        <p>Tú card puede tener efecto (FADE-UP) al aparecer</p>
        <p className="text-center">soy un párrafo con text-center</p>

        <div className="flex gap-1 flex-col-responsive">
          <button className="btn btn-primary">btn con btn-primary</button>
          <button className="btn btn-secondary">btn con btn-secondary</button>
        </div>
      </div>

      {/* GRID 2 COLUMNAS */}
      <div className="container-cards grid grid-cols-2">
        <div className="card fade-up">
          <h3>una card en container-cards</h3>
          <p> </p>
          <div className="flex gap-1">
            <button className="btn btn-primary">Click Me</button>
            <button className="btn btn-secondary">Click Me</button>
          </div>
        </div>
        <div className="card fade-up">
          <h3>el container uso grid-cols-2</h3>
          <p> para separar en 2 columnas</p>
          <div className="flex gap-1">
            <button className="btn btn-primary">Click Me</button>
            <button className="btn btn-secondary">Click Me</button>
          </div>
        </div>
      </div>

      {/* GRID 3 COLUMNAS */}
      <div className="container-cards grid grid-cols-3 glass p-2 mt-4 pt-4 pb-4">
        <div className="card-white fade-up">
          <h3>clase png transparencias</h3>
          <img
            className="png bg-gradient-secondary"
            src={logoColor1}
            alt="Logo color"
          />
          <p>
            Estas son las " png " , son transparentes, tiene canal alpha, puedes
            poner un bg-color
          </p>
          <div className="flex gap-1 f-wrap">
            <button className="btn btn-primary">Click Me</button>
            <button className="btn btn-secondary">Click Me</button>
          </div>
        </div>
        <div className="card-white fade-up">
          <h3>clase png2</h3>
          <img className="png2" src={logoColor2} alt="Logo color" />
          <p>Estas son las " png2 " mantienen relacion cuadrada tiene COVER</p>
          <div className="flex gap-1">
            <button className="btn btn-primary">Click Me</button>
            <button className="btn btn-secondary">Click Me</button>
          </div>
        </div>
        <div className="card-white fade-up">
          <h3>clase png3</h3>
          <img
            className="png3 bg-gradient-primary"
            src={logoColor3}
            alt="Logo color"
          />
          <p>
            Estas son las " png3 " mantienen relacion cuadrada tiene CONTAIN
          </p>
          <div className="flex gap-1">
            <button className="btn btn-primary">Click Me</button>
            <button className="btn btn-secondary">Click Me</button>
          </div>
        </div>
      </div>

      {/* GRID 3 COLUMNAS */}
      <div className="container-cards grid grid-cols-4 glass p-2 mt-4 pt-4 pb-4">
        <div className="card-white fade-up">
          <h3>Esta es una img sin control</h3>
          <img
            className="img bg-gradient-secondary"
            src={foto1}
            alt="Logo color"
          />
          <p>
            Esta " img " el tamaño es 100% y altura automatica (sin control,
            como viene la foto)
          </p>
          <div className="flex gap-1 f-wrap">
            <button className="btn btn-primary">Click Me</button>
            <button className="btn btn-secondary">Click Me</button>
          </div>
        </div>
        <div className="card-white fade-up">
          <h3>Esta es una img2</h3>
          <img className="img2" src={foto2} alt="Logo color" />
          <p>Estas son las " img2 " width 100% y mantienen relacion cuadrada tiene COVER</p>
          <div className="flex gap-1">
            <button className="btn btn-primary">Click Me</button>
            <button className="btn btn-secondary">Click Me</button>
          </div>
        </div>
        <div className="card-white fade-up">
          <h3>Esta es img3</h3>
          <img className="img3 object-cover" src={foto3} alt="Logo color" />
          <p>
            Estas son las " img3 " mantienen relacion 1 / 2, utilizo un object-cover (object-fit: cover)
          </p>
          <div className="flex gap-1">
            <button className="btn btn-primary">Click Me</button>
            <button className="btn btn-secondary">Click Me</button>
          </div>
        </div>

        <div
          style={{ backgroundImage: `url(${foto4})` }}
          className="card card-bg-img fade-up text-shadow"
        >
          <div className="relative z-20 flex-col justify-end h-full">
            <h3>esta es la img4</h3>
            <p>
              Estas son las " img4 " mantienen relacion cuadrada tiene CONTAIN
            </p>
            <div className="flex gap-1">
              <button className="btn btn-primary">Click Me</button>
              <button className="btn btn-secondary">Click Me</button>
            </div>
          </div>
        </div>
      </div>

      {/* GRID 3 COLUMNAS */}
      <div className="container-cards grid grid-cols-3 m-4">
        <div className="card-white fade-up">
          <h3>Esta es otra A</h3>
          <p>El FadeUp aparece cuando lo miras</p>
          <div className="flex gap-1 f-wrap">
            <button className="btn btn-primary">Click Me</button>
            <button className="btn btn-secondary">Click Me</button>
          </div>
        </div>
        <div className="card-white fade-up">
          <h3>Esta es otra B</h3>
          <p>El FadeUp aparece cuando lo miras</p>
          <div className="flex gap-1">
            <button className="btn btn-primary">Click Me</button>
            <button className="btn btn-secondary">Click Me</button>
          </div>
        </div>
        <div className="card-white fade-up">
          <h3>Esta es otra C</h3>
          <p>El FadeUp aparece cuando lo miras</p>
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
          <p>Aqui se uso f-wrap </p>
          <div className="flex gap-1 f-wrap">
            <button className="btn btn-primary">Click Me</button>
            <button className="btn btn-secondary">Click Me</button>
          </div>
        </div>
        <div className="card fade-up">
          <h3>Esta es otra B</h3>
          <p>El FadeUp aparece cuando lo miras</p>
          <div className="flex gap-1 flex-col-responsive">
            <button className="btn btn-primary">Click Me</button>
            <button className="btn btn-secondary">Click Me</button>
          </div>
        </div>
        <div className="card fade-up">
          <h3>Esta es otra C</h3>
          <p>El FadeUp aparece cuando lo miras</p>
          <div className="flex gap-1 flex-col-responsive">
            <button className="btn btn-primary">Click Me</button>
            <button className="btn btn-secondary">Click Me</button>
          </div>
        </div>
        <div className="card fade-up">
          <h3>Esta es otra D</h3>
          <p>El FadeUp aparece cuando lo miras</p>
          <div className="flex gap-1 flex-col-responsive">
            <button className="btn btn-primary">Click Me</button>
            <button className="btn btn-secondary">Click Me</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Plantilla;
