namespace SmartInventory.Models;

public class Product
{
    public int Id { get; set; }
    public string SKU { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int StockActual { get; set; }
    public int StockMinimo { get; set; }
    public string Status => StockActual == 0 ? "Out of Stock"
                          : StockActual <= StockMinimo ? "Low Stock"
                          : "Normal";
}
