CREATE PROCEDURE [claim].[FuneralClaimCapturedChannels]
 @Brokerage varchar(MAX)
AS
BEGIN
IF @Brokerage ='All'
  BEGIN
	WITH Channel_CTE([Channel],ColumnNumber) AS(
      SELECT 
         'ALL' AS [Channel]	,
	      1 AS [ColumnNumber]
          UNION
		SELECT DISTINCT
            channel.name	 [Channel]	, 2 AS [ColumnNumber]		
    FROM [claim].[Claim] (NOLOCK) clm 
    LEFT JOIN [claim].[PersonEvent] (NOLOCK) pe ON pe.personEventid = clm.PersonEventid 
    LEFT JOIN [policy].[Policy] (NOLOCK) pol ON clm.PolicyId = pol.policyid
	LEFT JOIN [product].[ProductOption] (NOLOCK) prod ON prod.id = pol.ProductOptionId
	LEFT JOIN [product].[Product] (NOLOCK) ppr ON prod.ProductId = ppr.Id
	LEFT JOIN [broker].[brokerage] (NOLOCK) brg ON brg.Id =	pol.BrokerageId
	LEFT JOIN [client].[roleplayer](NOLOCK)rp ON rp.roleplayerid =  pe.InsuredLifeId
	LEFT JOIN [common].communicationtype(NOLOCK) channel ON channel.id = rp.PreferredCommunicationTypeId
		  )
   SELECT DISTINCT [Channel] FROM Channel_CTE		
   END	
ELSE
	BEGIN
		WITH Channel_CTE([Channel],ColumnNumber) AS(
		  SELECT 
         'ALL' AS [Channel]	,
	      1 AS [ColumnNumber]
          UNION
		SELECT DISTINCT
            channel.name	 [Channel]	, 2 AS [ColumnNumber]		
		FROM [claim].[Claim] (NOLOCK) clm 
		LEFT JOIN [claim].[PersonEvent] (NOLOCK) pe ON pe.personEventid = clm.PersonEventid 
		LEFT JOIN [policy].[Policy] (NOLOCK) pol ON clm.PolicyId = pol.policyid
		LEFT JOIN [product].[ProductOption] (NOLOCK) prod ON prod.id = pol.ProductOptionId
		LEFT JOIN [product].[Product] (NOLOCK) ppr ON prod.ProductId = ppr.Id
		LEFT JOIN [broker].[brokerage] (NOLOCK) brg ON brg.Id =	pol.BrokerageId
		LEFT JOIN [client].[roleplayer](NOLOCK)rp ON rp.roleplayerid =  pe.InsuredLifeId
		LEFT JOIN [common].communicationtype(NOLOCK) channel ON channel.id = rp.PreferredCommunicationTypeId
		where  brg.name IN (select value from string_split(@Brokerage,','))
		  )
		SELECT DISTINCT [Channel] FROM Channel_CTE	
	END
END
GO