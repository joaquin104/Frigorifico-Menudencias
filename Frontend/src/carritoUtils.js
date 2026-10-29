// ===== ARCHIVO NUEVO (Paso 2: carrito) =====
// Funciones "puras" del carrito: RECIBEN el carrito y RETORNAN un valor.
// No usan estado de React ni tocan la pantalla.
// Cada ítem del carrito tiene esta forma: { id, nombre, precio, stock, kg }
// (kg se guarda como TEXTO, igual que cantidadKg, porque viene de un <input>).

// Recibe el carrito y retorna el total en pesos (un número).
export function calcularTotal(carrito) {
  return carrito.reduce((suma, item) => suma + item.precio * (parseFloat(item.kg) || 0), 0);
}

// Recibe el carrito y retorna una lista de errores (vacía = el pedido es válido).
// Es el equivalente en el frontend de ValidarCorte del backend.
export function validarCarrito(carrito) {
  const errores = [];

  if (carrito.length === 0) {
    errores.push('El carrito está vacío.');
    return errores;
  }

  carrito.forEach((item) => {
    const kg = parseFloat(item.kg);
    if (isNaN(kg) || kg <= 0) {
      errores.push(`Ingresá una cantidad mayor a 0 para ${item.nombre}.`);
    } else if (kg > item.stock) {
      errores.push(`De ${item.nombre} solo hay ${item.stock} Kg disponibles.`);
    }
  });

  return errores;
}

// Recibe el carrito y retorna el texto del pedido que se manda por WhatsApp.
export function armarMensajePedido(carrito) {
  const formato = { maximumFractionDigits: 2 };

  const lineas = carrito.map((item) => {
    const kg = parseFloat(item.kg);
    const subtotal = item.precio * kg;
    return `- ${kg} Kg de ${item.nombre} ($${item.precio}/Kg) = $${subtotal.toLocaleString('es-AR', formato)}`;
  });

  return (
    'Hola! Quiero hacer el siguiente pedido:\n\n' +
    lineas.join('\n') +
    `\n\nTotal estimado: $${calcularTotal(carrito).toLocaleString('es-AR', formato)}`
  );
}

// ===== NUEVO (Paso 4: diseño) =====
// Recibe un número y retorna el texto con el formato de pesos argentino (10990 -> "10.990").
export function formatearPesos(numero) {
  return numero.toLocaleString('es-AR', { maximumFractionDigits: 2 });
}

// Recibe el stock de un producto y retorna cómo mostrarlo:
// { texto: 'Últimos 3 kg', nivel: 'bajo' }. El nivel ('agotado', 'bajo' o 'normal')
// se usa para elegir el color en estilos.css (stock--agotado, stock--bajo).
export function describirStock(stock) {
  if (stock <= 0) return { texto: 'Sin stock', nivel: 'agotado' };
  if (stock <= 5) return { texto: `Últimos ${stock} kg`, nivel: 'bajo' };
  return { texto: `${stock} kg disponibles`, nivel: 'normal' };
}
// ===== FIN NUEVO =====
