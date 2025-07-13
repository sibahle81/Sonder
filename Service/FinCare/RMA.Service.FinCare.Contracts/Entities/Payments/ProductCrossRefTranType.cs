using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.FinCare.Contracts.Entities.Payments
{
    public class ProductCrossRefTranType
    {
        public int ProductCrossRefTranTypeId { get; set; } // ProductCrossRefTranTypeID (Primary key)
        public int ProductCodeId { get; set; } // ProductCodeID
        public IndustryClassEnum IndustryClass { get; set; } // IndustryClassID
        public int? PaymentFrequencyTypeId { get; set; } // PaymentFrequencyTypeID
        public string Origin { get; set; } // Origin (length: 3)
        public short TransactionType { get; set; } // TransactionType
        public string CompanyNo { get; set; } // CompanyNo (length: 10)
        public string BranchNo { get; set; } // BranchNo (length: 10)
        public string Level1No { get; set; } // Level1No (length: 10)
        public string Level3No { get; set; } // Level3No (length: 10)
        public int Category18ChartNo { get; set; } // Category18ChartNo
        public int Category18Otherchart { get; set; } // Category18Otherchart
        public int Category9Chart { get; set; } // Category9Chart
        public int Category9OtherChart { get; set; } // Category9OtherChart
        public string BenefitCode { get; set; } // BenefitCode (length: 20)
        public byte? AutoReverseFlag { get; set; } // AutoReverseFlag
        public string ClaimType { get; set; } // ClaimType (length: 1)
        public string TransModuleNo { get; set; } // TransModuleNo (length: 2)
        public short? TransTypeNo { get; set; } // TransTypeNo
        public int? TransTypesysNo { get; set; } // TransTypesysNo
        public string TransuserNo { get; set; } // TransuserNo (length: 10)
        public int? GroupCompanyId { get; set; } // GroupCompanyID
        public bool IsActive { get; set; } // IsActive
        public string LastChangedBy { get; set; } // LastChangedBy (length: 100)
        public System.DateTime LastChangedDate { get; set; } // LastChangedDate
        public string Level2No { get; set; } // Level2No (length: 100)
        public int? RmaOrigin { get; set; } // RmaOrigin
    }
}
