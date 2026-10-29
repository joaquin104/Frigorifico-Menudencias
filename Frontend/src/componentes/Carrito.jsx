// ===== ARCHIVO NUEVO (Paso 2, rediseñado en el Paso 4: pantalla del carrito) =====
// Componente "de presentación": solo dibuja lo que le llega por props.
// La lógica (agregar, quitar, confirmar) vive en App.jsx, en el bloque marcado NUEVO.
import { formatearPesos } from '../carritoUtils.js';

// Recibe los kg actuales (texto) y un cambio (+0.5 o -0.5); retorna los kg nuevos (texto).
// Nunca baja de 0.5 Kg: para sacar el producto está el botón "Quitar".
function sumarKg(kgActual, cambio) {
  const nuevo = Math.max(0.5, (parseFloat(kgActual) || 0) + cambio);
  return String(Number(nuevo.toFixed(2)));
}

export default function Carrito({ carrito, total, onCambiarKg, onQuitar, onVaciar, onConfirmar, onVerCatalogo }) {
  if (carrito.length === 0) {
    return (
      <section className="contenedor seccion">
        <h2 className="titulo-pagina">Mi carrito</h2>
        <div className="vacio" style={{ marginTop: '24px' }}>
          <p style={{ marginBottom: '16px' }}>Todavía no agregaste productos.</p>
          <button className="boton boton--principal" onClick={onVerCatalogo}>Ver catálogo</button>
        </div>
      </section>
    );
  }

  return (
    <section className="contenedor seccion">
      <div className="encabezado-pagina">
        <h2 className="titulo-pagina">Mi carrito</h2>
        <p className="subtitulo">Ajustá los kilos de cada producto y confirmá el pedido por WhatsApp.</p>
      </div>

      <div className="carrito">
        <ul>
          {carrito.map((item) => (
            <li key={item.id} className="carrito__item">
              <div>
                <h3 className="carrito__nombre">{item.nombre}</h3>
                <p className="carrito__precio">${formatearPesos(item.precio)} por kg</p>
                <button className="boton boton--texto carrito__quitar" onClick={() => onQuitar(item.id)}>
                  Quitar
                </button>
              </div>

              <div className="cantidad">
                <button
                  className="cantidad__paso"
                  aria-label={`Restar 0,5 kg de ${item.nombre}`}
                  onClick={() => onCambiarKg(item.id, sumarKg(item.kg, -0.5))}
                >
                  −
                </button>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={item.kg}
                  aria-label={`Kilos de ${item.nombre}`}
                  onChange={(e) => onCambiarKg(item.id, e.target.value)}
                />
                <span className="cantidad__unidad">kg</span>
                <button
                  className="cantidad__paso"
                  aria-label={`Sumar 0,5 kg de ${item.nombre}`}
                  onClick={() => onCambiarKg(item.id, sumarKg(item.kg, 0.5))}
                >
                  +
                </button>
              </div>

              <p className="carrito__subtotal">${formatearPesos(item.precio * (parseFloat(item.kg) || 0))}</p>
            </li>
          ))}
        </ul>

        <aside className="resumen">
          <h3 className="resumen__titulo">Resumen del pedido</h3>
          <p className="resumen__total">${formatearPesos(total)}</p>
          <p className="resumen__nota">
            Total estimado. El precio final y la disponibilidad se confirman por WhatsApp.
          </p>
          <button className="boton boton--whatsapp boton--bloque boton--grande" onClick={onConfirmar}>
            Confirmar pedido por WhatsApp
          </button>
          <button className="boton boton--texto" onClick={onVaciar}>Vaciar carrito</button>
        </aside>
      </div>
    </section>
  );
}
