namespace Backend.Models
{
    public class Corte
    {
        public int Id { get; set; }
        public string? Nombre { get; set; }
        public decimal Precio { get; set; }
        public int Stock { get; set; }
        public string? Grupo { get; set; }
    }
}