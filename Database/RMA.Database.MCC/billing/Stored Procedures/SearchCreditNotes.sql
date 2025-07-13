

-- =============================================
-- Author:		Bongani Makelane
-- Create date: 10/10/2023
-- =============================================
CREATE PROCEDURE [billing].[SearchCreditNotes]  --1,'ma029136',1,0,5,NULL
	@FilterType INT = NULL,
	@Filter VARCHAR(50),
	@ShowActive bit = 1,
	@pageNumber int=0,
	@pageSize int =5,
	@recordCount int Output
AS
BEGIN		
	--Remove the spaces
	SET @Filter = RTRIM(LTRIM(@Filter))

	 Select @recordCount = count (T.TransactionId)
	 FROM  billing.Transactions T (NOLOCK)
		left JOIN billing.Invoice Invoice (NOLOCK)  ON T.InvoiceId = Invoice.InvoiceId
		left JOIN policy.Policy Policy (NOLOCK) ON Invoice.PolicyId = Policy.PolicyId  and Policy.IsDeleted <> 1
		left JOIN client.RolePlayer RolePlayer ON RolePlayer.RolePlayerId = T.RolePlayerId
		left JOIN [client].[Company] Company (NOLOCK) ON RolePlayer.RolePlayerId = Company.RolePlayerId
		LEFT JOIN [client].[FinPayee] FinPayee (NOLOCK) ON RolePlayer.RolePlayerId = FinPayee.RolePlayerId
	outer apply ( select top 1 emailaddress,ContactNumber,RolePlayerContactId from [client].[RolePlayerContact] rcc where rcc.roleplayerid= Company.RolePlayerId) rc
		LEFT JOIN [client].[RolePlayerContactInformation] RCI (NOLOCK) ON RCI.RolePlayerContactId = RC.RolePlayerContactId
		WHERE  RolePlayer.IsDeleted <> 1 and t.transactiontypeid =4
	and ( RolePlayer.DisplayName like '%' + @Filter+ '%' 
	OR Company.ReferenceNumber LIKE '%' + @Filter+ '%'
	OR FinPayee.FinPayeNumber LIKE '%' + @Filter+ '%'
	OR [Policy].PolicyNumber LIKE '%' + @Filter+ '%'
	OR T.RmaReference LIKE '%' + @Filter+ '%'
	 ) 	
	 print @recordCount

		SELECT distinct
			T.RolePlayerId,	
			isnull(RC.ContactNumber, RolePlayer.CellNumber) CellNumber,
			isnull(RC.EmailAddress, RolePlayer.EmailAddress) EmailAddress,			
			ISNull(Policy.PolicyId,0) policyid,
			Policy.PolicyNumber,
			ISNULL(Company.[ReferenceNumber],'') IndustryNumber,
		    t.RmaReference DocumentReference,
			t.Amount Amount,
			Invoice.SourceModuleId,
			Invoice.SourceProcessId,
			FinPayee.FinPayeNumber,
		   t.TransactionDate,
		   t.TransactionId
		FROM billing.Transactions T (NOLOCK)
	left	 JOIN billing.Invoice Invoice (NOLOCK)  ON T.InvoiceId = Invoice.InvoiceId
	left	 JOIN policy.Policy Policy ON Invoice.PolicyId = Policy.PolicyId  and Policy.IsDeleted <> 1
		left JOIN client.RolePlayer RolePlayer (NOLOCK) ON RolePlayer.RolePlayerId = T.RolePlayerId
		left JOIN [common].[SourceProcess] SourceProcess On SourceProcess.id = Invoice.SourceProcessId
		left JOIN [common].[SourceModule] SourceModule  on SourceModule.id = Invoice.SourceModuleId
		left JOIN [client].[Company] Company (NOLOCK) ON RolePlayer.RolePlayerId = Company.RolePlayerId
		LEFT JOIN [client].[FinPayee] FinPayee (NOLOCK) ON RolePlayer.RolePlayerId = FinPayee.RolePlayerId
		outer apply ( select top 1 emailaddress,ContactNumber,RolePlayerContactId from [client].[RolePlayerContact] rcc where rcc.roleplayerid= Company.RolePlayerId) rc
		LEFT JOIN [client].[RolePlayerContactInformation] RCI (NOLOCK) ON RCI.RolePlayerContactId = RC.RolePlayerContactId
		WHERE  RolePlayer.IsDeleted <> 1 and t.transactiontypeid =4
		 and t.isdeleted <> 1
	and ( RolePlayer.DisplayName like '%' + @Filter+ '%' 
	OR Company.ReferenceNumber LIKE '%' + @Filter+ '%'
	OR FinPayee.FinPayeNumber LIKE '%' + @Filter+ '%'
	OR [Policy].PolicyNumber LIKE '%' + @Filter+ '%'
	OR T.RmaReference LIKE '%' + @Filter+ '%' 
	 ) ORDER BY T.transactionId desc  OFFSET (@pageNumber* @pageSize) rows FETCH NEXT @pageSize rows ONLY		 
	
END