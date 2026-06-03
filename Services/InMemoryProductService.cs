using SmartInventory.Models;

namespace SmartInventory.Services;

public class InMemoryProductService
{
    private readonly List<Product> _products = new()
    {
        new() { Id=1, SKU="PROD-TECH-001", Name="Monitor Gamer 27\"",          Category="Electronics",  Price=349.99m, StockActual=150,  StockMinimo=20  },
        new() { Id=2, SKU="PROD-TECH-002", Name="Teclado Mecánico Logitech",   Category="Electronics",  Price=129.99m, StockActual=55,   StockMinimo=15  },
        new() { Id=3, SKU="PROD-OFF-881",  Name="Silla Ergonómica Pro",         Category="Office",       Price=245.00m, StockActual=8,    StockMinimo=10  },
        new() { Id=4, SKU="PROD-OFF-882",  Name="Escritorio Elevable L-Shape",  Category="Office",       Price=499.99m, StockActual=5,    StockMinimo=5   },
        new() { Id=5, SKU="PROD-COMP-009", Name="Procesador AMD Ryzen 9",       Category="Electronics",  Price=649.00m, StockActual=0,    StockMinimo=8   },
        new() { Id=6, SKU="PROD-MATE-401", Name="Cable HDMI 2.1 (2m)",          Category="Accessories",  Price=15.99m,  StockActual=520,  StockMinimo=50  },
        new() { Id=7, SKU="PROD-RAW-ALUM", Name="Filamento Aluminio Industrial", Category="Industrial",   Price=85.00m,  StockActual=1245, StockMinimo=200 },
        new() { Id=8, SKU="PROD-TECH-099", Name="Hub USB-C 8 Puertos",          Category="Electronics",  Price=45.00m,  StockActual=30,   StockMinimo=10  }
    };

    public List<Product> GetAll() => _products;
}
