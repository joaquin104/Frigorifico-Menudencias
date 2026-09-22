using Npgsql;
using Backend.Models;

var builder = WebApplication.CreateBuilder(args);

// Obtenemos la cadena de conexión desde el appsettings.json
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// 1. NUEVO: Agregamos el servicio de CORS ANTES de construir la app
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

// 2. NUEVO: Le decimos a la app que use esa política DESPUÉS del Build
builderApp.UseCors("PermitirReact");

// Endpoint que recibirá los datos enviados desde React
builderApp.MapPost("/api/cortes", async (Corte nuevoCorte) =>
{
    try
    {
        using (var conexion = new NpgsqlConnection(connectionString))
        {
            await conexion.OpenAsync();

            string query = "INSERT INTO cortes (nombre, precio, stock) VALUES (@nombre, @precio, @stock)";
            using (var comando = new NpgsqlCommand(query, conexion))
            {
                comando.Parameters.AddWithValue("@nombre", nuevoCorte.Nombre);
                comando.Parameters.AddWithValue("@precio", nuevoCorte.Precio);
                comando.Parameters.AddWithValue("@stock", nuevoCorte.Stock);

                await comando.ExecuteNonQueryAsync();
            }
        }

        return Results.Ok(new { mensaje = "Corte guardado correctamente en Supabase" });
    }
    catch (Exception ex)
    {
        return Results.Problem(ex.Message);
    }
});

// Endpoint para ACTUALIZAR un corte existente (PUT)
builderApp.MapPut("/api/cortes/{id}", async (int id, Corte corteActualizado) =>
{
    try
    {
        using (var conexion = new NpgsqlConnection(connectionString))
        {
            await conexion.OpenAsync();

            // La consulta SQL UPDATE para modificar los datos
            string query = "UPDATE cortes SET nombre = @nombre, precio = @precio, stock = @stock WHERE id = @id";
            
            using (var comando = new NpgsqlCommand(query, conexion))
            {
                // Pasamos los nuevos valores y el ID del corte a modificar
                comando.Parameters.AddWithValue("@nombre", corteActualizado.Nombre);
                comando.Parameters.AddWithValue("@precio", corteActualizado.Precio);
                comando.Parameters.AddWithValue("@stock", corteActualizado.Stock);
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

builderApp.MapGet("/api/cortes", async () =>
{
    var lista = new List<object>();
    using (var conexion = new NpgsqlConnection(connectionString))
    {
        await conexion.OpenAsync();
        using (var comando = new NpgsqlCommand("SELECT id, nombre, precio, stock FROM cortes", conexion))
        using (var reader = await comando.ExecuteReaderAsync())
        {
            while (await reader.ReadAsync())
            {
                lista.Add(new { id = reader.GetInt32(0), nombre = reader.GetString(1), precio = reader.GetDecimal(2), stock = reader.GetInt32(3) });
            }
        }
    }
    return Results.Ok(lista);
});

builderApp.MapDelete("/api/cortes/{id}", async (int id) =>
{
    try
    {
        using (var conexion = new NpgsqlConnection(connectionString))
        {
            await conexion.OpenAsync();
            
            // Le decimos a Postgres que borre la fila que coincida con el ID
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

builderApp.Run();

// Definición simple del modelo de datos para recibir el JSON
