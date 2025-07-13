CREATE   FUNCTION [claim].[CheckCompCareDocumentsUploadedFunction] (@CompcareClaimNumber varChar(150), @IdNumber varchar(25))
RETURNS bit
AS
BEGIN
/*

select  [claim].[CheckCompCareDocumentsUploadedFunction] ('X/1708156/1/R0291/23/PEV','6003185434089') as IsUploaded

*/
    
	declare @retValue bit = 0;
	Declare @IdType int 
	Declare @count as int;
	Declare @PassportDocumentCount as int;
	Declare @CompCarePersonEventId int;
	DECLARE @rolePlayerId INT;

	SET @rolePlayerId = (SELECT TOP 1 InsuredLifeId FROM claim.PersonEvent WHERE CompCarePEVRefNumber = @CompcareClaimNumber AND InsuredLifeId <> 0)

	
	Select @IdType = IdTypeId from client.Person  WHERE RolePlayerId = @rolePlayerId
	IF(@IdType = 1)
	Begin 
		select @count = Count(ci.id) from [Imaging].[ClaimsImage] CI
			INNER JOIN [Imaging].[Master] M ON ci.Id = m.Id
			INNER JOIN [Imaging].[Image] I ON m.ImageId = i.Id
			Where
			M.DocumentTypeId in (29,337)
			AND CI.claimNumber = @CompcareClaimNumber
			AND (CI.Idnumber = @IdNumber or ci.PassPortNumber = @IdNumber)
			order by 1 desc
		IF(@count = 0)
		BEGIN 
			select @count = Count(MI.id) from [Imaging].[MedicalImage] MI
			INNER JOIN [Imaging].[Master] M ON MI.Id = m.Id
			INNER JOIN [Imaging].[Image] I ON m.ImageId = i.Id
			Where
			MI.claimNumber = @CompcareClaimNumber
			AND (MI.Idnumber = @IdNumber or MI.PassPortNumber = @IdNumber)
			order by 1 desc

		END


	IF(@count > 0)
	Begin 
		set @retValue =  1; 
    End
	ELSE 
	Begin

	 Select @CompCarePersonEventId = CompCarePersonEventId from Claim.PersonEvent where CompCarePEVRefNumber = @CompcareClaimNumber

	 SELECT @count = Count(MR.PersonEventID)
                         FROM [Medical].[CompCareMedicalReport] mr
                         inner Join [claim].[CompCarePhysicalDamage] PD on mr.PersonEventId = PD.PersonEventId
                         inner Join [Medical].[CompCareICD10DiagnosticGroup] DRG on PD.ICD10DiagnosticGroupId = DRG.ICD10DiagnosticGroupId
                         WHERE mr.PersonEventID = @CompCarePersonEventId AND
                                  mr.MedicalReportTypeID in (1) AND
                                  mr.IsActive = 1 AND mr.ReportStatus = 2
	IF(@count > 0)
	Begin 
		set @retValue =  1; 
    End
	ELSE 
	 Begin 
		set @retValue =  0; 
	 END
	End
	END
	ELSE 
	Begin 
		select @PassportDocumentCount = Count(ci.id) from [Imaging].[ClaimsImage] CI
			INNER JOIN [Imaging].[Master] M ON ci.Id = m.Id
			INNER JOIN [Imaging].[Image] I ON m.ImageId = i.Id
			Where
			M.DocumentTypeId in (378,130,388,397,11,386,374)
			AND CI.claimNumber = @CompcareClaimNumber
			AND (CI.Idnumber = @IdNumber or ci.PassPortNumber = @IdNumber)
			order by 1 desc

		select @count = Count(ci.id) from [Imaging].[ClaimsImage] CI
			INNER JOIN [Imaging].[Master] M ON ci.Id = m.Id
			INNER JOIN [Imaging].[Image] I ON m.ImageId = i.Id
			Where
			M.DocumentTypeId in (29,337)
			AND CI.claimNumber = @CompcareClaimNumber
			AND (CI.Idnumber = @IdNumber or ci.PassPortNumber = @IdNumber)
			order by 1 desc

	 IF(@count = 0)
		BEGIN 
			select @count = Count(MI.id) from [Imaging].[MedicalImage] MI
			INNER JOIN [Imaging].[Master] M ON MI.Id = m.Id
			INNER JOIN [Imaging].[Image] I ON m.ImageId = i.Id
			Where
			MI.claimNumber = @CompcareClaimNumber
			AND (MI.Idnumber = @IdNumber or MI.PassPortNumber = @IdNumber)
			order by 1 desc

		END

	IF(@count > 0 AND @PassportDocumentCount > 0)
	Begin 
		set @retValue =  1; 
    End
	ELSE 
	Begin
	 Select @CompCarePersonEventId = CompCarePersonEventId from Claim.PersonEvent where CompCarePEVRefNumber = @CompcareClaimNumber

	 SELECT @count = Count(MR.PersonEventID)
                         FROM [Medical].[CompCareMedicalReport] mr
                         inner Join [claim].[CompCarePhysicalDamage] PD on mr.PersonEventId = PD.PersonEventId
                         inner Join [Medical].[CompCareICD10DiagnosticGroup] DRG on PD.ICD10DiagnosticGroupId = DRG.ICD10DiagnosticGroupId
                         WHERE mr.PersonEventID = @CompCarePersonEventId AND
                                  mr.MedicalReportTypeID in (1) AND
                                  mr.IsActive = 1 AND mr.ReportStatus = 2

	IF(@count > 0 AND @PassportDocumentCount > 0)
	Begin 
		set @retValue =  1; 
    End
	ELSE 
	 Begin 
	 set @retValue =  0; 
	 END
	End
	END
 
	return @retValue;
END