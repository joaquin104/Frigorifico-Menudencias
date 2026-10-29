// ===== ARCHIVO NUEVO (Paso 4: pantalla de login del panel /admin) =====
// Componente "de presentación": dibuja el formulario y avisa por props lo que pasa.
// La lógica (manejarLogin y los useState de usuario/contraseña) sigue en App.jsx.
// Se ve SOLO en localhost:5173/admin, y ocupa toda la pantalla, centrado, sin menú.

export default function LoginAdmin({ usuario, contrasena, onCambiarUsuario, onCambiarContrasena, error, onSubmit }) {
  return (
    <div className="login">
      <form className="login__tarjeta" onSubmit={onSubmit}>
        <p className="login__marca">Menudencias</p>
        <h1 className="login__titulo">Panel de administración</h1>
        <p className="login__ayuda">Ingresá con tu usuario para gestionar los productos.</p>

        <div className="campo">
          <label htmlFor="login-usuario">Usuario</label>
          <input
            id="login-usuario"
            type="text"
            value={usuario}
            onChange={(e) => onCambiarUsuario(e.target.value)}
            autoComplete="username"
            autoFocus
          />
        </div>

        <div className="campo">
          <label htmlFor="login-contrasena">Contraseña</label>
          <input
            id="login-contrasena"
            type="password"
            value={contrasena}
            onChange={(e) => onCambiarContrasena(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        {error && <p className="login__error" role="alert">{error}</p>}

        <button type="submit" className="boton boton--principal boton--bloque boton--grande">Ingresar</button>
      </form>

      <a className="login__volver" href="/">Ir al sitio de clientes</a>
    </div>
  );
}
