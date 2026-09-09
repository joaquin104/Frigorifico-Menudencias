using Npgsql;

var builder = WebApplication.CreateBuilder(args);

// Obtenemos la cadena de conexión desde el appsettings.json
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

var builderApp = builder.Build();

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

builderApp.Run();

// Definición simple del modelo de datos para recibir el JSON
public record Corte(string Nombre, decimal Precio, int Stock);