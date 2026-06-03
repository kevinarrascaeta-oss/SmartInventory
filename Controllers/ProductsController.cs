using Microsoft.AspNetCore.Mvc;
using SmartInventory.Services;

namespace SmartInventory.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly InMemoryProductService _service;

    public ProductsController(InMemoryProductService service)
    {
        _service = service;
    }

    [HttpGet]
    public IActionResult GetAll()
    {
        return Ok(_service.GetAll());
    }
}
