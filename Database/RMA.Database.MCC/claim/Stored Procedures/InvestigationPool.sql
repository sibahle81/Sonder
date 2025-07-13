CREATE PROCEDURE [claim].[InvestigationPool] 
(
	@PageNumber AS INT,
	@RowsOfPage AS INT,
	@SortingCol AS VARCHAR(100) ='DateCreated',
	@SortType AS VARCHAR(100) = 'ASC',
	@SearchCreatia as VARCHAR(150) = '',
	@RecordCount INT = 0 OUTPUT
	--exec [claim].[InvestigationPool] 1,30, 'DateCreated', 'DESC','X/22201379/1/ME002273/22/???'
	--exec [claim].[InvestigationPool] 1,60, 'DateCreated', 'DESC',''
)
AS 
BEGIN
	DECLARE @Select AS NVARCHAR(MAX)
	DECLARE @SelectCount As NVARCHAR(MAX)
	DECLARE @whereStatement As NVARCHAR(MAX)
	DECLARE @suspiciousId As NVARCHAR(MAX)
	DECLARE @class4 As NVARCHAR(MAX)
	DECLARE @class13 As NVARCHAR(MAX)
	DECLARE @SelectB AS NVARCHAR(MAX)
	DECLARE @whereStatementB As NVARCHAR(MAX)
	DECLARE @claimTypeId As NVARCHAR(MAX)
	DECLARE @claimBucketClassId As NVARCHAR(MAX)
	SET @claimTypeId = (SELECT TOP 1 ID FROM common.ClaimType where [name] = 'IOD-COID')
	SET @claimBucketClassId = (SELECT TOP 1 ClaimBucketClassId FROM claim.claimbucketclass where [name] = 'Fatals')
	DECLARE @claimRef As NVARCHAR(MAX) = '%???'
	DECLARE @descriptionA As NVARCHAR(MAX) = 'Acknowledgment needed on claim(Fatal)'
	DECLARE @descriptionB As NVARCHAR(MAX) = 'Liability Decision needed on claim(Fatal)'
	DECLARE @priority As NVARCHAR(MAX) = 'P1'
	DECLARE @applicationA As NVARCHAR(MAX) = 'CompCare'
	DECLARE @applicationB As NVARCHAR(MAX) = 'Modernization'
	DECLARE @covid19 As NVARCHAR(MAX) = 'COVID-19'
	DECLARE @coida As NVARCHAR(MAX)

	--SET @suspiciousId = (SELECT ID FROM common.suspicioustransactionstatus where [name] like 'Suspicious')
	SET @class4 = (SELECT TOP 1 id FROM common.industryclass where [name] = 'Mining')
	SET @class13 = (SELECT TOP 1 id FROM common.industryclass where [name] = 'Metals')

	DECLARE @drgGroupId NVARCHAR(MAX)
	SET @drgGroupId = (SELECT TOP 1 [ICD10DiagnosticGroupId] FROM [medical].[ICD10DiagnosticGroup] WHERE 
	[Description] = 'Fatal Pensions')

	SET @coida = (SELECT TOP 1 [ParentInsuranceTypeID] FROM [claim].[ParentInsuranceType] WHERE Code = 'COIDA O/D')

	IF (@SearchCreatia != '' or @SearchCreatia != Null)
	BEGIN
       SET @whereStatement = 'Where (PE.claimTypeId = '''+@claimTypeId+''') AND (PE.personEventBucketclassId = '''+@claimBucketClassId+''')
		   AND ((C.industryClassId = '''+@class4+''' AND ACC.isRoadAccident = 1) OR C.industryClassId = '''+@class13+''')
		   AND ((PE.PersonEventReferenceNumber like ''%'+@SearchCreatia+'%'')
		   OR (P.FirstName like ''%'+@SearchCreatia+'%'') OR (P.Surname like ''%'+@SearchCreatia+'%'') 
		   OR (P.[IdNumber] like ''%'+@SearchCreatia+'%'')
		   OR (CL.[ClaimReferenceNumber] like ''%'+@SearchCreatia+'%''))'

	END
	ELSE
	BEGIN
		SET @whereStatement = 'Where cl.ClaimStatusId <> 6 AND (PE.claimTypeId = '''+@claimTypeId+''') AND (PE.personEventBucketclassId = '''+@claimBucketClassId+''')
		    AND ((C.industryClassId = '''+@class4+''' AND ACC.isRoadAccident = 1) OR C.industryClassId = '''+@class13+''')'
	END

	IF (@SearchCreatia != '' or @SearchCreatia != Null)
	BEGIN
       SET @whereStatementB = 'Where (PD.[ICD10DiagnosticGroupId] = '''+@drgGroupId+''')
	       AND ((C.industryClassId = '''+@class4+''' AND EC.Code = '''+@covid19+''') OR C.industryClassId = '''+@class13+''')
		   AND (PE.[InsuranceTypeId] = '''+@coida+''')
		   AND ((PE.PersonEventReferenceNumber like ''%'+@SearchCreatia+'%'')
		   OR (P.FirstName like ''%'+@SearchCreatia+'%'') OR (P.Surname like ''%'+@SearchCreatia+'%'') 
		   OR (P.[IdNumber] like ''%'+@SearchCreatia+'%'')
		   OR (CL.[ClaimReferenceNumber] like ''%'+@SearchCreatia+'%''))'

	END
	ELSE
	BEGIN
		SET @whereStatementB = 'Where cl.ClaimStatusId <> 6 AND (PD.[ICD10DiagnosticGroupId] = '''+@drgGroupId+''')
		   AND (PE.[InsuranceTypeId] = '''+@coida+''')
		   AND ((C.industryClassId = '''+@class4+'''AND EC.Code = '''+@covid19+''') OR C.industryClassId = '''+@class13+''')'
	END

	

	BEGIN -- CREATE TEMP TABLE

		CREATE TABLE #InvestigationPool  
		(
				PersonEventId			INT,
				ClaimNumber				VARCHAR(250),  
				[Description]			VARCHAR(250),
				EventNumber				VARCHAR(250),
				DateCreated				DATETIME,
				LifeAssured				VARCHAR(150),
				IdentificationNumber	VARCHAR(50),
				PersonEventStatusId		INT, 
				PersonEventStatusName	VARCHAR(50),
				PersonEventCreatedBy	VARCHAR(150),
				PersonEventAssignedTo	VARCHAR(150),
				LastModifiedBy			VARCHAR(150),
				bucketClassName			VARCHAR(150),
				claimTypeName			INT,
				IndustryClassName		INT,
				IsRoadAccident			BIT,
				STPExitReasonID			INT,
				[Priority]				VARCHAR(50),
				[Application]			VARCHAR(50),

				[ClaimId]				INT,
				LastWorkedOnUserId		INT,
				workPoolId				INT,
				WizardUserId			INT,
				PersonEventReference	VARCHAR(50),
				WizardId				INT,
				WizardConfigurationId	INT,
				WizardStatusId			INT,
				ClaimStatusId			INT,
				AssignedToUserId		INT,
				UserId					INT,
				LiabilityStatus			INT,
				EventType				INT,
				IsTopEmployer			BIT
				);
		
		DECLARE @Records TABLE (RecordsSelectedCount	INT);

	END

	
END
