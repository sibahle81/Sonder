CREATE PROCEDURE [digi].[RefreshICD10CodesFromSourceSystem]
 AS
  BEGIN

	DROP TABLE IF EXISTS tempdb.digi.#tempICD10Codes;

	SELECT  ICD10Level4.ICD10CodeID,  ICD10Level4.ICD10Code ICD10Level4Code
	, ICD10Level4.ICD10Code + ' - ' + ICD10Level4.Description  ICD10Level4Description ,
	ICD10Level3.Code ICD10Level3Code, ICD10Level3.Description ICD10Level3Description ,
	ICD10Level2.Code ICD10Level2Code, ICD10Level2.Description ICD10Level2Description,
	ICD10Level1.Code ICD10Level1Code, ICD10Level1.Description ICD10Level1Description,
	1 [TenantId],
	CASE ICD10Level4.IsActive WHEN 1 then 0 ELSE 1 END IsDeleted,
	GETDATE() [CreatedDate],
	'SQLJOB' [CreatedBy],
	GETDATE() ModifiedDate,
	'SQLJOB' [ModifiedBy],
	UPPER(master.dbo.fn_varbintohexstr(HASHBYTES ('SHA2_256', CONCAT(ICD10Level4.ICD10CodeID, '|',
	ICD10Level4.ICD10Code , '|',
	ICD10Level4.Description , '|',
	ICD10Level3.Code , '|',
	ICD10Level3.Description , '|',
	ICD10Level2.Code , '|',
	ICD10Level2.Description , '|',
	ICD10Level1.Code , '|',
	ICD10Level1.Description, '|',
	IIF( ICD10Level4.IsActive = 1 , 0, 1)
	)))) [Hash]
	into digi.#tempICD10Codes
	FROM [digi].[CompcareICD10Code] ICD10Level4 
	INNER JOIN [digi].[CompcareICD10SubCategory] ICD10Level3 ON ICD10Level4.ICD10SubCategoryId = ICD10Level3.ICD10SubCategoryId
	INNER JOIN [digi].[CompcareICD10Category] ICD10Level2 ON ICD10Level3.ICD10CategoryId = ICD10Level2.ICD10CategoryId
	INNER JOIN [digi].[CompcareICD10DiagnosticGroup] ICD10Level1 ON ICD10Level4.ICD10DiagnosticGroupId = ICD10Level1.ICD10DiagnosticGroupId
	ORDER BY ICD10Level4.ICD10CodeID

	MERGE [digi].[ICD10Code] digiICD10Codes
	USING digi.#tempICD10Codes digiTempICD10Codes ON digiICD10Codes.ICD10CodeID=digiTempICD10Codes.ICD10CodeID
	WHEN NOT MATCHED BY TARGET 
	THEN 
	INSERT ([ICD10CodeID],
	[ICD10Level4Code],
	[ICD10Level4Description] ,
	[ICD10Level3Code] ,
	[ICD10Level3Description] ,
	[ICD10Level2Code] ,
	[ICD10Level2Description] ,
	[ICD10Level1Code] ,
	[ICD10Level1Description] ,
	[TenantId] ,
	[IsDeleted] ,
	[Hash],
	[CreatedDate] ,
	[CreatedBy],
	[ModifiedDate],
	[ModifiedBy])
	VALUES ([ICD10CodeID],
	[ICD10Level4Code],
	[ICD10Level4Description] ,
	[ICD10Level3Code] ,
	[ICD10Level3Description] ,
	[ICD10Level2Code] ,
	[ICD10Level2Description] ,
	[ICD10Level1Code] ,
	[ICD10Level1Description] ,
	[TenantId] ,
	[IsDeleted] ,
	[Hash],
	[CreatedDate] ,
	[CreatedBy],
	[ModifiedDate],
	[ModifiedBy])
	WHEN MATCHED AND (digiTempICD10Codes.[Hash] != digiICD10Codes.[Hash]) THEN
	UPDATE SET [ICD10Level4Code] = digiTempICD10Codes.[ICD10Level4Code],
	[ICD10Level4Description] = digiTempICD10Codes.[ICD10Level4Description] ,
	[ICD10Level3Code] = digiTempICD10Codes.[ICD10Level3Code],
	[ICD10Level3Description] = digiTempICD10Codes.[ICD10Level3Description],
	[ICD10Level2Code] = digiTempICD10Codes.[ICD10Level2Code],
	[ICD10Level2Description] = digiTempICD10Codes.[ICD10Level2Description],
	[ICD10Level1Code] = digiTempICD10Codes.[ICD10Level1Code],
	[ICD10Level1Description] = digiTempICD10Codes.[ICD10Level1Description],
	[TenantId] = digiTempICD10Codes.[TenantId],
	[IsDeleted] = digiTempICD10Codes.[IsDeleted],
	[ModifiedDate] = digiTempICD10Codes.[ModifiedDate],
	[ModifiedBy] = digiTempICD10Codes.[ModifiedBy],
	[Hash] = digiTempICD10Codes.[Hash];


  END


