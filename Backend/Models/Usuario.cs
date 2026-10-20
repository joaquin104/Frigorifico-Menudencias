namespace Backend.Models
{
    public class Usuario
    {
        public int Id { get; set; }
        public string? NombreUsuario { get; set; }
        public string? Contrasena { get; set; }
        public string? Rol { get; set; }
    }

    // Este objeto es lo que React va a mandar al loguearse (solo usuario y contraseña)
    public class LoginRequest
    {
        public string NombreUsuario { get; set; } = string.Empty;
        public string Contrasena { get; set; } = string.Empty;
    }
}