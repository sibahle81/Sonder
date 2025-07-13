using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using RMA.Common.Extensions;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class UploadsController : RmaApiController
    {
        private readonly IOwnerUploadService _ownerUploadRepository;
        private readonly IUploadsService _uploadsRepository;

        public UploadsController(IUploadsService uploadsRepository, IOwnerUploadService ownerUploadRepository)
        {
            _uploadsRepository = uploadsRepository;
            _ownerUploadRepository = ownerUploadRepository;
        }

        // GET: mdm/api/Uploads
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Uploads>>> Get()
        {
            var uploads = await _uploadsRepository.GetUploads();
            return Ok(uploads);
        }

        // GET: mdm/api/Uploads/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Uploads>> Get(int id)
        {
            var uploads = await _uploadsRepository.GetUploadById(id);
            return Ok(uploads);
        }

        // GET: mdm/api/Uploads/ByToken/{token}
        [AllowAnonymous]
        [HttpGet("ByToken/{token}")]
        public async Task<HttpResponseMessage> ByToken(Guid token)
        {
            var data = await _uploadsRepository.GetUploadByToken(token);
            if (data == null) return null;

            var memoryStream = new MemoryStream(data.Data);

            var response = new HttpResponseMessage(HttpStatusCode.OK) { Content = new StreamContent(memoryStream) };
            response.Content.Headers.ContentType = new MediaTypeHeaderValue(data.MimeType);
            response.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment")
            {
                FileName = data.Name
            };

            return response;
        }

        // GET: mdm/api/Uploads/GetObject/{token}/{withData}
        [HttpGet("Object/{token}/{withData?}")]
        public async Task<ActionResult<Uploads>> GetObject(Guid token, bool withData = false)
        {
            var data = await _uploadsRepository.GetUploadByToken(token);
            if (!withData && data != null) data.Data = null;
            return Ok(data);
        }

        // DELETE mdm/api/Uploads/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            await _ownerUploadRepository.DeleteOwnerUploads(id);
            await _uploadsRepository.DeleteUpload(id);
            return Ok();
        }

        // POST mdm/api/Uploads/SaveUpload
        [HttpPost("SaveUpload")]
        public async Task<ActionResult<IEnumerable<Uploads>>> SaveUpload()
        {
            var uploadedFiles = new List<Uploads>();
            foreach (var formFile in Request.Form.Files)
            {
                var uploadFile = new Uploads()
                {
                    MimeType = formFile.ContentType,
                    Name = formFile.FileName,
                    Size = Request.Form[formFile.FileName],
                    Token = Guid.NewGuid(),
                };

                if (formFile.Length > 0)
                {
                    using (var binaryReader = new BinaryReader(formFile.OpenReadStream()))
                    {
                        uploadFile.Data = await binaryReader.ReadAllBytes();
                    }
                }

                var upload = await _uploadsRepository.SaveUpload(uploadFile);
                uploadedFiles.Add(upload);
            }

            return Ok(uploadedFiles);
        }
    }
}