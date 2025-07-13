
CREATE   PROCEDURE [policy].[GetStillbornBenefit] @policyId int
AS BEGIN

	DECLARE @productOptionId int
	SELECT @productOptionId = ProductOptionId from [policy].[policy] where PolicyId = @policyId
   
	select top 1 b.[Id]
		,b.[Name]
		,b.[Code]
		,b.[StartDate]
		,b.[EndDate]
		,b.[IsCaptureEarnings]
		,b.[IsAddBeneficiaries]
		,b.[IsMedicalReportRequired]
		,b.[ProductId]
		,b.[BenefitTypeId] BenefitType
		,b.[CoverMemberTypeId] CoverMemberType
		,b.[MinCompensationAmount] MinCompensationAmount
		,b.[MaxCompensationAmount] MaxCompensationAmount
		,b.[ExcessAmount]
		,b.[IsDeleted]
		,b.[CreatedBy]
		,b.[CreatedDate]
		,b.[ModifiedBy]
		,b.[ModifiedDate]
	from product.CurrentBenefitRate br (nolock)
		inner join product.Benefit b (nolock) on b.Id = br.BenefitId
	where br.ProductOptionId = @productOptionId
	  and br.CoverMemberTypeId in (3, 5)
	  and br.MaximumAge = 0

END