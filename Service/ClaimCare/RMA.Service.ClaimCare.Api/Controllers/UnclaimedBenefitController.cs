using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.Api.Controllers
{
    public class UnclaimedBenefitController : RmaApiController
    {
        #region Fields

        private readonly IUnclaimedBenefitService _unclaimedBenefitService;

        #endregion

        #region Constructors and Destructors

        public UnclaimedBenefitController(IUnclaimedBenefitService unclaimedBenefitService)
        {
            this._unclaimedBenefitService = unclaimedBenefitService;
        }

        [HttpGet("GetAllUnclaimedBenefitInterest")]
        public async Task<IActionResult> GetAllUnclaimedBenefitInterest()
        {
            try
            {
                var result = await this._unclaimedBenefitService.GetAllUnclaimedBenefitInterest();
                return this.Ok(result);
            }
            catch (Exception ex)
            {
                return this.StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpGet("GetAllUnclaimedBenefitInterestId")]
        public async Task<IActionResult> GetAllUnclaimedBenefitInterestById(int unclaimedBenefitInterestId)
        {
            try
            {
                var result = await this._unclaimedBenefitService.GetUnclaimedBenefitInterestById(unclaimedBenefitInterestId);

                if (result == null)
                {
                    return this.NotFound();
                }

                return this.Ok(result);
            }
            catch (Exception ex)
            {
                return this.StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpGet("GetUnclaimedBenefitAmout")]
        public async Task<IActionResult> Get(double unclaimedBenefitAmount,
                                                                 DateTime startDate,
                                                                 DateTime endDate,
                                                                 double? investigationFeeAmount,
                                                                 DateTime? investigationDate)
        {
            try
            {
                var result = await this._unclaimedBenefitService.GetUnclaimedBenefitAmout(
                                 unclaimedBenefitAmount,
                                 startDate,
                                 endDate,
                                 investigationFeeAmount,
                                 investigationDate);
                return this.Ok(result);
            }
            catch (Exception ex)
            {
                return this.StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpPut("UpdateUnclaimedBenefitInterest")]
        public async Task<IActionResult> UpdateUnclaimendBenefitInterest(UnclaimedBenefitInterest unclaimedBenefitInterest)
        {
            if (!this.ModelState.IsValid)
            {
                return this.BadRequest(this.ModelState);
            }

            try
            {
                var result = await this._unclaimedBenefitService.UpdateUnclaimendBenefitInterest(unclaimedBenefitInterest);
                return this.Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return this.NotFound();
            }
            catch (Exception ex)
            {
                return this.StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpPost("UploadUnclaimedBenefitFile")]
        public async Task<IActionResult> UploadUnclaimedBenefitFile([FromBody] FileUpload fileUpload)
        {
            if (!this.ModelState.IsValid)
            {
                return this.BadRequest(this.ModelState);
            }

            try
            {
                var result = await this._unclaimedBenefitService.UploadUnclaimedBenefitFile(fileUpload);
                return this.Ok(result);
            }
            catch (Exception ex)
            {
                return this.StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpDelete("DeleteUnclaimedBenefitInterestById")]
        public async Task<IActionResult> DeleteUnclaimedBenefitInterestById(int unclaimedBenefitInterestId)
        {
            try
            {
                var result = await this._unclaimedBenefitService.DeleteUnclaimedBenefitInterestById(unclaimedBenefitInterestId);
                return this.Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return this.NotFound();
            }
            catch (Exception ex)
            {
                return this.StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        #endregion
    }
}