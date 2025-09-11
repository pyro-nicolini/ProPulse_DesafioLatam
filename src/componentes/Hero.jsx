import React, { useState, useEffect, useCallback } from "react";


// Mock data para el ejemplo
const mockProducts = [
  {
    id_producto: 1,
    titulo: "Proteína Whey Gold Standard 5 lbs",
    descripcion: "Proteína de suero aislada con 24g de proteína por porción, sabor chocolate doble. Ideal para recuperación muscular post-entreno",
    precio: 45000,
    url_imagen: "https://picsum.photos/id/1011/800/600",
    destacado: true,
  },
  {
    id_producto: 4,
    titulo: "Barra Olímpica 20kg",
    descripcion: "Barra olímpica de 2.2m con rodamientos de acero, soporta hasta 700kg. Ideal para powerlifting",
    precio: 125000,
    url_imagen: "https://picsum.photos/id/1014/800/600",
    destacado: true,
  },
  {
    id_producto: 7,
    titulo: "BCAA 2:1:1 en Polvo 400g",
    descripcion: "Aminoácidos ramificados en proporción 2:1:1, previene catabolismo muscular. Sabor sandía",
    precio: 28000,
    url_imagen: "https://picsum.photos/id/1018/800/600",
    destacado: true,
  },
  {
    id_producto: 10,
    titulo: "Rack de Sentadillas Ajustable",
    descripcion: "Rack de sentadillas con barras de seguridad ajustables, soporta hasta 500kg, incluye pull-up bar",
    precio: 450000,
    url_imagen: "https://picsum.photos/id/1025/800/600",
    destacado: true,
  },
  {
    id_producto: 13,
    titulo: "Multivitamínico para Deportistas",
    descripcion: "Complejo vitamínico y mineral específico para atletas, 90 cápsulas, incluye antioxidantes",
    precio: 32000,
    url_imagen: "https://picsum.photos/id/1035/800/600",
    destacado: true,
  },
  {
    id_producto: 16,
    titulo: "Prensa de Pierna 45 Grados",
    descripcion: "Máquina de prensa de pierna con ángulo de 45°, plataforma antideslizante, capacidad 400kg",
    precio: 850000,
    url_imagen: "https://picsum.photos/id/1041/800/600",
    destacado: true,
  },
];

const Hero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  
  const destacados = mockProducts.filter(product => product.destacado);

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === destacados.length - 1 ? 0 : prevIndex + 1
    );
  }, [destacados.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? destacados.length - 1 : prevIndex - 1
    );
  }, [destacados.length]);

  const goToSlide = useCallback((index) => {
    setCurrentIndex(index);
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(goToNext, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, goToNext]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "ArrowLeft") goToPrev();
      if (e.key === "ArrowRight") goToNext();
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [goToPrev, goToNext]);

  const formatPrice = (precio) => {
    if (!precio) return "";
    return `$${Number(precio).toLocaleString("es-CL")}`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <style jsx>{`
        .carousel-container {
          position: relative;
          width: 100%;
          height: 500px;
          overflow: hidden;
          border-radius: 12px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }

        .carousel-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .carousel-slide {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          transform: translateX(100%);
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }

        .carousel-slide.active {
          opacity: 1;
          transform: translateX(0);
          z-index: 2;
        }

        .carousel-slide.prev {
          transform: translateX(-100%);
          opacity: 0;
        }

        .carousel-slide.next {
          transform: translateX(100%);
          opacity: 0;
        }

        .slide-content {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0,0,0,0.8));
          padding: 3rem 2rem 2rem;
          color: white;
        }

        .slide-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          line-height: 1.2;
        }

        .slide-description {
          font-size: 1.1rem;
          margin-bottom: 1rem;
          opacity: 0.9;
          line-height: 1.5;
        }

        .slide-price {
          font-size: 2rem;
          font-weight: 700;
          color: #fb923c;
          margin-bottom: 1.5rem;
        }

        .slide-buttons {
          display: flex;
          gap: 1rem;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1rem;
        }

        .btn-primary {
          background-color: #3b82f6;
          color: white;
        }

        .btn-primary:hover {
          background-color: #2563eb;
          transform: translateY(-2px);
        }

        .btn-secondary {
          background-color: transparent;
          color: white;
          border: 2px solid white;
        }

        .btn-secondary:hover {
          background-color: white;
          color: #1f2937;
          transform: translateY(-2px);
        }

        .nav-button {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0,0,0,0.5);
          color: white;
          border: none;
          width: 3rem;
          height: 3rem;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1.5rem;
          z-index: 10;
          transition: all 0.3s ease;
        }

        .nav-button:hover {
          background: rgba(0,0,0,0.8);
          transform: translateY(-50%) scale(1.1);
        }

        .nav-prev {
          left: 1rem;
        }

        .nav-next {
          right: 1rem;
        }

        .carousel-indicators {
          position: absolute;
          bottom: 1rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 0.5rem;
          z-index: 10;
        }

        .indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: rgba(255,255,255,0.5);
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .indicator.active {
          background: white;
          transform: scale(1.2);
        }

        .indicator:hover {
          background: rgba(255,255,255,0.8);
        }

        .carousel-info {
          background: #1f2937;
          color: white;
          padding: 1rem;
          text-align: center;
          border-radius: 0 0 12px 12px;
        }

        @media (max-width: 768px) {
          .carousel-container {
            height: 400px;
          }

          .slide-title {
            font-size: 1.8rem;
          }

          .slide-description {
            font-size: 1rem;
          }

          .slide-price {
            font-size: 1.5rem;
          }

          .slide-buttons {
            flex-direction: column;
            gap: 0.5rem;
          }

          .btn {
            padding: 0.5rem 1rem;
            font-size: 0.9rem;
          }
        }
      `}</style>

      <div 
        className="carousel-container"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        <div className="carousel-wrapper">
          {destacados.map((slide, index) => (
            <div
              key={slide.id_producto}
              className={`carousel-slide ${
                index === currentIndex 
                  ? 'active' 
                  : index < currentIndex 
                    ? 'prev' 
                    : 'next'
              }`}
              style={{
                backgroundImage: `url(${slide.url_imagen})`
              }}
            >
              <div className="slide-content">
                <h3 className="slide-title">{slide.titulo}</h3>
                <p className="slide-description">{slide.descripcion}</p>
                <div className="slide-price">
                  {formatPrice(slide.precio)}
                </div>
                <div className="slide-buttons">
                  <button className="btn btn-primary">
                    Ver más detalles
                  </button>
                  <button className="btn btn-secondary">
                    Comprar ahora
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <button 
          className="nav-button nav-prev"
          onClick={goToPrev}
          aria-label="Slide anterior"
        >
          ‹
        </button>

        <button 
          className="nav-button nav-next"
          onClick={goToNext}
          aria-label="Slide siguiente"
        >
          ›
        </button>

        {/* Indicators */}
        <div className="carousel-indicators">
          {destacados.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Ir al slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Info Bar */}
      <div className="carousel-info">
        <p className="text-sm opacity-75">
          Productos destacados - {currentIndex + 1} de {destacados.length}
        </p>
      </div>
    </div>
  );
};

export default Hero;