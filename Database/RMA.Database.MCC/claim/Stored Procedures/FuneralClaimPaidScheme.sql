CREATE PROCEDURE [claim].[FuneralClaimPaidScheme]
 @Brokerage varchar(MAX)
AS
BEGIN
IF @Brokerage ='ALL'
  BEGIN
	WITH Scheme_CTE([Scheme],ColumnNumber) AS(
      SELECT 
         'ALL' AS [Scheme]	,
	      1 AS [ColumnNumber]
          UNION
		SELECT DISTINCT
		parp.DisplayName	[Scheme],  2 AS [ColumnNumber]
		FROM [claim].[Claim] (NOLOCK) clm 
		LEFT JOIN [claim].[PersonEvent] (NOLOCK) pe ON pe.personEventid = clm.PersonEventid 
		left JOIN [policy].[Policy] (NOLOCK) pol ON clm.PolicyId = pol.policyid
		LEFT join [product].[ProductOption] (NOLOCK) prod ON prod.id = pol.ProductOptionId
		LEFT join [product].[Product] (NOLOCK) ppr ON prod.ProductId = ppr.Id
		LEFT JOIN [client].[roleplayer](NOLOCK)rp ON rp.roleplayerid =  pe.InsuredLifeId
		LEFT join [broker].[brokerage] (NOLOCK) brg ON brg.Id =	pol.BrokerageId
		LEFT JOIN [broker].[Representative] (NOLOCK)bpre ON bpre.Id =  pol.RepresentativeId
		LEFT JOIN [policy].[Policy] papol (nolock) on paPol.PolicyId = pol.ParentPolicyId
		LEFT JOIN [client].[roleplayer] parp on parp.RolePlayerId = papol.policyOwnerId
		  )
   SELECT DISTINCT [Scheme] FROM Scheme_CTE	
   END
   ELSE
   BEGIN	
   	WITH Scheme_CTE([Scheme],ColumnNumber) AS(
      SELECT 
         'ALL' AS [Scheme]	,
	      1 AS [ColumnNumber]
          UNION
		SELECT DISTINCT
		parp.DisplayName	[Scheme],  2 AS [ColumnNumber]
		FROM [claim].[Claim] (NOLOCK) clm 
		LEFT JOIN [claim].[PersonEvent] (NOLOCK) pe ON pe.personEventid = clm.PersonEventid 
		left JOIN [policy].[Policy] (NOLOCK) pol ON clm.PolicyId = pol.policyid
		LEFT join [product].[ProductOption] (NOLOCK) prod ON prod.id = pol.ProductOptionId
		LEFT join [product].[Product] (NOLOCK) ppr ON prod.ProductId = ppr.Id
		LEFT JOIN [client].[roleplayer](NOLOCK)rp ON rp.roleplayerid =  pe.InsuredLifeId
		LEFT join [broker].[brokerage] (NOLOCK) brg ON brg.Id =	pol.BrokerageId
		LEFT JOIN [broker].[Representative] (NOLOCK)bpre ON bpre.Id =  pol.RepresentativeId
		LEFT JOIN [policy].[Policy] papol (nolock) on paPol.PolicyId = pol.ParentPolicyId
		LEFT JOIN [client].[roleplayer] parp on parp.RolePlayerId = papol.policyOwnerId
		WHERE brg.[name] IN (select value from string_split(@Brokerage,','))
		  )
   SELECT DISTINCT [Scheme] FROM Scheme_CTE		
	END	
END
GO


