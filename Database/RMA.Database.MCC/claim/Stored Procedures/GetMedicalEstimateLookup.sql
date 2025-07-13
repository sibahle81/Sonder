
CREATE PROCEDURE [claim].[GetMedicalEstimateLookup]
	@EventTypeId int,
	@ICD10Codes varChar(250), 
	@ReportDate DateTime
AS
BEGIN

CREATE TABLE #ICD10CodeEstimateLookup(
    ICD10CodeEstimateLookupId int null,
    [ICD10Code]  varchar(50) NULL,
    [ICD10DiagnosticGroupId] int NULL,
    [MedicalMinimumCost] decimal NULL,
    [MedicalAverageCost] decimal NULL,
	[MedicalMaximumCost] decimal NULL,
	[PDExtentMinimum] decimal NULL,
    [PDExtentAverage] decimal NULL,
	[PDExtentMaximum] decimal NULL,
	[DaysOffMinimum] decimal NULL,
    [DaysOffAverage] decimal NULL,
	[DaysOffMaximum] decimal NULL,
	)
	

--exec [claim].[GetMedicalEstimateLookup] 1, 'S60.0 S70.0', '2022-08-08 08:13:50.333'

	DECLARE @ICD10CodeIds varchar(200),
			@ICD10GroupMapIds varchar(200)
	SELECT 
		@ICD10CodeIds = COALESCE(@ICD10CodeIds + ',', '') + CAST(ICD10CodeId AS VARCHAR(5))
	FROM  [medical].[ICD10Code] (NOLOCK)  
	WHERE (ICD10Code in (SELECT TRIM(value) FROM STRING_SPLIT(@ICD10Codes, ',')) 
		  OR ICD10Code in (SELECT TRIM(value) FROM STRING_SPLIT(@ICD10Codes, '/')) 
		  OR ICD10Code in (SELECT TRIM(value) FROM STRING_SPLIT(@ICD10Codes, ' ')))

	Select @ICD10GroupMapIds = COALESCE(@ICD10GroupMapIds + ',', '') + CAST(ICD10GroupMapId AS VARCHAR(20)) 
	from [medical].[ICD10GroupMap] 
	where eventtypeid = @EventTypeId and ICD10CodeId in (SELECT TRIM(value) FROM STRING_SPLIT(@ICD10CodeIds, ','))

	INSERT INTO #ICD10CodeEstimateLookup
	Select	ICDL.ICD10CodeEstimateLookupId,
			ICD.ICD10Code as [ICD10Code],
			DRG.ICD10DiagnosticGroupId as [ICD10DiagnosticGroupId],
			MCL.Minimum as [MedicalMinimumCost],
			MCL.Average as [MedicalAverageCost],	 
			MCL.Maximum as [MedicalMaximumCost],	 
			PD.Minimum as [PDExtentMinimum],
			PD.Average as [PDExtentAverage],
			PD.Maximum as [PDExtentMaximum],
			DOL.Minimum as [DaysOffMinimum],
			DOL.Average as [DaysOffAverage],
			DOL.Maximum as [DaysOffMaximum]
	from
	[claim].[ICD10CodeEstimateLookup] ICDL (NOLOCK)
	Inner Join claim.MedicalCostLookup MCL (NOLOCK) on MCL.MedicalCostLookupId = ICDL.MedicalCostLookupId
	Inner Join claim.PDExtentLookup PD (NOLOCK) on PD.PDExtentLookupId = ICDL.PDExtentLookupId
	Inner Join claim.DaysOffLookup DOL (NOLOCK) on DOL.DaysOffLookupId = ICDL.DaysOffLookupId
	Inner Join [medical].[ICD10GroupMap] GM (NOLOCK) on GM.ICD10GroupMapId = ICDL.ICD10GroupMapId
	inner join [medical].[ICD10Code] ICD (NOLOCK) on GM.ICD10CodeId = ICD.ICD10CodeId
	inner join [medical].[ICD10DiagnosticGroup] DRG (NOLOCK) on GM.ICD10DiagnosticGroupId = DRG.ICD10DiagnosticGroupId
	Where ICDL.ICD10GroupMapId in (SELECT TRIM(value) FROM STRING_SPLIT(@ICD10GroupMapIds, ','))
	and ICDL.EndDate > @ReportDate And ICDL.StartDate < @ReportDate

	IF (not exists (select 1 from #ICD10CodeEstimateLookup))
	BEGIN
		Declare @ICD10DiagnosticGroupId int
		SELECT @ICD10DiagnosticGroupId = ICD10DiagnosticGroupId FROM [medical].[ICD10GroupMap] GM 
		inner join [medical].[ICD10Code] ICD ON GM.ICD10CodeId = ICD.ICD10CodeId
		WHERE ICD.ICD10Code in (SELECT TRIM(value) FROM STRING_SPLIT(@ICD10Codes, ',')) 
		  OR ICD10Code in (SELECT TRIM(value) FROM STRING_SPLIT(@ICD10Codes, '/')) 
		  OR ICD10Code in (SELECT TRIM(value) FROM STRING_SPLIT(@ICD10Codes, ' '))

		INSERT INTO #ICD10CodeEstimateLookup
		Select 
		0 AS ICD10CodeEstimateLookupId,
		MI.[ICD10Code] AS [ICD10Code],
		@ICD10DiagnosticGroupId AS ICD10DiagnosticGroupId,
		C.Minimum as [MedicalMinimumCost],
		C.Average as [MedicalAverageCost],	 
		C.Maximum as [MedicalMaximumCost],	 
		D.Minimum as [PDExtentMinimum],
		D.Average as [PDExtentAverage],
		D.Maximum as [PDExtentMaximum],
		E.Minimum as [DaysOffMinimum],
		E.Average as [DaysOffAverage],
		E.Maximum as [DaysOffMaximum]
		from [medical].[ICD10Code] MI
 		 INNER JOIN [medical].[ICD10ProductCode_temp] MPC ON MI.ICD10CodeId = MPC.ICD10CodeID
		INNER JOIN [claim].[MedicalCostLookup] C ON MPC.CostLookupId = C.[MedicalCostLookupId]
		INNER JOIN [medical].[DaysLookup_Temp] D ON MPC.DaysLookupId = D.[DaysLookupID]
		INNER JOIN [claim].[PDExtentLookup] E ON MPC.PDExtentLookupId = E.[PDExtentLookupID]
 		where MI.ICD10Code in (SELECT TRIM(value) FROM STRING_SPLIT(@ICD10Codes, ',')) 
		  OR ICD10Code in (SELECT TRIM(value) FROM STRING_SPLIT(@ICD10Codes, '/')) 
		  OR ICD10Code in (SELECT TRIM(value) FROM STRING_SPLIT(@ICD10Codes, ' '))
	END

	Select * from #ICD10CodeEstimateLookup
	drop table #ICD10CodeEstimateLookup
END
