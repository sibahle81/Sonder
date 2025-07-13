CREATE   PROCEDURE [claim].[USP_CheckClaimMedicalBenefitsExistForSTPIntegration]
	@ClaimReferenceNumber nvarchar(150)
AS
BEGIN

 IF EXISTS ( SELECT 1 FROM [compcare].Claim C     
    INNER JOIN [compcare].ClaimBenefit CB ON C.ClaimID=CB.ClaimID    
    INNER JOIN [compcare].PolicyBenefit PB ON CB.PolicyBenefitID = PB.PolicyBenefitID     
    WHERE PB.BenefitCodeID = (SELECT TOP 1 BenefitCodeID FROM [compcare].BenefitCode WHERE Code = 'MedCost')     
    AND C.FileRefNumber = @ClaimReferenceNumber )  

  SELECT CAST(1 AS BIT) AS 'MedicalBenefitsExist' 

 ELSE  

  SELECT CAST(0 AS BIT) AS 'MedicalBenefitsExist'

END
GO