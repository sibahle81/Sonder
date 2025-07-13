using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class OwnerUploadController : RmaApiController
    {
        private readonly IOwnerUploadService _ownerUpload;
        private readonly IOwnerUploadService _ownerUploadRepository;

        public OwnerUploadController(IOwnerUploadService ownerUpload,
            IOwnerUploadService ownerUploadRepository)
        {
            _ownerUpload = ownerUpload;
            _ownerUploadRepository = ownerUploadRepository;
        }

        // GET: mdm/api/OwnerUpload
        [HttpGet]
        public async Task<ActionResult<IEnumerable<OwnerUpload>>> Get()
        {
            var ownerUploads = await _ownerUpload.GetOwnerUploads();
            return Ok(ownerUploads);
        }

        // GET: mdm/api/OwnerUpload/GetByOwnerId/{ownerId}/{ownerTypeName}
        [HttpGet("GetByOwnerId/{ownerId}/{ownerTypeName}")]
        public async Task<ActionResult> GetByOwnerId(int ownerId, string ownerTypeName)
        {
            //var ownerUploads = _ownerUpload.GetOwnerUploads()
            //    .Where(w => w.OwnerId == ownerId && w.OwnerType == ownerTypeName);
            return Ok( /*ownerUploads*/);
        }

        // GET: mdm/api/OwnerUpload/{ownerId}/{ownerTypeName}
        //TODO same as the above method
        //[HttpGet]
        //public async Task<ActionResult> Get(int ownerId, string ownerType)
        //{
        //        var ownerUploads = await _ownerUpload.GetOwnerUploadsByIdAndType(ownerId, ownerType);
        //        return Ok(ownerUploads);
        //}

        // GET: mdm/api/OwnerUpload/{uploadId}
        [HttpGet("{uploadId}")]
        public async Task<ActionResult<OwnerUpload>> Get(int uploadId)
        {
            var clientUser = await _ownerUpload.GetOwnerUpload(uploadId);
            return Ok(clientUser);
        }

        // POST: mdm/api/OwnerUpload/{ownerUpload}
        [HttpPost]
        public async Task<ActionResult<int>> Post([FromBody] OwnerUpload ownerUpload)
        {
            var ids = await _ownerUploadRepository.AddOwnerUpload(new List<OwnerUpload> { ownerUpload });
            return Ok(ids[0]);
        }

        //POST: mdm/api/OwnerUpload/PostMany/{ownerUploads}
        [HttpPost("PostMany")]
        public async Task<ActionResult<IEnumerable<int>>> PostMany([FromBody] List<OwnerUpload> ownerUploads)
        {
            var ids = await _ownerUploadRepository.AddOwnerUpload(ownerUploads);
            return Ok(ids);
        }

        //PUT: mdm/api/OwnerUpload/{ownerUpload}
        [HttpPut]
        public async Task<ActionResult<bool>> Put([FromBody] OwnerUpload ownerUpload)
        {
            throw new NotImplementedException();
            //_ownerUpload.Edit(clientUser, username, corrolationToken);
            //return Ok(true);
        }
    }
}