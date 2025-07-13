CREATE PROCEDURE [lead].[GetLeadStatusReport]
@LeadStatusId INT = NULL, -- 1 - new , 2 - active , 3 - declined , 4 - followup          
@ClientTypeId INT = NULL, -- 1 indivual, 2 - AFFINITY, 3 - xcompany, 4 - group indvidual, 5 - gold wage, 6 - corporate , 7 - Group
@FilterDateType INT = NULL, -- daily, weekly, monthly and yearly,
@LeadStartDate DATETIME, 
@LeadEndDate DATETIME,
@ProductId INT = NULL
AS

--Declare @LeadStatusId INT = NULL, -- 1 - new , 2 - active , 3 - declined , 4 - followup          
--@ClientTypeId INT = NULL, -- 1 indivual, 2 - AFFINITY, 3 - xcompany, 4 - group indvidual, 5 - gold wage, 6 - corporate , 7 - Group
--@FilterDateType INT = NULL, -- daily, weekly, monthly and yearly,
--@LeadStartDate DATETIME, 
--@LeadEndDate DATETIME,
--@ProductId INT = NULL


BEGIN
	SELECT 
		L.LeadId,
		L.Code,
		L.CreatedDate,
		CT.[Name] As ClientType ,
		L.DisplayName As MemberName,
		LCS.[Name] as LeadStatus,
		LC.RegistrationNumber as CompanyRegistrationNumber,
		C.Name,
		Count(LPR.LeadId) as ProductsInterestedCount,
		(Select distinct LPR.ProductId from [lead].[LeadProduct] where LeadId = L.LeadId) as ProductId,
		(Select distinct PP.Name from [Product].[Product] where Id = LPR.ProductId) as ProductName,
		Q.DeclineReason AS [DeclineReason]
	FROM [Lead].[Lead] L
	FULL JOIN [lead].[Company] LC on L.LeadId = LC.LeadId
	FULL JOIN [lead].Person LP on L.LeadId = LP.LeadId
	FULL JOIN [lead].[LeadProduct] LPR on L.Leadid = LPR.LeadId
	FULL JOIN [Product].[Product] PP on LPR.ProductId = PP.Id
	FULL JOIN [lead].Contact C on L.LeadId = C.LeadId
	FULL JOIN[quote].Quote Q on Q.QuoteId = LPR.QuoteId
	INNER JOIN [common].LeadClientStatus LCS on L.LeadClientStatusId = LCS.Id
	INNER JOIN [common].[ClientType] CT on L.ClientTypeId = CT.Id
	WHERE(@LeadStatusId IS NULL OR L.LeadClientStatusId = @LeadStatusId OR @LeadStatusId = 5  ) 
	AND (@ClientTypeId  IS NULL OR l.ClientTypeId = @ClientTypeId OR @ClientTypeId = 8 )
	AND (@LeadStartDate Is Null or  L.[CreatedDate] between @LeadStartDate and @LeadEndDate)
	AND (@ProductId  IS NULL OR PP.Id = @ProductId OR @ProductId = 0 )
	AND C.IsPreferred = 1 
	GROUP BY L.[LeadId],L.Code,L.[CreatedDate], CT.[Name],L.DisplayName,LCS.[Name],LC.RegistrationNumber,C.Name,LPR.LeadId,LPR.ProductId,PP.Name, Q.DeclineReason

END