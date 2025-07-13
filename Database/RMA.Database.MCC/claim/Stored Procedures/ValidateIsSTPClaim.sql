CREATE   PROCEDURE [claim].[ValidateIsSTPClaim]
	@PolicyOwner int,
	@InsuranceType int, 
	@ClaimType int, 
	@BenefitId int,
	@ReportDate DateTime
AS
BEGIN
	Declare @CoidProductId int, 
			@STPInsurnaceType int, 
			@PolicyDate DATETIME

	Set @CoidProductId = (Select [Value] from common.Settings where [Key] = 'COIDProductId')

	Select id into #STPClaimType from common.claimType where id in (15, 40)


	Set @STPInsurnaceType = (Select ParentInsuranceTypeID from claim.ParentInsuranceType Where ParentInsuranceTypeID = 1 )

	SET @PolicyDate =  (Select P.ExpiryDate from [policy].[policy] P inner join
						[product].[ProductOption] PO on P.productOptionId = PO.Id
						where P.PolicyOwnerId = @PolicyOwner and PO.ProductId = @CoidProductId and p.PolicyStatusId != 2)

	IF (@STPInsurnaceType != @InsuranceType)
	BEGIN 
		SELECT CAST(28 AS int)
	END 
    ELSE IF NOT EXISTS (Select id from #STPClaimType where id = @ClaimType)
	BEGIN 
		SELECT CAST(28 AS int)
	END 
	ELSE IF NOT EXISTS(Select ClaimBucketClassId 
						from claim.ClaimBucketClass 
						Where IsStraightThroughProcessBenefit = 1 
						and ClaimBucketClassId = @BenefitId)
	BEGIN
	 SELECT CAST(12 AS int)
	END 

	ELSE IF((SELECT DATEDIFF(DAY, @ReportDate, GETDATE())) > 90)
	BEGIN
	 SELECT CAST(29 AS int)
	END
	ELSE IF(@PolicyDate is not null and @PolicyDate > GETDATE())
	BEGIN 
		SELECT CAST(-1 AS int)
	END ELSE 
	BEGIN
		SELECT CAST(4 AS int)
	END
	DROP TABLE #STPClaimType	
END
