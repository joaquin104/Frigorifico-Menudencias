  import { useEffect, useState } from "react";

  // Grupos del catálogo, en el orden en que van a aparecer las secciones
const GRUPOS = ['Carne Vacuna', 'Cerdo', 'Achuras', 'Embutidos', 'Menudencias', 'Otros'];

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

  const [vistaActual, setVistaActual] = useState('inicio');

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
  setUsuarioLogueado(datos);
  setVistaActual('inicio'); // lo mandamos al inicio ya logueado
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
    } else if (respuesta.status === 400) {
      // El backend (función ValidarCorte) encontró algún problema
      const datosError = await respuesta.json();
      alert("No se pudo guardar:\n" + datosError.errores.join("\n"));
    } else {
      console.error("Hubo un error al guardar el corte.")
    }
  } catch (error) {
    console.error("Error: Hubo un error de conexion con la API: ", error);
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
    } else {
        console.error("Error al eliminar el corte en la base de datos");
    }
  } catch (error) {
    console.error("Error de conexión con el servidor:", error);
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
const cortesFiltrados = filtrarYOrdenar(listaCortes, busqueda, criterioOrden);;



  return (
  <div style={{ padding: '20px' }}>

  <nav style={{ marginBottom: '20px', borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>
    <button onClick={() => setVistaActual('inicio')} style={{ marginRight: '10px' }}>Inicio</button>
    <button onClick={() => setVistaActual('catalogo')} style={{ marginRight: '10px' }}>Catalogo</button>

    {usuarioLogueado?.rol === 'admin' && (
      <button onClick={() => setVistaActual('abm')} style={{ marginRight: '10px' }}>ABM</button>
    )}

    {usuarioLogueado ? (
      <span style={{ float: 'right' }}>
        Hola, {usuarioLogueado.nombreUsuario} ({usuarioLogueado.rol})
        <button onClick={cerrarSesion} style={{ marginLeft: '10px' }}>Cerrar sesión</button>
      </span>
    ) : (
      <button onClick={() => setVistaActual('login')} style={{ float: 'right' }}>Iniciar sesión</button>
    )}
  </nav>

  {vistaActual === 'inicio' && (
    <div>
      <img src="/logo.png" alt="Logo menudencias" style={{ width: '350px', marginBottom: '5px' }}/>
      <h2>Bienvenido al Frigorífico Menudencias</h2>
      <p>Navegue por el menú para gestionar el sistema.</p>
    </div>
  )}

              {vistaActual === 'login' && (
                <div>
                  <h2>Iniciar sesión</h2>
                  <form onSubmit={manejarLogin} style={{ display: 'flex', flexDirection: 'column', maxWidth: '300px' }}>
                    <label>Usuario:</label>
                    <input
                      type="text"
                      value={nombreUsuarioInput}
                      onChange={(e) => setNombreUsuarioInput(e.target.value)}
                      style={{ marginBottom: '10px' }}
                    />

                    <label>Contraseña:</label>
                    <input
                      type="password"
                      value={contrasenaInput}
                      onChange={(e) => setContrasenaInput(e.target.value)}
                      style={{ marginBottom: '15px' }}
                    />

                    {errorLogin && <p style={{ color: 'red' }}>{errorLogin}</p>}

                    <button type="submit">Ingresar</button>
                  </form>
                </div>
              )}
  {vistaActual === 'abm' && (
    <div>
      <h2>Alta de Nuevo Corte</h2>
      <form onSubmit={guardarProducto} style={{ display: 'flex', flexDirection: 'column', maxWidth: '300px' }}>
        
        <label>Nombre del corte:</label>
        <input 
          type="text" 
          value={nombreCorte} 
          onChange={(e) => setNombreCorte(e.target.value)} 
          style={{ marginBottom: '10px' }}
        />
        
        <label>Precio por Kg:</label>
        <input 
          type="number" 
          value={precio} 
          onChange={(e) => setPrecio(e.target.value)} 
          style={{ marginBottom: '10px' }}
        />

        <label>Stock disponible:</label>
        <input 
          type="number" 
          value={stock} 
          onChange={(e) => setStock(e.target.value)} 
          style={{ marginBottom: '15px' }}
        />
        <label>Grupo / Categoría:</label>
                      <select
                        value={grupo}
                        onChange={(e) => setGrupo(e.target.value)}
                        style={{ marginBottom: '15px' }}
                      >
                        <option value="Carne Vacuna">Carne Vacuna</option>
                        <option value="Cerdo">Cerdo</option>
                        <option value="Achuras">Achuras</option>
                        <option value="Embutidos">Embutidos</option>
                        <option value="Menudencias">Menudencias</option>
                        <option value="Otros">Otros</option>
                      </select>
        <button type="submit">Guardar Producto</button>
      </form>
    </div>
  )}


        {vistaActual === 'catalogo' && (
    <div>
      <h2>Catálogo de Productos</h2>
      <div style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ flex: 1 }}
          />

          <select value={criterioOrden} onChange={(e) => setCriterioOrden(e.target.value)}>
            <option value="nombre">Ordenar: A-Z</option>
            <option value="precio">Ordenar: Precio</option>
          </select>
        </div>
      {cortesFiltrados.length === 0 ? (
        <p>No hay cortes registrados todavía.</p>
      ) : (
        
         GRUPOS.map((nombreGrupo) => {
    const cortesDelGrupo = cortesFiltrados.filter((corte) => corte.grupo === nombreGrupo);

    if (cortesDelGrupo.length === 0) return null;

    return (
      <div key={nombreGrupo}>
        <h3>{nombreGrupo}</h3>
        <ul>
          {cortesDelGrupo.map((producto) => (
            <li key={producto.id} style={{ marginBottom: '15px' }}>
              {idEnEdicion === producto.id ? (
                // === MODO EDICIÓN (Casilleros) ===
                <div style={{ display: 'inline-block' }}>
                  <input
                    type="text"
                    value={datosEdicion.nombre}
                    onChange={(e) => setDatosEdicion({ ...datosEdicion, nombre: e.target.value })}
                    style={{ width: '120px', marginRight: '5px' }}
                  />
                  $<input
                    type="number"
                    value={datosEdicion.precio}
                    onChange={(e) => setDatosEdicion({ ...datosEdicion, precio: e.target.value })}
                    style={{ width: '70px', marginRight: '5px' }}
                  />
                  Stock: <input
                    type="number"
                    value={datosEdicion.stock}
                    onChange={(e) => setDatosEdicion({ ...datosEdicion, stock: e.target.value })}
                    style={{ width: '60px', marginRight: '10px' }}
                  />
                  <select
                      value={datosEdicion.grupo}
                      onChange={(e) => setDatosEdicion({ ...datosEdicion, grupo: e.target.value })}
                      style={{ marginRight: '10px' }}
                    >
                      <option value="Carne Vacuna">Carne Vacuna</option>
                      <option value="Cerdo">Cerdo</option>
                      <option value="Achuras">Achuras</option>
                      <option value="Embutidos">Embutidos</option>
                      <option value="Menudencias">Menudencias</option>
                      <option value="Otros">Otros</option>
                    </select>
                  <button onClick={() => guardarEdicion(producto.id)}
                    style={{ backgroundColor: '#28a745', color: 'white', padding: '5px 10px', borderRadius: '5px', border: 'none', cursor: 'pointer' }}
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => setIdEnEdicion(null)}
                    style={{ backgroundColor: '#6c757d', color: 'white', marginLeft: '5px', padding: '5px 10px', borderRadius: '5px', border: 'none', cursor: 'pointer' }}
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                // === MODO LECTURA (Texto normal) ===
                <div style={{ display: 'inline-block' }}>
                  <strong>{producto.nombre}</strong> - ${producto.precio} /Kg (Stock: {producto.stock})


                  <button
                    onClick={() => abrirModalCompra(producto)}
                    style={{ backgroundColor: '#25D366', color: 'white', marginLeft: '15px', padding: '5px 10px', borderRadius: '5px', border: 'none', cursor: 'pointer' }}
                  >
                    Comprar
                  </button>

                  {usuarioLogueado?.rol === 'admin' && (
                    <>
                      <button
                        onClick={() => eliminarCorte(producto.id)}
                        style={{ backgroundColor: '#ff4d4d', color: 'white', marginLeft: '15px', padding: '5px 10px', borderRadius: '5px', border: 'none', cursor: 'pointer' }}
                      >
                        Eliminar
                      </button>
                      <button
                        onClick={() => iniciarEdicion(producto)}
                        style={{ backgroundColor: '#00cc33', color: 'white', marginLeft: '5px', padding: '5px 10px', borderRadius: '5px', border: 'none', cursor: 'pointer' }}
                      >
                        Editar
                      </button>
                    </>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
        </div>
    );
         })
      )}
    </div>
  )}

  {productoAComprar && (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '300px' }}>
        <h3>Comprar {productoAComprar.nombre}</h3>
        <p>Precio: ${productoAComprar.precio} / Kg</p>

        <label>Cantidad (Kg):</label>
        <input
          type="number"
          value={cantidadKg}
          onChange={(e) => setCantidadKg(e.target.value)}
          style={{ width: '100%', marginTop: '5px', marginBottom: '15px' }}
          autoFocus
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={cerrarModalCompra} style={{ padding: '5px 10px' }}>Cancelar</button>
          <button
            onClick={confirmarCompra}
            style={{ backgroundColor: '#25D366', color: 'white', padding: '5px 10px', borderRadius: '5px', border: 'none' }}
          >
            Confirmar por WhatsApp
          </button>
        </div>
      </div>
    </div>
  )}
  </div>
  )
  }