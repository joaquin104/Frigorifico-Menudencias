import { useEffect, useState } from "react";


export default function App() {

const [vistaActual, setVistaActual] = useState('inicio');

const [listaCortes, setListaCortes] = useState([]);
const [guardando, setGuardando] = useState(false);

const [nombreCorte, setNombreCorte] = useState('');
const [precio, setPrecio] = useState('');
const [stock, setStock] = useState('');

/*useEffect(() => {
    // Convierte el array a texto y lo guarda en el navegador
    localStorage.setItem('cortes_memoria', JSON.stringify(listaCortes))
  }, [listaCortes]) // El array de dependencias indica que solo se ejecuta cuando listaCortes cambia
//Guardamos todos en esta constate para que se ejecute todo a la vez*/
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
  id: Date.now(), //generam0os un id unico
  nombre: nombreCorte,
  precio: parseFloat(precio),
  stock: parseInt(stock),
}
setGuardando(true); //bloqueamos el boton

try {
    const respuesta = await fetch("http://localhost:5079/api/Cortes", {
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
                <li key={producto.id}>
                  <strong>{producto.nombre}</strong> - ${producto.precio} /Kg (Stock: {producto.stock})
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
