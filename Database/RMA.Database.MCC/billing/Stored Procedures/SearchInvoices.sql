

-- =============================================
-- Author:		Gram
-- Create date: 04/03/2020
-- Modified:		Bongani Makelane
-- Modified date: 19/11/2021
-- =============================================
CREATE PROCEDURE [billing].[SearchInvoices]
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

	--declare @coidProductId int = (select [Value] from common.Settings where [Key] = 'COIDProductId');

	declare @coidProductIds table (productId int)

insert into @coidProductIds
select id from product.product where ProductClassId in (select id from common.ProductClass where id =1 )--Statutory

	IF(@ShowActive = 1)
	BEGIN	
	
	 Select @recordCount =  count  (Invoice.InvoiceId)
	 FROM billing.Invoice Invoice 
		INNER JOIN billing.Transactions T ON T.InvoiceId = Invoice.InvoiceId
		INNER JOIN policy.Policy Policy ON Invoice.PolicyId = Policy.PolicyId
		INNER JOIN client.RolePlayer RolePlayer ON RolePlayer.RolePlayerId = Policy.Policypayeeid
		INNER JOIN [common].[InvoiceStatus] InvoiceStatus ON InvoiceStatus.Id = Invoice.InvoiceStatusId
		INNER JOIN [client].[Company] Company ON RolePlayer.RolePlayerId = Company.RolePlayerId
		INNER JOIN [product].[ProductOption](NOLOCK) po on po.Id = Policy.ProductOptionId
		LEFT JOIN client.Person Person ON Person.RolePlayerId = RolePlayer.RolePlayerId
		LEFT JOIN [client].[FinPayee] FinPayee ON RolePlayer.RolePlayerId = FinPayee.RolePlayerId
		LEFT JOIN [client].[RolePlayerContact] RC ON RC.RolePlayerId = Company.RolePlayerId
		LEFT JOIN [client].[RolePlayerContactInformation] RCI ON RCI.RolePlayerContactId = RC.RolePlayerContactId
		WHERE Policy.IsDeleted = 0 AND RolePlayer.IsDeleted = 0 AND RolePlayer.RolePlayerIdentificationTypeId = 2 AND T.TransactionTypeId = 6
		and isnull(iif(RCI.ContactInformationTypeId = 1, 1, iif(RC.ContactDesignationTypeId = 4, 1, iif(Company.RolePlayerId is not null, 1, 1))), 1) = 1 --Invoice
	and ( RolePlayer.DisplayName like '%' + @Filter+ '%' 
	OR Person.IdNumber LIKE '%' + @Filter+ '%'  
	OR Company.ReferenceNumber LIKE '%' + @Filter+ '%'
	OR FinPayee.FinPayeNumber LIKE '%' + @Filter+ '%'
	OR [Policy].PolicyNumber LIKE '%' + @Filter+ '%'
	OR Invoice.InvoiceNumber LIKE '%' + @Filter+ '%' 	
	OR Person.FirstName like '%' +@Filter + '%' 
	OR Person.Surname like '%' + @Filter + '%'
	 ) 	
	 --print @recordCount

		SELECT distinct
			Policy.PolicyPayeeId RolePlayerId,
			Company.Name FirstName,
			'' Surname,
			isnull(Person.DateOfBirth, '1960-01-01'),
			Person.IdNumber,
			isnull(Person.IsAlive, 1) IsAlive,
			Person.DateOfDeath,
			Person.DeathCertificateNumber,
			isnull(Person.IsVopdVerified, 0) IsVopdVerified,
			isnull(Person.IsStudying, 0) IsStudying,
			isnull(Person.IsDisabled, 0) IsDisabled,
			isnull(RC.ContactNumber, RolePlayer.CellNumber) CellNumber,
			isnull(RC.EmailAddress, RolePlayer.EmailAddress) EmailAddress,
			'' Name,
			'Policy Owner' RolePlayerTypeName,
			Policy.PolicyId,
			0 RolePlayerTypeId,
			0 CommunicationTypeId,
			Policy.PolicyNumber,
			ISNULL(Company.[ReferenceNumber],'') IndustryNumber,
			ISNULL(FinPayee.[FinPayeNumber],'') EmployeeNumber,
			Invoice.InvoiceId,
		    Invoice.InvoiceNumber,
			InvoiceStatus.Name InvoiceStatus,
			Invoice.TotalInvoiceAmount InvoiceAmount,
			Invoice.SourceModuleId,
			Invoice.SourceProcessId,
			Company.Name CompanyName,
			 case (select TOP 1 pr.Id from [product].[Product](NOLOCK) pr where pr.Id = po.ProductId and pr.Id in (select productId from @coidProductIds))
			 when null then 1 else 2 end InvoiceType,
            dbo.GetTransactionBalance(T.TransactionId) InvoiceBalance,
			FinPayee.FinPayeNumber,
		   invoice.InvoiceDate
		FROM billing.Invoice Invoice 
		INNER JOIN billing.Transactions T ON T.InvoiceId = Invoice.InvoiceId
		INNER JOIN policy.Policy Policy ON Invoice.PolicyId = Policy.PolicyId
		INNER JOIN client.RolePlayer RolePlayer ON RolePlayer.RolePlayerId = Policy.Policypayeeid
		INNER JOIN [common].[InvoiceStatus] InvoiceStatus ON InvoiceStatus.Id = Invoice.InvoiceStatusId
		left JOIN [common].[SourceProcess] SourceProcess On SourceProcess.id = Invoice.SourceProcessId
		left JOIN [common].[SourceModule] SourceModule on SourceModule.id = Invoice.SourceModuleId
		INNER JOIN [client].[Company] Company ON RolePlayer.RolePlayerId = Company.RolePlayerId
		INNER JOIN [product].[ProductOption](NOLOCK) po on po.Id = Policy.ProductOptionId
		LEFT JOIN client.Person Person ON Person.RolePlayerId = RolePlayer.RolePlayerId
		LEFT JOIN [client].[FinPayee] FinPayee ON RolePlayer.RolePlayerId = FinPayee.RolePlayerId
		LEFT JOIN [client].[RolePlayerContact] RC ON RC.RolePlayerId = Company.RolePlayerId
		LEFT JOIN [client].[RolePlayerContactInformation] RCI ON RCI.RolePlayerContactId = RC.RolePlayerContactId
		WHERE Policy.IsDeleted = 0 AND RolePlayer.IsDeleted = 0 AND RolePlayer.RolePlayerIdentificationTypeId = 2 AND T.TransactionTypeId = 6
		and isnull(iif(RCI.ContactInformationTypeId = 1, 1, iif(RC.ContactDesignationTypeId = 4, 1, iif(Company.RolePlayerId is not null, 1, 1))), 1) = 1 --Invoice
	and ( RolePlayer.DisplayName like '%' + @Filter+ '%' 
	OR Person.IdNumber LIKE '%' + @Filter+ '%'  
	OR Company.ReferenceNumber LIKE '%' + @Filter+ '%'
	OR FinPayee.FinPayeNumber LIKE '%' + @Filter+ '%'
	OR [Policy].PolicyNumber LIKE '%' + @Filter+ '%'
	OR Invoice.InvoiceNumber LIKE '%' + @Filter+ '%' 	
	OR Person.FirstName like '%' +@Filter + '%' 
	OR Person.Surname like '%' + @Filter + '%'
	 ) ORDER BY invoice.InvoiceId desc  OFFSET (@pageNumber* @pageSize) rows FETCH NEXT @pageSize rows ONLY		 
	
	END
	ELSE  
	BEGIN
	--------------------------------------------------------------------------- Inactive Policies + Claims --------------------------------------------------
		 Select @recordCount = count (Invoice.InvoiceId)		  
		FROM billing.Invoice Invoice
		INNER JOIN billing.Transactions T ON T.InvoiceId = Invoice.InvoiceId 
		INNER JOIN policy.Policy Policy ON Invoice.PolicyId = Policy.PolicyId
		INNER JOIN client.RolePlayer RolePlayer ON RolePlayer.RolePlayerId = Policy.Policypayeeid
		INNER JOIN [common].[InvoiceStatus] InvoiceStatus ON InvoiceStatus.Id = Invoice.InvoiceStatusId
				left JOIN [common].[SourceProcess] SourceProcess On SourceProcess.id = Invoice.SourceProcessId
		left JOIN [common].[SourceModule] SourceModule on SourceModule.id = Invoice.SourceModuleId
		INNER JOIN client.Person Person ON Person.RolePlayerId = RolePlayer.RolePlayerId
		INNER JOIN [client].[Company] Company ON RolePlayer.RolePlayerId = Company.RolePlayerId
		inner join [product].[ProductOption](NOLOCK) po on po.Id = Policy.ProductOptionId
		LEFT JOIN [client].[FinPayee] FinPayee ON RolePlayer.RolePlayerId = FinPayee.RolePlayerId
		WHERE Policy.IsDeleted = 1 AND RolePlayer.IsDeleted = 1 AND RolePlayer.RolePlayerIdentificationTypeId = 2 AND T.TransactionTypeId = 6
		and ( RolePlayer.DisplayName like '%' + @Filter+ '%' 
	OR Person.IdNumber LIKE '%' + @Filter+ '%'  
	OR Company.ReferenceNumber LIKE '%' + @Filter+ '%'
	OR FinPayee.FinPayeNumber LIKE '%' + @Filter+ '%'
	OR [Policy].PolicyNumber LIKE '%' + @Filter+ '%'
	OR Invoice.InvoiceNumber LIKE '%' + @Filter+ '%' 	
	OR Person.FirstName like '%' +@Filter + '%' 
	OR Person.Surname like '%' + @Filter + '%'
	 )

	  --print @recordCount		
		SELECT distinct
			Person.RolePlayerId,
			Company.Name FirstName,
			'' Surname,
			Person.DateOfBirth,
			Person.IdNumber,
			Person.IsAlive,
			Person.DateOfDeath,
			Person.DeathCertificateNumber,
			Person.IsVopdVerified,
			Person.IsStudying,
			Person.IsDisabled,
			RolePlayer.CellNumber,
			RolePlayer.EmailAddress,
			'' Name,
			'Policy Owner' RolePlayerTypeName,
			Policy.PolicyId,
			0 RolePlayerTypeId,
			0 CommunicationTypeId,
			Policy.PolicyNumber,
			ISNULL(Company.[ReferenceNumber],'') IndustryNumber,
			ISNULL(FinPayee.[FinPayeNumber],'') EmployeeNumber,
			Invoice.InvoiceId,
		    Invoice.InvoiceNumber,
			InvoiceStatus.Name InvoiceStatus,
			Invoice.TotalInvoiceAmount InvoiceAmount,
			Company.Name CompanyName,
			 case (select TOP 1 pr.Id from [product].[Product](NOLOCK) pr where pr.Id = po.ProductId and pr.Id in (select productId from @coidProductIds))
			 when null then 1 else 2 end InvoiceType,
            dbo.GetTransactionBalance(T.TransactionId) InvoiceBalance,
			FinPayee.FinPayeNumber,
		   invoice.InvoiceDate
		FROM billing.Invoice Invoice
		INNER JOIN billing.Transactions T ON T.InvoiceId = Invoice.InvoiceId 
		INNER JOIN policy.Policy Policy ON Invoice.PolicyId = Policy.PolicyId
		INNER JOIN client.RolePlayer RolePlayer ON RolePlayer.RolePlayerId = Policy.Policypayeeid
		INNER JOIN [common].[InvoiceStatus] InvoiceStatus ON InvoiceStatus.Id = Invoice.InvoiceStatusId
		left JOIN [common].[SourceProcess] SourceProcess On SourceProcess.id = Invoice.SourceProcessId
		left JOIN [common].[SourceModule] SourceModule on SourceModule.id = Invoice.SourceModuleId
		INNER JOIN client.Person Person ON Person.RolePlayerId = RolePlayer.RolePlayerId
		INNER JOIN [client].[Company] Company ON RolePlayer.RolePlayerId = Company.RolePlayerId
		inner join [product].[ProductOption](NOLOCK) po on po.Id = Policy.ProductOptionId
		LEFT JOIN [client].[FinPayee] FinPayee ON RolePlayer.RolePlayerId = FinPayee.RolePlayerId
		WHERE Policy.IsDeleted = 1 AND RolePlayer.IsDeleted = 1 AND RolePlayer.RolePlayerIdentificationTypeId = 2 AND T.TransactionTypeId = 6
		and ( RolePlayer.DisplayName like '%' + @Filter+ '%' 
	OR Person.IdNumber LIKE '%' + @Filter+ '%'  
	OR Company.ReferenceNumber LIKE '%' + @Filter+ '%'
	OR FinPayee.FinPayeNumber LIKE '%' + @Filter+ '%'
	OR [Policy].PolicyNumber LIKE '%' + @Filter+ '%'
	OR Invoice.InvoiceNumber LIKE '%' + @Filter+ '%' 	
	OR Person.FirstName like '%' +@Filter + '%' 
	OR Person.Surname like '%' + @Filter + '%'
	 )
	 ORDER BY invoice.InvoiceId desc  OFFSET (@pageNumber* @pageSize) rows FETCH NEXT @pageSize rows ONLY

	END
END

