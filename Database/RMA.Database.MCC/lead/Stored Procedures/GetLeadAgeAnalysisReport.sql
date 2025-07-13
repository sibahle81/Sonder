CREATE PROCEDURE [lead].[GetLeadAgeAnalysisReport]
	@LeadStatusId INT = NULL,          
	@ClientTypeId INT = NULL, 
	@SLA INT = NULL, 
	@LeadStartDate DATETIME, 
	@LeadEndDate DATETIME ,
	@SLALevel1 int = 30,
	@SLALevel2 int = 60
AS


--Declare @LeadStatusId INT = NULL,          
--		@ClientTypeId INT = NULL, 
--		@SLA INT = NULL, 
--		@LeadStartDate DATETIME, 
--		@LeadEndDate DATETIME ,
--		@SLALevel1 int = 30,
--		@SLALevel2 int = 60

--Set @LeadStatusId = 2
--Set @ClientTypeId = 1
--Set @SLA = 3
--Set @LeadStartDate = '2021-01-01'
--Set @LeadEndDate = '2021-03-15'

BEGIN
	SELECT * FROM (
		SELECT Distinct
			L.Code As LeadNumber,
			L.CreatedDate As DateCreated,
			CT.[Name] As ClientType ,
			L.DisplayName As MemberName,
			LCS.[Name] As LeadStatus,
			LC.RegistrationNumber As CompanyRegistrationNumber,
			(Select Top 1 [Name] from [Lead].[Contact] where LeadId = L.LeadId) As ContactPersonName,
			(Select Count(LeadProductId) from [Lead].[LeadProduct] where LeadId = L.LeadId) As ProductsInterestedIn,
			Case 
				When L.LeadClientStatusId = 3 Then bpm.CalculateOverAllSLATimeElapsed(L.CreatedDate,L.ModifiedDate)			-- Lead Declined : Then SLA = LeadModifiedDate - LeadCreatedDate
				When (Select Count(LeadProductId) from [Lead].[LeadProduct] where LeadId = L.LeadId) > 0 Then bpm.CalculateOverAllSLATimeElapsed(Case When (select top 1 ModifiedDate from [lead].[LeadProduct] where [lead].[LeadProduct].LeadId = L.LeadId Order by ModifiedDate desc) IS NULL THEN GETDATE() Else (select top 1 ModifiedDate from [lead].[LeadProduct] where [lead].[LeadProduct].LeadId = L.LeadId Order by ModifiedDate desc) End  , GETDATE()) -- product created but Quote not created yet : Then SLA = GETDATE() - latestProductModifiedDate
				Else bpm.CalculateOverAllSLATimeElapsed(Case When (select top 1 ModifiedDate from [lead].[Lead] where [lead].[LeadId] = L.LeadId Order by ModifiedDate desc) IS NULL THEN GETDATE() Else (select top 1 ModifiedDate from [lead].[Lead] where [lead].LeadId = L.LeadId Order by ModifiedDate desc) End,GETDATE())											-- Quote not created : Then SLA = GETDATE() - LeadModifiedDate
			End As SLA,
			Case 
				When L.LeadClientStatusId = 3 Then bpm.CalculateOverAllSLADays(L.CreatedDate,L.ModifiedDate,@SLALevel1,@SLALevel2)			-- Lead Declined : Then SLA = LeadModifiedDate - LeadCreatedDate
				When (Select Count(LeadProductId) from [Lead].[LeadProduct] where LeadId = L.LeadId) > 0 Then bpm.CalculateOverAllSLADays(Case When (select top 1 ModifiedDate from [lead].[LeadProduct] where [lead].[LeadProduct].LeadId = L.LeadId Order by ModifiedDate desc) IS NULL THEN GETDATE() Else (select top 1 ModifiedDate from [lead].[LeadProduct] where [lead].[LeadProduct].LeadId = L.LeadId Order by ModifiedDate desc) End  , GETDATE(),@SLALevel1,@SLALevel2)	-- product created but Quote not created yet : Then SLA = GETDATE() - latestProductModifiedDate
				Else bpm.CalculateOverAllSLADays(Case When (select top 1 ModifiedDate from [lead].[Lead] where [lead].LeadId = L.LeadId Order by ModifiedDate desc) IS NULL THEN GETDATE() Else (select top 1 ModifiedDate from [lead].[Lead] where [lead].LeadId = L.LeadId Order by ModifiedDate desc) End,GETDATE(),@SLALevel1,@SLALevel2)											-- Quote not created : Then SLA = GETDATE() - LeadModifiedDate
			End As SLADays
		FROM [Lead].[Lead] L
		FULL JOIN [lead].[Company] LC on L.LeadId = LC.LeadId
		FULL JOIN [lead].[LeadProduct] LPR on L.Leadid = LPR.LeadId
		Full Join [lead].Contact C on L.LeadId = C.LeadId
		INNER JOIN [common].LeadClientStatus LCS on L.LeadClientStatusId = LCS.Id
		INNER JOIN [common].[ClientType] CT on L.ClientTypeId = CT.Id
		WHERE(@LeadStatusId IS NULL OR L.LeadClientStatusId = @LeadStatusId )
		AND (@ClientTypeId  IS NULL OR l.ClientTypeId = @ClientTypeId)
		AND (@LeadStartDate Is Null or  L.[CreatedDate] between @LeadStartDate and @LeadEndDate)
		--AND C.IsPreferred = 1 
		) As SlaData
	Where (@SLA IS NULL OR SLADays = @SLA )
END