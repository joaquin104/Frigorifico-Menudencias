using Npgsql;
using Backend.Models;

var builder = WebApplication.CreateBuilder(args);

// Obtenemos la cadena de conexión desde el appsettings.json
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// Agregamos el servicio de CORS ANTES de construir la app
builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirReact", policy =>
    {
        policy.WithOrigins("http://localhost:5173") // La dirección exacta de tu React
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});
var builderApp = builder.Build();

// Le decimos a la app que use esa política DESPUÉS del Build
builderApp.UseCors("PermitirReact");

// ============================================================
// FUNCIÓN DE VALIDACIÓN
// RECIBE un Corte (parámetro) y RETORNA una lista de errores (valor de vuelta).
// Si la lista viene vacía, el corte es válido.
// ============================================================
static List<string> ValidarCorte(Corte corte)
{
    var errores = new List<string>();

    if (string.IsNullOrWhiteSpace(corte.Nombre))
    {
        errores.Add("El nombre es obligatorio.");
    }
    else if (corte.Nombre.Length > 100)
    {
        errores.Add("El nombre no puede tener más de 100 caracteres.");
    }

    if (corte.Precio <= 0)
    {
        errores.Add("El precio debe ser mayor a 0.");
    }
    else if (corte.Precio > 999999)
    {
        errores.Add("El precio ingresado es demasiado alto.");
    }

    if (corte.Stock < 0)
    {
        errores.Add("El stock no puede ser negativo.");
    }
    else if (corte.Stock > 100000)
    {
        errores.Add("El stock ingresado es demasiado alto.");
    }

    var gruposValidos = new HashSet<string>
    {
        "Carne Vacuna", "Cerdo", "Achuras", "Embutidos", "Menudencias", "Otros"
    };
    if (string.IsNullOrWhiteSpace(corte.Grupo) || !gruposValidos.Contains(corte.Grupo))
    {
        errores.Add("El grupo seleccionado no es válido.");
    }

    return errores;
}

// Endpoint para CREAR un corte nuevo (POST)
builderApp.MapPost("/api/cortes", async (Corte nuevoCorte) =>
{
    var errores = ValidarCorte(nuevoCorte); // (o corteActualizado en el PUT)
if (errores.Count > 0)
{
    return Results.BadRequest(new { errores });
}
    try
    {
        int idGenerado;

        using (var conexion = new NpgsqlConnection(connectionString))
        {
            await conexion.OpenAsync();

            string query = "INSERT INTO cortes (nombre, precio, stock, grupo) VALUES (@nombre, @precio, @stock, @grupo) RETURNING id";
            using (var comando = new NpgsqlCommand(query, conexion))
            {
                comando.Parameters.AddWithValue("@nombre", nuevoCorte.Nombre);
                comando.Parameters.AddWithValue("@precio", nuevoCorte.Precio);
                comando.Parameters.AddWithValue("@stock", nuevoCorte.Stock);
                comando.Parameters.AddWithValue("@grupo", nuevoCorte.Grupo ?? "Otros");

                var resultado = await comando.ExecuteScalarAsync();
                idGenerado = Convert.ToInt32(resultado);
            }
        }

        return Results.Ok(new { id = idGenerado, mensaje = "Corte guardado correctamente en Supabase" });
    }
    catch (Exception ex)
    {
        return Results.Problem(ex.Message);
    }
});

// Endpoint para ACTUALIZAR un corte existente (PUT)
builderApp.MapPut("/api/cortes/{id}", async (int id, Corte corteActualizado) =>
{
    var errores = ValidarCorte(corteActualizado); // (o corteActualizado en el PUT)
if (errores.Count > 0)
{
    return Results.BadRequest(new { errores });
}
    try
    {
        using (var conexion = new NpgsqlConnection(connectionString))
        {
            await conexion.OpenAsync();

            string query = "UPDATE cortes SET nombre = @nombre, precio = @precio, stock = @stock, grupo = @grupo WHERE id = @id";

            using (var comando = new NpgsqlCommand(query, conexion))
            {
                comando.Parameters.AddWithValue("@nombre", corteActualizado.Nombre);
                comando.Parameters.AddWithValue("@precio", corteActualizado.Precio);
                comando.Parameters.AddWithValue("@stock", corteActualizado.Stock);
                comando.Parameters.AddWithValue("@grupo", corteActualizado.Grupo ?? "Otros");
                comando.Parameters.AddWithValue("@id", id);

                int filasAfectadas = await comando.ExecuteNonQueryAsync();

                if (filasAfectadas == 0)
                {
                    return Results.NotFound(new { mensaje = "Corte no encontrado" });
                }
            }
        }

        return Results.Ok(new { mensaje = "Corte actualizado correctamente" });
    }
    catch (Exception ex)
    {
        return Results.Problem(ex.Message);
    }
});

// Endpoint para LISTAR todos los cortes (GET)
builderApp.MapGet("/api/cortes", async () =>
{
    var lista = new List<object>();
    using (var conexion = new NpgsqlConnection(connectionString))
    {
        await conexion.OpenAsync();
        using (var comando = new NpgsqlCommand("SELECT id, nombre, precio, stock, grupo FROM cortes", conexion))
        using (var reader = await comando.ExecuteReaderAsync())
        {
            while (await reader.ReadAsync())
            {
                lista.Add(new {
                    id = reader.GetInt32(0),
                    nombre = reader.GetString(1),
                    precio = reader.GetDecimal(2),
                    stock = reader.GetInt32(3),
                    grupo = reader.IsDBNull(4) ? "Otros" : reader.GetString(4)
                });
            }
        }
    }
    return Results.Ok(lista);
});

// Endpoint para ELIMINAR un corte (DELETE)
builderApp.MapDelete("/api/cortes/{id}", async (int id) =>
{
    try
    {
        using (var conexion = new NpgsqlConnection(connectionString))
        {
            await conexion.OpenAsync();

            string query = "DELETE FROM cortes WHERE id = @id";

            using (var comando = new NpgsqlCommand(query, conexion))
            {
                comando.Parameters.AddWithValue("@id", id);
                await comando.ExecuteNonQueryAsync();
            }
        }
        return Results.Ok(new { mensaje = "Corte eliminado correctamente" });
    }
    catch (Exception ex)
    {
        return Results.Problem(ex.Message);
    }
});

// Endpoint para LOGIN
builderApp.MapPost("/api/login", async (LoginRequest login) =>
{
    try
    {
        using (var conexion = new NpgsqlConnection(connectionString))
        {
            await conexion.OpenAsync();

            string query = "SELECT id, nombre_usuario, rol FROM usuarios WHERE nombre_usuario = @usuario AND contrasena = @contrasena";
            using (var comando = new NpgsqlCommand(query, conexion))
            {
                comando.Parameters.AddWithValue("@usuario", login.NombreUsuario);
                comando.Parameters.AddWithValue("@contrasena", login.Contrasena);

                using (var reader = await comando.ExecuteReaderAsync())
                {
                    if (await reader.ReadAsync())
                    {
                        return Results.Ok(new
                        {
                            id = reader.GetInt32(0),
                            nombreUsuario = reader.GetString(1),
                            rol = reader.GetString(2)
                        });
                    }
                    else
                    {
                        return Results.Unauthorized();
                    }
                }
            }
        }
    }
    catch (Exception ex)
    {
        return Results.Problem(ex.Message);
    }
});



builderApp.Run();