using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.Fabric;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Threading.Tasks;
using BitMiracle.LibTiff.Classic;
using iTextSharp.text.pdf;
using iTextSharp.text.pdf.parser;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.ScanCare.Contracts.Entities.AutoProcessing;
using RMA.Service.ScanCare.Contracts.Interfaces.Document.AutoProcessing;
using ZXing;
using ZXing.Common;

namespace RMA.Service.ScanCare.Services.Document.AutoProcessing
{
    /// <summary> Stateless wrapper that breaks an incoming binary file into logical document parts. </summary>
    public class DocumentSplitterService : RemotingStatelessService, IDocumentSplitterService
    {
        public DocumentSplitterService(StatelessServiceContext context) : base(context) { }

        // Entry: route by MIME-type. Returns a list even if no split happens.
        public async Task<List<DocumentPart>> Split(byte[] fileBytes,
                                                    string fileName,
                                                    string contentType)
        {
            if (string.Equals(contentType, "application/pdf", StringComparison.OrdinalIgnoreCase))
                return await SplitPdfAsync(fileBytes, fileName);

            if (string.Equals(contentType, "image/tiff", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(contentType, "image/tif", StringComparison.OrdinalIgnoreCase))
                return await SplitTiffAsync(fileBytes, fileName);

            if (string.Equals(contentType, "application/zip", StringComparison.OrdinalIgnoreCase))
                return await SplitZipAsync(fileBytes, fileName);

            // Anything else – emit as-is (single part)
            return new List<DocumentPart>
            {
                new DocumentPart
                {
                    FileName  = fileName,
                    Data      = fileBytes,
                    PageStart = 1,
                    PageEnd   = 1
                }
            };
        }

        // ---------------- PDF -----------------------------------------------------
        private Task<List<DocumentPart>> SplitPdfAsync(byte[] bytes, string original) =>
            Task.Run(() => SplitPdf(bytes, original));

        private List<DocumentPart> SplitPdf(byte[] bytes, string original)
        {
            var parts = new List<DocumentPart>();
            var buffer = new List<int>();           // pages collected for the current doc

            using (var reader = new PdfReader(bytes))
            {
                for (int p = 1; p <= reader.NumberOfPages; p++)
                {
                    bool blank = IsPdfPageBlank(reader, p);
                    bool barcode = PageHasSplitBarcode(RenderPdfPageToBitmap(reader, p));

                    // Separator page -> flush buffer
                    if ((blank || barcode) && buffer.Count > 0)
                    {
                        parts.Add(ExtractPdfRange(reader, buffer, original));
                        buffer.Clear();
                    }

                    if (!blank && !barcode)
                        buffer.Add(p);              // keep normal page
                }

                // tail buffer
                if (buffer.Count > 0)
                    parts.Add(ExtractPdfRange(reader, buffer, original));
            }
            return parts;
        }

        // Cut out the buffered page range into its own PDF.
        private static DocumentPart ExtractPdfRange(PdfReader reader,
                                                    List<int> pages,
                                                    string original)
        {
            using (var ms = new MemoryStream())
            using (var doc = new iTextSharp.text.Document())
            using (var cp = new PdfCopy(doc, ms))
            {
                doc.Open();
                foreach (int p in pages)
                    cp.AddPage(cp.GetImportedPage(reader, p));

                int first = pages.First();
                int last = pages.Last();

                return new DocumentPart
                {
                    FileName = System.IO.Path.GetFileNameWithoutExtension(original) +
                                "_p" + first + "-" + last + ".pdf",
                    Data = ms.ToArray(),
                    PageStart = first,
                    PageEnd = last
                };
            }
        }

        // Fast “is blank?” check: no text + almost-white raster.
        private static bool IsPdfPageBlank(PdfReader r, int p)
        {
            string txt = PdfTextExtractor.GetTextFromPage(
                             r, p, new SimpleTextExtractionStrategy()).Trim();
            if (!string.IsNullOrEmpty(txt)) return false;

            Bitmap bm = RenderPdfPageToBitmap(r, p);
            return IsBitmapMostlyWhite(bm);
        }

        // Very coarse render – sufficient for barcode / white tests.
        private static Bitmap RenderPdfPageToBitmap(PdfReader r, int p)
        {
            var rect = r.GetPageSizeWithRotation(p);
            Bitmap bm = new Bitmap((int)rect.Width, (int)rect.Height);
            using (Graphics g = Graphics.FromImage(bm)) g.Clear(Color.White);
            return bm;
        }

        // ---------------- TIFF ----------------------------------------------------
        private Task<List<DocumentPart>> SplitTiffAsync(byte[] bytes, string original) =>
            Task.Run(() => SplitTiff(bytes, original));

        private List<DocumentPart> SplitTiff(byte[] bytes, string original)
        {
            var parts = new List<DocumentPart>();
            var current = new List<int>();          // frame indices in current doc

            using (var ms = new MemoryStream(bytes))
            using (var tiff = Tiff.ClientOpen("mem", "r", ms, new TiffStream()))
            {
                if (tiff == null) throw new InvalidOperationException("Cannot read TIFF.");

                for (short i = 0; tiff.SetDirectory(i); i++)
                {
                    Bitmap bm = TiffToBitmap(tiff);
                    bool blank = IsBitmapMostlyWhite(bm);
                    bool bar = PageHasSplitBarcode(bm);

                    if ((blank || bar) && current.Count > 0)
                    {
                        parts.Add(ExtractTiffRange(bytes, current, original));
                        current.Clear();
                    }

                    if (!blank && !bar)
                        current.Add(i);
                }
            }

            if (current.Count > 0)
                parts.Add(ExtractTiffRange(bytes, current, original));

            return parts;
        }

        // Extract selected frames into a new TIFF.
        private static DocumentPart ExtractTiffRange(byte[] src,
                                                     List<int> frames,
                                                     string original)
        {
            using (var outMs = new MemoryStream())
            using (var dst = Tiff.ClientOpen("out", "w", outMs, new TiffStream()))
            using (var srcT = Tiff.ClientOpen("in", "r",
                                               new MemoryStream(src), new TiffStream()))
            {
                foreach (int idx in frames)
                {
                    srcT.SetDirectory((short)idx);
                    dst.SetDirectory((short)dst.NumberOfDirectories());
                    CopyTiffDirectory(srcT, dst);
                }
                dst.WriteDirectory();

                int first = frames.First() + 1;
                int last = frames.Last() + 1;

                return new DocumentPart
                {
                    FileName = System.IO.Path.GetFileNameWithoutExtension(original) +
                                "_p" + first + "-" + last + ".tif",
                    Data = outMs.ToArray(),
                    PageStart = first,
                    PageEnd = last
                };
            }
        }

        // Copy minimal tag set + raster strips frame-by-frame.
        private static void CopyTiffDirectory(Tiff src, Tiff dst)
        {
            TiffTag[] tags =
            {
                TiffTag.IMAGEWIDTH,   TiffTag.IMAGELENGTH,
                TiffTag.COMPRESSION,  TiffTag.PHOTOMETRIC,
                TiffTag.BITSPERSAMPLE,TiffTag.SAMPLESPERPIXEL,
                TiffTag.ROWSPERSTRIP, TiffTag.XRESOLUTION,
                TiffTag.YRESOLUTION,  TiffTag.RESOLUTIONUNIT,
                TiffTag.ORIENTATION
            };

            foreach (TiffTag tag in tags)
            {
                FieldValue[] fv = src.GetField(tag);
                if (fv == null) continue;

                if (fv.Length == 1) dst.SetField(tag, fv[0]);
                else if (fv.Length == 2) dst.SetField(tag, fv[0], fv[1]);
                else if (fv.Length == 3) dst.SetField(tag, fv[0], fv[1], fv[2]);
            }

            int strips = src.NumberOfStrips();
            for (int s = 0; s < strips; s++)
            {
                byte[] buf = new byte[src.RawStripSize(s)];
                src.ReadRawStrip(s, buf, 0, buf.Length);
                dst.WriteRawStrip(s, buf, buf.Length);
            }
        }

        // Convert current TIFF directory into a bitmap for quick tests.
        private static Bitmap TiffToBitmap(Tiff t)
        {
            int w = t.GetField(TiffTag.IMAGEWIDTH)[0].ToInt();
            int h = t.GetField(TiffTag.IMAGELENGTH)[0].ToInt();

            int[] raster = new int[w * h];
            bool ok = t.ReadRGBAImageOriented(w, h, raster, Orientation.TOPLEFT);
            if (!ok) throw new InvalidOperationException("Cannot read TIFF raster.");

            Bitmap bmp = new Bitmap(w, h, PixelFormat.Format32bppArgb);
            BitmapData bd = bmp.LockBits(new Rectangle(0, 0, w, h),
                                         ImageLockMode.WriteOnly,
                                         bmp.PixelFormat);

            System.Runtime.InteropServices.Marshal.Copy(raster, 0, bd.Scan0, raster.Length);
            bmp.UnlockBits(bd);
            return bmp;
        }

        // ---------------- ZIP -----------------------------------------------------
        private Task<List<DocumentPart>> SplitZipAsync(byte[] bytes, string name) =>
            Task.Run(() => SplitZip(bytes, name));

        private static List<DocumentPart> SplitZip(byte[] zipBytes, string _)
        {
            var list = new List<DocumentPart>();

            using (var ms = new MemoryStream(zipBytes))
            using (var ar = new ZipArchive(ms, ZipArchiveMode.Read))
            {
                foreach (ZipArchiveEntry e in ar.Entries)
                {
                    using (Stream es = e.Open())
                    using (var mem = new MemoryStream())
                    {
                        es.CopyTo(mem);

                        list.Add(new DocumentPart
                        {
                            FileName = e.FullName,
                            Data = mem.ToArray(),
                            PageStart = 1,
                            PageEnd = 1
                        });
                    }
                }
            }
            return list;
        }

        // ---------------- helpers -------------------------------------------------
        // Detect our “SPLIT...” barcode marker on the raster image.
        private static bool PageHasSplitBarcode(Bitmap bmp)
        {
            var reader = new BarcodeReader
            {
                AutoRotate = true,
                Options = new DecodingOptions { TryHarder = true }
            };
            Result res = reader.Decode(bmp);
            return res != null &&
                   res.Text.StartsWith("SPLIT", StringComparison.OrdinalIgnoreCase);
        }

        // Very simple blank check: >98 % of sampled pixels are white.
        private static bool IsBitmapMostlyWhite(Bitmap bmp)
        {
            int white = 0;
            int samples = 0;

            for (int y = 0; y < bmp.Height; y += 20)
            {
                for (int x = 0; x < bmp.Width; x += 20)
                {
                    samples++;
                    Color c = bmp.GetPixel(x, y);
                    if (c.R > 240 && c.G > 240 && c.B > 240) white++;
                }
            }
            return (double)white / samples > 0.98;
        }
    }
}
