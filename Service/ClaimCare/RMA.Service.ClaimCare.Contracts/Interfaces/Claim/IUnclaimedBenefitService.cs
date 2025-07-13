namespace RMA.Service.ClaimCare.Contracts.Interfaces.Claim
{
    using Entities;

    using Microsoft.ServiceFabric.Services.Remoting;

    using System;
    using System.Collections.Generic;
    using System.Threading.Tasks;

    public interface IUnclaimedBenefitService : IService
    {
        #region Public Methods and Operators

        Task<bool> DeleteUnclaimedBenefitInterestById(int unclaimedBenefitInterestId);

        Task<List<UnclaimedBenefitInterest>> GetAllUnclaimedBenefitInterest();

        Task<UnclaimedBenefitInterest> GetUnclaimedBenefitInterestById(int unclaimedBenefitInterestId);

        Task<UnclaimedBenefitInvestmentResult> GetUnclaimedBenefitAmout(
            double unclaimedBenefitAmount,
            DateTime startDate,
            DateTime endDate,
            double? investigationFeeAmount,
            DateTime? investigationFeeDate);

        Task<bool> UpdateUnclaimendBenefitInterest(UnclaimedBenefitInterest unclaimedBenefitInterest);

        Task<bool> UploadUnclaimedBenefitFile(FileUpload fileUpload);

        #endregion
    }
}