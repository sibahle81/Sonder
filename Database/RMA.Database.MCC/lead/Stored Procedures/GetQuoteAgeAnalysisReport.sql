CREATE PROCEDURE [lead].[GetQuoteAgeAnalysisReport]
	@QuoteStatusId INT = NULL,          
	@ClientTypeId INT = NULL, 
	@SLA INT = NULL, 
	@QuoteStartDate DATETIME, 
	@QuoteEndDate DATETIME ,
	@PeriodType INT = NULL -- daily, weekly, monthly and yearly,
AS

Declare @SLALevel1 int = 30,
		@SLALevel2 int = 60,
		@PeriodDate DateTime = NULL

--Declare @QuoteStatusId INT = NULL,          
--	@ClientTypeId INT = NULL, 
--	@SLA INT = NULL, 
--	@QuoteStartDate DATETIME, 
--	@QuoteEndDate DATETIME ,
--	@PeriodType INT -- daily, weekly, monthly and yearly,


--Set @QuoteStatusId = 2
--Set @ClientTypeId = 1
--Set @SLA = 3
--Set @QuoteStartDate = '2021-01-01'
--Set @QuoteEndDate = '2021-04-06'
--Set @PeriodType = 4

IF(@PeriodType IS NOT NULL)
	BEGIN
		Select @PeriodDate =
			Case When @PeriodType = 1 Then DATEADD(DAY, DATEDIFF(DAY, 0, GETDATE() -0), 0)
				 When @PeriodType = 2 Then DATEADD(WEEK, DATEDIFF(WEEK, -1, GETDATE()), -1)
				 When @PeriodType = 3 Then DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0) 
				 When @PeriodType = 4 Then DATEADD(YEAR, DATEDIFF(YEAR, 0, GETDATE()), 0) 
		End
	END

BEGIN
	SELECT * FROM (
		SELECT Distinct
			QT.QuoteNumber As QuoteNumber,
			QT.QuoteStatusId As QuoteStatusId,
			QS.Name As QuoteStatus,
			QT.CreatedDate As QuoteCreatedDate,
			L.Code As LeadNumber,
			L.CreatedDate As DateCreated,
			CT.[Name] As ClientType ,
			L.DisplayName As MemberName,
			--LCS.[Name] As LeadStatus,
			LC.RegistrationNumber As CompanyRegistrationNumber,
			(Select Top 1 [Name] from [Lead].[Contact] where LeadId = L.LeadId) As ContactPersonName,
			(Select Count(LeadProductId) from [Lead].[LeadProduct] where LeadId = L.LeadId) As ProductsInterestedIn,
			Case
				When QT.QuoteStatusId in (1,4,7) Then bpm.CalculateOverAllSLATimeElapsed(QT.ModifiedDate, GETDATE())		--1	New, 4	Pending Approval, 7	Quoted
				Else bpm.CalculateOverAllSLATimeElapsed(QT.CreatedDate, QT.ModifiedDate)									--2	Approved, 3	Rejected, 5	Accepted, 6	Declined
			End As SLA,
			Case 
				When QT.QuoteStatusId in (1,4,7) Then bpm.CalculateOverAllSLADays(QT.ModifiedDate,GETDATE(),@SLALevel1,@SLALevel2)			--1	New, 4	Pending Approval, 7	Quoted
				Else bpm.CalculateOverAllSLADays(QT.CreatedDate,QT.ModifiedDate,@SLALevel1,@SLALevel2)										--2	Approved, 3	Rejected, 5	Accepted, 6	Declined
			End As SLADays
		FROM [Lead].[Lead] L
		FULL JOIN [lead].[Company] LC on L.LeadId = LC.LeadId
		FULL JOIN [lead].[LeadProduct] LPR on L.Leadid = LPR.LeadId
		Full Join [lead].Contact C on L.LeadId = C.LeadId
		INNER JOIN [common].[ClientType] CT on L.ClientTypeId = CT.Id
		INNER JOIN [Quote].[Quote] QT on QT.QuoteID = LPR.QuoteId
		INNER JOIN [common].[QuoteStatus] QS on QS.Id = QT.QuoteStatusId
		WHERE(@QuoteStatusId IS NULL OR QT.QuoteStatusId = @QuoteStatusId )
		AND (@ClientTypeId  IS NULL OR l.ClientTypeId = @ClientTypeId)
		AND (@QuoteStartDate Is Null or  (QT.[CreatedDate] >= @QuoteStartDate and QT.[CreatedDate] <= CONVERT(DATETIME, CONVERT(VARCHAR(11),@QuoteEndDate, 111 ) + ' 23:59:59', 111)))
		AND (@PeriodDate  IS NULL OR QT.CreatedDate >= @PeriodDate)
		--AND C.IsPreferred = 1 
		) As SlaData
	Where (@SLA IS NULL OR SLADays = @SLA )
END