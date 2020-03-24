using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.IO;

using DevExtremeFileUploaderDemo.ViewModels;

namespace DevExtremeFileUploaderDemo.Controllers
{
  [ApiController]
  [Route("[controller]")]
  public class DocumentosController : ControllerBase
  {
    public DocumentosController(ILogger<DocumentosController> logger, IWebHostEnvironment env)
    {
      _logger = logger;
      _env = env;
    }

    private readonly ILogger<DocumentosController> _logger;
    private readonly IWebHostEnvironment _env;

    [HttpGet("{empresaId}")]
    public async Task<IActionResult> GetAsync(Int32 empresaId)
    {
      string path = Path.Combine(_env.ContentRootPath, "Data");

      await Task.Delay(3000);

      JArray jresult = new JArray();
      foreach (string file in Directory.GetFiles(path))
      {
        string filename = Path.GetFileName(file);
        jresult.Add(JObject.FromObject(new
        {
          id = filename,
          text = $"{empresaId} - {filename}"
        }));
      }

      return Ok(jresult);
    }

    [HttpGet("Documento/{empresaId}/{filename}")]
    public IActionResult GetDocumento(Int32 empresaId, string filename)
    {
      string path = Path.Combine(_env.ContentRootPath, "Data");
      string filename1 = Path.Combine(path, filename);

      return PhysicalFile(filename1, "application/octet-stream");
    }

    [HttpPost("{empresaId}/{chunkMetadata}")]
      public ActionResult Post(Int32 empresaId, string chunkMetadata, IFormFile file) {
      JObject json = null;
      try
      {
        var metaDataObject = JsonConvert.DeserializeObject<ChunkMetadata>(chunkMetadata);
        string path = Path.Combine(_env.ContentRootPath, "Data");

        _logger.LogInformation(chunkMetadata);

        if (metaDataObject.FileName == null)
          return Ok();

        var tempFile = Path.Combine(path, metaDataObject.FileName + ".tmp");
        if (metaDataObject.BytesLoaded == 0)
          if (System.IO.File.Exists(tempFile))
            System.IO.File.Delete(tempFile);

        AppendContentToFile(tempFile, file);

        if (metaDataObject.BytesLoaded + metaDataObject.SegmentSize == metaDataObject.BytesTotal)
        {
          string finalFilename = Path.Combine(path, metaDataObject.FileName);
          ProcessUploadedFile(tempFile, finalFilename);
        }

        string filename = metaDataObject.FileName;
        json = JObject.FromObject(new
        {
          id = filename,
          text = $"{empresaId} - {filename}"
        });
      }
      catch (Exception ex)
      {
        return BadRequest(ex.Message);
      }

      return Ok(json);
    }

    [HttpDelete("{empresaOid}/{filename}")]
    public IActionResult Delete(Int32 empresaOid, string filename)
    {
      try
      {
        string path = Path.Combine(_env.ContentRootPath, "Data");
        string filename1 = Path.Combine(path, filename);
        System.IO.File.Delete(filename1);

        return Ok(filename);
      }
      catch (Exception ex)
      {
        return BadRequest(ex.Message);
      }
    }

    internal void AppendContentToFile(string tempFile, IFormFile content)
    {
      using (var stream = new FileStream(tempFile, FileMode.Append, FileAccess.Write))
      {
        content.CopyTo(stream);
        CheckMaxFileSize(stream);
      }
    }

    internal void ProcessUploadedFile(string tempFile, string fileName)
    {
      System.IO.File.Copy(tempFile, fileName, true);
      System.IO.File.Delete(tempFile);
    }

    void CheckMaxFileSize(FileStream stream)
    {
      if (stream.Length > 524288000)
        throw new Exception("Arquivo é maior que o permitido!");
    }
  }
}
