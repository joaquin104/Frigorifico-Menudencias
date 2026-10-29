  import { useEffect, useState } from "react";

// ===== NUEVO (Pasos 2, 3 y 4): imports de los archivos nuevos =====
import PaginaInicio from './componentes/PaginaInicio.jsx';
import Carrito from './componentes/Carrito.jsx';
import { calcularTotal, validarCarrito, armarMensajePedido, formatearPesos, describirStock } from './carritoUtils.js';
import LoginAdmin from './componentes/LoginAdmin.jsx'; // NUEVO (Paso 4)
import { NUMERO_WHATSAPP } from './datosNegocio.js';
// ===== FIN NUEVO =====

  // Grupos del catálogo, en el orden en que van a aparecer las secciones
const GRUPOS = ['Carne Vacuna', 'Cerdo', 'Achuras', 'Embutidos', 'Menudencias', 'Otros'];

// ===== NUEVO (Paso 1: /admin) =====
// true solo si la dirección del navegador es localhost:5173/admin
const ES_PAGINA_ADMIN = window.location.pathname === '/admin';
// ===== FIN NUEVO =====

  // Recibe la lista de cortes, el texto a buscar y el criterio de orden.
// Retorna una lista NUEVA, filtrada y ordenada. No modifica la original.
function filtrarYOrdenar(cortes, texto, criterio) {
  const textoMinuscula = texto.toLowerCase();

  const filtrados = cortes.filter((corte) =>
    corte.nombre.toLowerCase().includes(textoMinuscula)
  );

  return filtrados.sort((a, b) => {
    if (criterio === 'precio') {
      return a.precio - b.precio;
    }
    return a.nombre.localeCompare(b.nombre);
  });
}

  export default function App() {

  // 🔧 MODIFICADO (Paso 1): antes era useState('inicio')
  const [vistaActual, setVistaActual] = useState(ES_PAGINA_ADMIN ? 'login' : 'inicio');

  const [listaCortes, setListaCortes] = useState([]);
  const [guardando, setGuardando] = useState(false);

  const [nombreCorte, setNombreCorte] = useState('');
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('');
  const [grupo, setGrupo] = useState('Otros');
  const [idEnEdicion, setIdEnEdicion] = useState(null);
  const [datosEdicion, setDatosEdicion] = useState({ nombre: '', precio: 0, stock: 0, grupo: 'Otros' });

  const [usuarioLogueado, setUsuarioLogueado] = useState(null); // { id, nombreUsuario, rol }
  const [nombreUsuarioInput, setNombreUsuarioInput] = useState('');
  const [contrasenaInput, setContrasenaInput] = useState('');
  const [errorLogin, setErrorLogin] = useState('');

  //BUSQUEDA
  const [busqueda, setBusqueda] = useState('');
  const [criterioOrden, setCriterioOrden] = useState('nombre');
  //MODULO USUARIOS
  const [productoAComprar, setProductoAComprar] = useState(null); // producto seleccionado para el modal
  const [cantidadKg, setCantidadKg] = useState('');
  //AVISOS (carteles temporales)
  const [aviso, setAviso] = useState(null);

  const mostrarAviso = (texto, tipo) => {
    setAviso({ texto: texto, tipo: tipo });
    setTimeout(() => setAviso(null), 3000);
  };

  // ===== NUEVO (Paso 2: carrito) =====
  // Cada ítem: { id, nombre, precio, stock, kg }. Las funciones de cálculo están en carritoUtils.js
  const [carrito, setCarrito] = useState([]);

  const agregarAlCarrito = (producto) => {
    const yaEsta = carrito.find((item) => item.id === producto.id);

    if (yaEsta) {
      // Si ya estaba en el carrito, le sumamos 1 Kg
      setCarrito(carrito.map((item) =>
        item.id === producto.id ? { ...item, kg: String((parseFloat(item.kg) || 0) + 1) } : item
      ));
      mostrarAviso(`Se sumó 1 Kg más de ${producto.nombre}`, 'exito');
    } else {
      setCarrito([
        ...carrito,
        { id: producto.id, nombre: producto.nombre, precio: producto.precio, stock: producto.stock, kg: '1' },
      ]);
      mostrarAviso(`${producto.nombre} agregado al carrito`, 'exito');
    }
  };

  const cambiarKgCarrito = (id, nuevoKg) => {
    setCarrito(carrito.map((item) => (item.id === id ? { ...item, kg: nuevoKg } : item)));
  };

  const quitarDelCarrito = (id) => {
    setCarrito(carrito.filter((item) => item.id !== id));
  };

  const confirmarPedido = () => {
    const errores = validarCarrito(carrito);
    if (errores.length > 0) {
      alert(errores.join('\n'));
      return;
    }
    const url = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(armarMensajePedido(carrito))}`;
    window.open(url, '_blank');
  };
  // ===== FIN NUEVO =====

  const abrirModalCompra = (producto) => {
  setProductoAComprar(producto);
  setCantidadKg('');
  };

  const cerrarModalCompra = () => {
  setProductoAComprar(null);
  setCantidadKg('');
  };

  const confirmarCompra = () => {
  const cantidad = parseFloat(cantidadKg);

  if (!cantidad || cantidad <= 0) {
  alert("Ingresá una cantidad válida en Kg");
  return;
  }

  const numeroWhatsapp = "5491158398058"; 

  const mensaje = `Hola! Quiero comprar ${cantidad} Kg de ${productoAComprar.nombre} (precio: $${productoAComprar.precio}/Kg).`;
  const url = `https://wa.me/${numeroWhatsapp}?text=${encodeURIComponent(mensaje)}`;

  window.open(url, '_blank');
  cerrarModalCompra();
  };

  const manejarLogin = async (e) => {
  e.preventDefault();
  setErrorLogin('');

  try {
  const respuesta = await fetch("http://localhost:5079/api/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    nombreUsuario: nombreUsuarioInput,
    contrasena: contrasenaInput
  })
  });

  if (respuesta.ok) {
  const datos = await respuesta.json();

  // ===== NUEVO (Paso 4) =====
  // En /admin solo pueden entrar cuentas con rol 'admin'
  if (ES_PAGINA_ADMIN && datos.rol !== 'admin') {
    setErrorLogin('Esta cuenta no tiene permisos de administrador');
    return;
  }
  // ===== FIN NUEVO =====

  setUsuarioLogueado(datos);
  // 🔧 MODIFICADO (Paso 4): antes siempre iba a 'inicio'. En /admin va directo a la lista de productos
  setVistaActual(ES_PAGINA_ADMIN ? 'catalogo' : 'inicio');
  setNombreUsuarioInput('');
  setContrasenaInput('');
  } else {
  setErrorLogin('Usuario o contraseña incorrectos');
  }
  } catch (error) {
  console.error("Error de conexión con el servidor:", error);
  setErrorLogin('Error de conexión con el servidor');
  }
  };

  const cerrarSesion = () => {
  setUsuarioLogueado(null);
  setVistaActual('inicio');
  };

  useEffect(() => {
  const cargarCatalogo = async () => {
  try {
  const respuesta = await fetch("http://localhost:5079/api/cortes");
  if (respuesta.ok) {
    const datos = await respuesta.json();
    setListaCortes(datos); // Mete los datos de la base de datos en la pantalla
  }
  } catch (error) {
  console.error("Error al cargar el catálogo:", error);
  }
  };

  cargarCatalogo(); // Ejecutamos la función
  }, []); // 👈 Estos corchetes vacíos son vitales: le dicen a React que lo haga UNA SOLA VEZ al iniciar.
  
  const guardarProducto = async (e) => {
  e.preventDefault()

  // VALIDAMOS: campos obligatorios
  // Comparamos con '' en vez de usar !precio o !stock, porque en JavaScript
  // el número 0 se considera "falso" (!0 da true), y un stock en 0 es un
  // valor válido (significa "sin stock", no "campo vacío").
  if (nombreCorte.trim() === '' || precio === '' || stock === '') {
    alert("Error: Todos los campos son obligatorios");
    return;
  }

  const precioNumero = parseFloat(precio);
  const stockNumero = parseInt(stock);

  // VALIDAMOS: que se hayan podido convertir a número
  // (parseFloat/parseInt devuelven NaN si el texto no es un número válido)
  if (isNaN(precioNumero) || isNaN(stockNumero)) {
    alert("Error: Precio y stock tienen que ser números válidos");
    return;
  }

  // VALIDAMOS: rangos razonables
  if (precioNumero <= 0 || precioNumero > 999999) {
    alert("Error: El precio tiene que estar entre 0 y 999999");
    return;
  }

  if (stockNumero < 0 || stockNumero > 100000) {
    alert("Error: El stock tiene que estar entre 0 y 100000");
    return;
  }

  //ARMAMOS
  const nuevoProducto = {
    nombre: nombreCorte,
    precio: precioNumero,
    stock: stockNumero,
    grupo: grupo,
  }
  setGuardando(true);

  try {
    const respuesta = await fetch("http://localhost:5079/api/cortes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevoProducto)
    });

    
    if (respuesta.ok) {
      
      const datos = await respuesta.json();
      const productoConId = { ...nuevoProducto, id: datos.id };

      console.log("Corte enviado con éxito al Backend!");
      setListaCortes([...listaCortes, productoConId]);

      setNombreCorte('');
      setPrecio('');
      setStock('');
      setGrupo('Otros');
      mostrarAviso(`Producto "${nuevoProducto.nombre}" guardado correctamente`, 'exito');
    } else if (respuesta.status === 400) {
      // El backend (función ValidarCorte) encontró algún problema
      const datosError = await respuesta.json();
      alert("No se pudo guardar:\n" + datosError.errores.join("\n"));
    } else {
      console.error("Hubo un error al guardar el corte.")
      mostrarAviso('No se pudo guardar el producto. Intentá de nuevo.', 'error'); 
    }
  } catch (error) {
    console.error("Error: Hubo un error de conexion con la API: ", error);
    mostrarAviso('No hay conexión con el servidor.', 'error');       
  } finally {
    setGuardando(false);
  }
};

  const eliminarCorte = async (id) => {
  // Preguntamos por las dudas antes de borrar
  if (!window.confirm("¿Estás seguro de que querés eliminar este corte?")) return;

  try {
    const respuesta = await fetch(`http://localhost:5079/api/cortes/${id}`, {
        method: 'DELETE',
    });

    if (respuesta.ok) {
        // CORRECCIÓN: Usamos las variables reales de tu estado (setListaCortes y listaCortes)
        setListaCortes(listaCortes.filter(corte => corte.id !== id));
        console.log("Corte eliminado con éxito");
        mostrarAviso('Producto eliminado correctamente', 'exito');   
    } else {
        console.error("Error al eliminar el corte en la base de datos");
        mostrarAviso('No se pudo eliminar el producto. Intentá de nuevo.', 'error');
    }
  } catch (error) {
    console.error("Error de conexión con el servidor:", error);
    mostrarAviso('No hay conexión con el servidor.', 'error');  
  }
  };

  const guardarEdicion = async (id) => {
  const precioNumero = parseFloat(datosEdicion.precio);
  const stockNumero = parseInt(datosEdicion.stock);

  // Mismas validaciones que en el alta: el usuario puede haber
  // tocado estos campos y escrito cualquier cosa
  if (isNaN(precioNumero) || isNaN(stockNumero)) {
    alert("Error: Precio y stock tienen que ser números válidos");
    return;
  }

  if (precioNumero <= 0 || precioNumero > 999999) {
    alert("Error: El precio tiene que estar entre 0 y 999999");
    return;
  }

  if (stockNumero < 0 || stockNumero > 100000) {
    alert("Error: El stock tiene que estar entre 0 y 100000");
    return;
  }

  // Armamos el objeto a enviar con los valores ya convertidos a número
  const datosAEnviar = { ...datosEdicion, precio: precioNumero, stock: stockNumero };

  try {
    const respuesta = await fetch(`http://localhost:5079/api/cortes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosAEnviar)
    });

    if (respuesta.ok) {
        const listaActualizada = listaCortes.map(corte => 
            corte.id === id ? { ...corte, ...datosAEnviar } : corte
        );
        setListaCortes(listaActualizada);
        setIdEnEdicion(null);
        console.log("Corte actualizado con éxito");
    } else if (respuesta.status === 400) {
        const datosError = await respuesta.json();
        alert("No se pudo guardar:\n" + datosError.errores.join("\n"));
    } else {
        console.error("Error al intentar actualizar el corte");
    }
  } catch (error) {
    console.error("Error de conexión con el servidor:", error);
  }
};

  const iniciarEdicion = (corte) => {
  // 1. Le decimos a React qué ID se va a editar
  setIdEnEdicion(corte.id);
  // 2. Precargamos los datos actuales del corte en nuestra memoria temporal para que los casilleros no aparezcan vacíos
  setDatosEdicion({ nombre: corte.nombre, precio: corte.precio, stock: corte.stock, grupo: corte.grupo });
  };



// Filtra por texto y ordena. La lógica está en filtrarYOrdenar (arriba del componente)
const cortesFiltrados = filtrarYOrdenar(listaCortes, busqueda, criterioOrden);



// ===== NUEVO (Paso 4: diseño) =====
// Qué pantalla se dibuja. En /admin, si no hay sesión iniciada, SIEMPRE es el login,
// aunque vistaActual diga otra cosa. Esta línea es la que impide ver el catálogo sin iniciar sesión.
const vista = ES_PAGINA_ADMIN && !usuarioLogueado ? 'login' : vistaActual;

// Recibe el nombre de una pantalla y retorna las clases CSS del botón del menú
// (agrega "barra__link--activo" al botón de la pantalla en la que estamos).
const claseLink = (nombrePantalla) =>
  vista === nombrePantalla ? 'barra__link barra__link--activo' : 'barra__link';
// ===== FIN NUEVO =====

  return (
  <div className={ES_PAGINA_ADMIN ? 'sitio sitio--admin' : 'sitio'}>

  {/* ===== 🔧 MODIFICADO (Paso 4: diseño) =====
      Todo este return se rehízo: los estilos pasaron de style={{...}} a clases de estilos.css.
      La lógica (funciones y useState de arriba) NO cambió. */}

  {/* LOGIN: solo existe en /admin. Pantalla completa y centrada, sin menú ni catálogo. */}
  {vista === 'login' && (
    <LoginAdmin
      usuario={nombreUsuarioInput}
      contrasena={contrasenaInput}
      onCambiarUsuario={setNombreUsuarioInput}
      onCambiarContrasena={setContrasenaInput}
      error={errorLogin}
      onSubmit={manejarLogin}
    />
  )}

  {/* Todo lo demás (menú y pantallas) solo se dibuja cuando NO estamos en el login */}
  {vista !== 'login' && (
  <>
  <header className={ES_PAGINA_ADMIN ? 'barra barra--admin' : 'barra'}>
    <div className="barra__interior">
      <button
        className="barra__marca"
        aria-label="Frigorífico Menudencias, ir al inicio"
        onClick={() => setVistaActual(ES_PAGINA_ADMIN ? 'catalogo' : 'inicio')}
      >
        <span className="barra__logo" />
      </button>
      {ES_PAGINA_ADMIN && <span className="barra__rotulo">Panel de administración</span>}

      <nav className="barra__menu" aria-label="Principal">
        {/* Menú del CLIENTE (nunca tiene "Iniciar sesión") */}
        {!ES_PAGINA_ADMIN && (
          <>
            <button className={claseLink('inicio')} onClick={() => setVistaActual('inicio')}>Inicio</button>
            <button className={claseLink('catalogo')} onClick={() => setVistaActual('catalogo')}>Catálogo</button>
            <button className={claseLink('carrito')} onClick={() => setVistaActual('carrito')}>
              Carrito
              {carrito.length > 0 && <span className="barra__contador">{carrito.length}</span>}
            </button>
          </>
        )}

        {/* Menú del ADMINISTRADOR (solo en /admin y con sesión iniciada) */}
        {ES_PAGINA_ADMIN && usuarioLogueado?.rol === 'admin' && (
          <>
            <button className={claseLink('catalogo')} onClick={() => setVistaActual('catalogo')}>Productos</button>
            <button className={claseLink('abm')} onClick={() => setVistaActual('abm')}>Nuevo producto</button>
          </>
        )}
      </nav>

      {usuarioLogueado && (
        <div className="barra__sesion">
          <span>Hola, {usuarioLogueado.nombreUsuario}</span>
          <button className="boton boton--contorno boton--chico" onClick={cerrarSesion}>Cerrar sesión</button>
        </div>
      )}
    </div>
  </header>

  <main>
  {/* Inicio del cliente (hero, cómo pedir, historia y contacto) */}
  {vista === 'inicio' && !ES_PAGINA_ADMIN && (
    <PaginaInicio onVerCatalogo={() => setVistaActual('catalogo')} />
  )}

  {/* Alta de producto (solo admin) */}
  {vista === 'abm' && (
    <section className="contenedor contenedor--angosto seccion">
      <div className="encabezado-pagina">
        <h2 className="titulo-pagina">Nuevo producto</h2>
        <p className="subtitulo">Aparece en el catálogo dentro del grupo que elijas.</p>
      </div>
      <form onSubmit={guardarProducto} className="formulario">

        <div className="campo">
          <label htmlFor="alta-nombre">Nombre del corte</label>
          <input
            id="alta-nombre"
            type="text"
            value={nombreCorte}
            onChange={(e) => setNombreCorte(e.target.value)}
          />
        </div>

        <div className="campos-fila">
          <div className="campo">
            <label htmlFor="alta-precio">Precio por kg ($)</label>
            <input
              id="alta-precio"
              type="number"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
            />
          </div>

          <div className="campo">
            <label htmlFor="alta-stock">Stock (kg)</label>
            <input
              id="alta-stock"
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />
          </div>
        </div>

        <div className="campo">
          <label htmlFor="alta-grupo">Grupo</label>
          <select id="alta-grupo" value={grupo} onChange={(e) => setGrupo(e.target.value)}>
            {GRUPOS.map((nombreGrupo) => (
              <option key={nombreGrupo} value={nombreGrupo}>{nombreGrupo}</option>
            ))}
          </select>
        </div>

        <button type="submit" disabled={guardando} className="boton boton--principal boton--bloque boton--grande">
          {guardando ? 'Guardando…' : 'Guardar producto'}
        </button>
      </form>
    </section>
  )}

  {/* Carrito (cliente) */}
  {vista === 'carrito' && (
    <Carrito
      carrito={carrito}
      total={calcularTotal(carrito)}
      onCambiarKg={cambiarKgCarrito}
      onQuitar={quitarDelCarrito}
      onVaciar={() => setCarrito([])}
      onConfirmar={confirmarPedido}
      onVerCatalogo={() => setVistaActual('catalogo')}
    />
  )}

  {/* Catálogo: para el cliente es el catálogo; para el admin es la lista "Productos" (editar y eliminar) */}
  {vista === 'catalogo' && (
    <section className="contenedor seccion">
      <div className="encabezado-pagina">
        <h2 className="titulo-pagina">{ES_PAGINA_ADMIN ? 'Productos' : 'Catálogo'}</h2>
        <p className="subtitulo">
          {ES_PAGINA_ADMIN
            ? 'Editá precios y stock, o eliminá lo que ya no vendés.'
            : 'Elegí los cortes y armá tu pedido. Los precios son por kilo.'}
        </p>
      </div>

      <div className="herramientas">
        <div className="buscador">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nombre…"
            aria-label="Buscar por nombre"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <select className="selector" aria-label="Ordenar" value={criterioOrden} onChange={(e) => setCriterioOrden(e.target.value)}>
          <option value="nombre">Ordenar: A-Z</option>
          <option value="precio">Ordenar: Precio</option>
        </select>
      </div>

      {cortesFiltrados.length === 0 ? (
        <div className="vacio">
          {listaCortes.length === 0
            ? 'No hay cortes registrados todavía.'
            : `Ningún producto coincide con “${busqueda}”. Probá con otra palabra.`}
        </div>
      ) : (
        GRUPOS.map((nombreGrupo) => {
          const cortesDelGrupo = cortesFiltrados.filter((corte) => corte.grupo === nombreGrupo);

          if (cortesDelGrupo.length === 0) return null;

          return (
            <section key={nombreGrupo} className="grupo">
              <h3 className="grupo__titulo">
                {nombreGrupo}
                <span className="grupo__cantidad">{cortesDelGrupo.length} {cortesDelGrupo.length === 1 ? 'producto' : 'productos'}</span>
              </h3>

              <div className="grilla">
                {cortesDelGrupo.map((producto) => (
                  <article key={producto.id} className={idEnEdicion === producto.id ? 'producto producto--edicion' : 'producto'}>
                    {idEnEdicion === producto.id ? (
                      // === MODO EDICIÓN (Casilleros) ===
                      <>
                        <div className="campo">
                          <label htmlFor="editar-nombre">Nombre</label>
                          <input
                            id="editar-nombre"
                            type="text"
                            value={datosEdicion.nombre}
                            onChange={(e) => setDatosEdicion({ ...datosEdicion, nombre: e.target.value })}
                          />
                        </div>
                        <div className="campos-fila">
                          <div className="campo">
                            <label htmlFor="editar-precio">Precio por kg ($)</label>
                            <input
                              id="editar-precio"
                              type="number"
                              value={datosEdicion.precio}
                              onChange={(e) => setDatosEdicion({ ...datosEdicion, precio: e.target.value })}
                            />
                          </div>
                          <div className="campo">
                            <label htmlFor="editar-stock">Stock (kg)</label>
                            <input
                              id="editar-stock"
                              type="number"
                              value={datosEdicion.stock}
                              onChange={(e) => setDatosEdicion({ ...datosEdicion, stock: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="campo">
                          <label htmlFor="editar-grupo">Grupo</label>
                          <select
                            id="editar-grupo"
                            value={datosEdicion.grupo}
                            onChange={(e) => setDatosEdicion({ ...datosEdicion, grupo: e.target.value })}
                          >
                            {GRUPOS.map((g) => (
                              <option key={g} value={g}>{g}</option>
                            ))}
                          </select>
                        </div>
                        <div className="producto__acciones">
                          <button className="boton boton--principal" onClick={() => guardarEdicion(producto.id)}>
                            Guardar
                          </button>
                          <button className="boton boton--suave" onClick={() => setIdEnEdicion(null)}>
                            Cancelar
                          </button>
                        </div>
                      </>
                    ) : (
                      // === MODO LECTURA ===
                      <>
                        <h4 className="producto__nombre">{producto.nombre}</h4>
                        <p className="producto__precio">
                          <strong>${formatearPesos(producto.precio)}</strong>
                          <span>por kg</span>
                        </p>
                        <p className={`stock stock--${describirStock(producto.stock).nivel}`}>
                          {describirStock(producto.stock).texto}
                        </p>

                        <div className="producto__acciones">
                          {/* Cliente: agregar al carrito */}
                          {!ES_PAGINA_ADMIN && (
                            <button
                              className="boton boton--principal"
                              onClick={() => agregarAlCarrito(producto)}
                              disabled={producto.stock <= 0}
                            >
                              {producto.stock <= 0 ? 'Sin stock' : 'Agregar al carrito'}
                            </button>
                          )}

                          {/* Admin: editar y eliminar */}
                          {ES_PAGINA_ADMIN && usuarioLogueado?.rol === 'admin' && (
                            <>
                              <button className="boton boton--suave" onClick={() => iniciarEdicion(producto)}>
                                Editar
                              </button>
                              <button className="boton boton--peligro" onClick={() => eliminarCorte(producto.id)}>
                                Eliminar
                              </button>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </article>
                ))}
              </div>
            </section>
          );
        })
      )}
    </section>
  )}
  </main>
  </>
  )}

  {/* Cartel temporal (toast) */}
  {aviso && (
    <div className={`aviso ${aviso.tipo === 'exito' ? 'aviso--exito' : 'aviso--error'}`} role="status">
      {aviso.texto}
    </div>
  )}
  {/* ===== FIN MODIFICADO (Paso 4) ===== */}
  </div>
  )
  }
