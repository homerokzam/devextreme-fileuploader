using System;

namespace DevExtremeFileUploaderDemo.ViewModels
{
  public class ChunkMetadata
  {
    public int Index { get; set; }
    public int TotalCount { get; set; }
    public int FileSize { get; set; }
    public string FileName { get; set; }
    public string FileType { get; set; }
    public string FileGuid { get; set; }
    public Int32 SegmentSize { get; set; }
    public Int32 BytesLoaded { get; set; }
    public Int32 BytesTotal { get; set; }
  }
}