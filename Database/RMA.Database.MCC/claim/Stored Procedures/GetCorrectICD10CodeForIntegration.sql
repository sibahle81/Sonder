CREATE PROCEDURE [claim].[GetCorrectICD10CodeForIntegration]
(
 @CompcarePersonEventId int,
  @ICD10CodeId int

 -- EXEC [claim].[GetCorrectICD10CodeForIntegration] 1614645, 288
)
AS
DECLARE @ICD10Code varchar(15) = NULL
IF((SELECT Count(*) FROM [medical].[CompCareMedicalReport] WHERE PersonEventId = @CompcarePersonEventId) > 0)
BEGIN
	SELECT @ICD10Code = ICD10Codes from [medical].[CompCareMedicalReport] where PersonEventId = @CompcarePersonEventId
	IF(@ICD10Code LIKE '%/%')
	BEGIN
	  SET @ICD10Code = (SELECT TOP 1 [Data] FROM [dbo].[Split](@ICD10Code, '/'))
	END
	ELSE
	BEGIN
	 SET @ICD10Code = (SELECT TOP 1 [Data] FROM [dbo].[Split](@ICD10Code, ' '))
	END
	IF(LEN(@ICD10Code) > 0)
	BEGIN 
	  SELECT ICD10CodeId from medical.ICD10Code WHERE ICD10Code = @ICD10Code
	END
	IF(LEN(@ICD10Code) = 0)
	BEGIN 
	  SELECT ICD10CodeId from medical.ICD10Code WHERE ICD10CodeId = @ICD10CodeId
	END
END
ELSE IF((SELECT Count(*) FROM [Imaging].[ClaimsImage] CI 
	INNER JOIN [Imaging].[Master] M ON ci.Id = m.Id
	WHERE M.DocumentTypeId in (29,337)
	AND claimNumber = (SELECT PEVFileRefNumber FROM [compcare].PersonEvent WHERE PersonEventId = @CompcarePersonEventId)) > 0)
BEGIN
    SELECT @ICD10Code = CI.ICD10Codes FROM [Imaging].[ClaimsImage] CI 
	INNER JOIN [Imaging].[Master] M ON ci.Id = m.Id
	WHERE M.DocumentTypeId in (29,337)
	AND claimNumber = (SELECT PEVFileRefNumber FROM [compcare].PersonEvent WHERE PersonEventId = @CompcarePersonEventId)
    IF(@ICD10Code LIKE '%/%')
	BEGIN
	  SET @ICD10Code = (SELECT TOP 1 [Data] FROM [dbo].[Split](@ICD10Code, '/'))
	END
	ELSE
	BEGIN
	 SET @ICD10Code = (SELECT TOP 1 [Data] FROM [dbo].[Split](@ICD10Code, ' '))
	END
	IF(LEN(@ICD10Code) > 0)
	BEGIN 
	  SELECT ICD10CodeId from medical.ICD10Code WHERE ICD10Code = @ICD10Code
	END
	IF(LEN(@ICD10Code) = 0)
	BEGIN 
	  SELECT ICD10CodeId from medical.ICD10Code WHERE ICD10CodeId = @ICD10CodeId
	END
END
ELSE
BEGIN
	Select @ICD10Code = ICD10Code from [medical].[CompCareICD10Code] where ICD10CodeID = @ICD10CodeId

	Select ICD10CodeId from medical.ICD10Code where ICD10Code = @ICD10Code
	PRINT @ICD10Code
END