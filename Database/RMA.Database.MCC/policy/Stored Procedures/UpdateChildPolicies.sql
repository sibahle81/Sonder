

CREATE  PROCEDURE [policy].[UpdateChildPolicies]
	@PolicyId INT, @IsEuropeAssist BIT
AS
BEGIN

    DECLARE @EuropAssistFee Decimal(18,2)
    SET @EuropAssistFee = (SELECT [Value] FROM common.settings WHERE [Key] = 'EuropAssistFee')
	DECLARE @CheckEuropeAssist BIT
	SET @CheckEuropeAssist = (SELECT IsEuropAssist FROM [policy].[Policy] WHERE PolicyId = @PolicyId)
	DECLARE @EuropAssistInceptionDate Date
	SET @EuropAssistInceptionDate = (SELECT EuropAssistEffectiveDate FROM [policy].[Policy] WHERE PolicyId = @PolicyId)
	
	UPDATE [policy].[Policy] SET [EuropAssistEffectiveDate] = @EuropAssistInceptionDate
	WHERE [ParentPolicyId] = @PolicyId

	IF(@CheckEuropeAssist = 0 AND @IsEuropeAssist = 1) 
	BEGIN
	  -- ADD EuropAssistFee To Child Policies
	  UPDATE [policy].[Policy] SET [InstallmentPremium] = [InstallmentPremium] + @EuropAssistFee,
	                               [AnnualPremium] = [AnnualPremium] + (@EuropAssistFee * 12),
                                   [IsEuropAssist] = @IsEuropeAssist
	  WHERE [ParentPolicyId] = @PolicyId
	END
	IF(@CheckEuropeAssist = 1 AND @IsEuropeAssist = 0) 
	BEGIN
	  -- MINUS EuropAssistFee To Child Policies
	   UPDATE [policy].[Policy] SET [InstallmentPremium] = [InstallmentPremium] - @EuropAssistFee,
	                               [AnnualPremium] = [AnnualPremium] - (@EuropAssistFee * 12),
								   [IsEuropAssist] = @IsEuropeAssist
	  WHERE [ParentPolicyId] = @PolicyId
	END

	SELECT Count(*) FROM [policy].[Policy] WHERE [ParentPolicyId] = @PolicyId
END