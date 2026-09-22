import { useEffect, useState } from "react";


export default function App() {

const [vistaActual, setVistaActual] = useState('inicio');

const [listaCortes, setListaCortes] = useState([]);
const [guardando, setGuardando] = useState(false);

const [nombreCorte, setNombreCorte] = useState('');
const [precio, setPrecio] = useState('');
const [stock, setStock] = useState('');
const [idEnEdicion, setIdEnEdicion] = useState(null);
const [datosEdicion, setDatosEdicion] = useState({ nombre: '', precio: 0, stock: 0 });

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

  //VALIDAMOS
  if (!nombreCorte || !precio || !stock) {
    alert("Error: Todos los campos son obligatorios")
    return;
  }

  //ARMAMOS
const nuevoProducto = {
  nombre: nombreCorte,
  precio: parseFloat(precio),
  stock: parseInt(stock),
}
setGuardando(true); //bloqueamos el boton

try {
    const respuesta = await fetch("http://localhost:5079/api/cortes", {
      method: "POST", //Le decimos que vamos a enviar datos
      headers: {
        "Content-Type": "application/json" // Le avisamos que mandamos formato JSON
      },
      // Aca 'nuevoCorte' tiene que ser el objeto de React que armaste con nombre, precio y stock
      body: JSON.stringify(nuevoProducto)
    });
    if (respuesta.ok) {
      console.log("Corte enviado con exito al Backend!");
      //Aca podemos limpiar los campos del formulario
      setListaCortes([...listaCortes, nuevoProducto])
/*Esta linea utiliza una característica de JavaScript llamada Spread Operator (el operador de propagación, representado por los tres puntos ...).
En lenguaje coloquial, esa línea le dice a React: "Creá una lista nueva, volcá adentro todo lo que ya teníamos guardado, y meté este producto nuevo al final".*/
      setNombreCorte('')
      setPrecio('')
      setStock('')
//li mpieza
//objeto del nuevo producto
    } else {
      console.error("Hubo un error al guardar el corte.")
    }
  } catch (error) {
    console.error("Error: Hubo un error de conexion con la API: ", error);
  } finally {
  setGuardando(false); //DESBLOQUEAMOS EL BOTÓN (falle o tenga éxito)
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
    try {
        // 1. Enviamos los datos actualizados a C#
        const respuesta = await fetch(`http://localhost:5079/api/cortes/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosEdicion)
        });

        if (respuesta.ok) {
            // 2. Actualizamos la lista visualmente buscando el ID que cambió
            const listaActualizada = listaCortes.map(corte => 
                corte.id === id ? { ...corte, ...datosEdicion } : corte
            );
            setListaCortes(listaActualizada);
            
            // 3. Cerramos el modo edición
            setIdEnEdicion(null);
            console.log("Corte actualizado con éxito");
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
    setDatosEdicion({ nombre: corte.nombre, precio: corte.precio, stock: corte.stock });
};



/*const validarDatos() {

}*/



  return (
<div style={{ padding: '20px' }}>

      <nav style={{ marginBottom: '20px', borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>
        <button onClick={() => setVistaActual('inicio')} style={{ marginRight: '10px' }}>Inicio</button>
        <button onClick={() => setVistaActual('abm')} style={{ marginRight: '10px' }}>ABM</button>
        <button onClick={() => setVistaActual('catalogo')}>Catalogo</button>
      </nav>

    
      {vistaActual === 'inicio' && (
        <div>
          <img src="/logo.png" alt="Logo menudencias" style={{ width: '350px', marginBottom: '5px' }}/>
          <h2>Bienvenido al Frigorífico Menudencias</h2>
          <p>Navegue por el menú para gestionar el sistema.</p>
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
            
            <button type="submit">Guardar Producto</button>
          </form>
        </div>
      )}


      {vistaActual === 'catalogo' && (
        <div>
          <h2>Catálogo de Productos</h2>
          {listaCortes.length === 0 ? (
            <p>No hay cortes registrados todavía.</p>
          ) : (
            <ul>
              {listaCortes.map((producto) => (
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
        </div>
          )}
          </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
