// ===== ARCHIVO NUEVO (Paso 3, rediseñado en el Paso 4: inicio del cliente) =====
// Cuatro secciones: Portada, Cómo pedir, Historia y Contacto, más el componente que las junta.
// Los datos (dirección, horarios, etc.) vienen de ../datosNegocio.js
// Los colores y tamaños están en estilos.css (clases como "portada", "historia", "contacto").
import {
  NOMBRE_NEGOCIO, NUMERO_WHATSAPP, TELEFONO_VISIBLE, DIRECCION, HORARIOS, EMAIL,
  ANIOS_DE_TRAYECTORIA, ANIO_FUNDACION,
} from '../datosNegocio.js';

// ---------- PORTADA (hero) ----------
// Sin logo grande: el logo está en la barra de arriba (ver .barra__logo en estilos.css).
function Portada({ onVerCatalogo }) {
  return (
    <section className="portada">
      <div className="portada__texto contenedor">
        <h1 className="portada__titulo">Tu carnicería de siempre, ahora con pedido por WhatsApp</h1>
        <p className="portada__bajada">
          Carnes, achuras, embutidos y menudencias frescas. Elegí los cortes, indicá los kilos
          y cerramos el pedido por mensaje.
        </p>
        <div className="portada__acciones">
          <button className="boton boton--oro boton--grande" onClick={onVerCatalogo}>
            Ver el catálogo
          </button>
          <a
            className="boton boton--contorno boton--grande"
            href={`https://wa.me/${NUMERO_WHATSAPP}`}
            target="_blank"
            rel="noreferrer"
          >
            Escribinos
          </a>
        </div>
      </div>
    </section>
  );
}

// ---------- CÓMO PEDIR (es una secuencia de verdad, por eso va numerada) ----------
const PASOS = [
  { titulo: 'Elegí los cortes', texto: 'Recorré el catálogo por secciones y agregá al carrito lo que necesites.' },
  { titulo: 'Indicá los kilos', texto: 'En el carrito ajustás la cantidad de cada producto y ves el total estimado.' },
  { titulo: 'Confirmá por WhatsApp', texto: 'Te armamos el mensaje con tu pedido. Lo enviás y lo dejamos listo.' },
];

function ComoPedir() {
  return (
    <section className="seccion">
      <div className="contenedor">
        <div className="encabezado-pagina">
          <h2 className="titulo-pagina">Cómo hacer tu pedido</h2>
        </div>
        <ol className="pasos" style={{ margin: 0, padding: 0, listStyle: 'none' }}>
          {PASOS.map((paso, indice) => (
            <li key={paso.titulo} className="paso">
              <div className="paso__numero">{indice + 1}</div>
              <h3 className="paso__titulo">{paso.titulo}</h3>
              <p className="paso__texto">{paso.texto}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

// ---------- HISTORIA (texto inventado de ejemplo) ----------
function Historia() {
  return (
    <section className="historia seccion">
      <div className="contenedor historia__grilla">
        <div>
          <h2 className="historia__titulo">{ANIOS_DE_TRAYECTORIA} años cortando con criterio</h2>
          <p className="historia__cita">“La balanza no miente, y el cliente tampoco se va con dudas.”</p>
        </div>
        <div className="historia__texto">
          <p>
            Todo empezó en {ANIO_FUNDACION}, cuando Don Ernesto Ramírez abrió una carnicería de barrio con una idea
            simple: mercadería fresca, cortes bien trabajados y trato de confianza con cada vecino.
          </p>
          <p>
            Con los años la familia sumó achuras, embutidos y menudencias, y el local se transformó en un
            frigorífico de referencia en la zona. Hoy la segunda generación sigue atendiendo con la misma
            dedicación del primer día.
          </p>
          <p>
            Ahora también podés armar tu pedido desde acá: elegís los productos, los kilos que necesitás
            y lo confirmás por WhatsApp.
          </p>
        </div>
      </div>
    </section>
  );
}

// ---------- CONTACTO ----------
function Contacto() {
  return (
    <section className="contacto seccion">
      <div className="contenedor">
        <h2 className="contacto__titulo">Dónde encontrarnos</h2>
        <div className="contacto__grilla">
          <div>
            <h3 className="contacto__subtitulo">Local</h3>
            <p className="contacto__dato">{DIRECCION}</p>
          </div>
          <div>
            <h3 className="contacto__subtitulo">Horarios</h3>
            <dl className="horarios" style={{ margin: 0 }}>
              {HORARIOS.map((fila) => (
                <div key={fila.dias}>
                  <dt>{fila.dias}</dt>
                  <dd>{fila.horas}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <h3 className="contacto__subtitulo">Pedidos y consultas</h3>
            <p className="contacto__dato">{TELEFONO_VISIBLE}</p>
            <p className="contacto__dato">{EMAIL}</p>
            <a
              className="boton boton--oro"
              style={{ marginTop: '14px' }}
              href={`https://wa.me/${NUMERO_WHATSAPP}`}
              target="_blank"
              rel="noreferrer"
            >
              Escribinos por WhatsApp
            </a>
          </div>
        </div>
        <p className="contacto__pie">{NOMBRE_NEGOCIO}. Desde {ANIO_FUNDACION}.</p>
      </div>
    </section>
  );
}

// ---------- Junta las secciones ----------
export default function PaginaInicio({ onVerCatalogo }) {
  return (
    <div>
      <Portada onVerCatalogo={onVerCatalogo} />
      <ComoPedir />
      <Historia />
      <Contacto />
    </div>
  );
}
