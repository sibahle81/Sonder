

CREATE   PROCEDURE [billing].[CoidInvoice]
    @invoiceId int
	as 
	begin

          --InvoiceData
          BEGIN TRY 
          SELECT TOP 1 i.InvoiceNumber as docNo,Case when i.InvoiceDate > getdate() then CONVERT(VARCHAR,i.InvoiceDate,23) else  CONVERT(VARCHAR, i.CreatedDate, 23) end as docDate,
		  crc.FirstName + ' ' + crc.Surname AS [CantactName],
          pr.[Name] as product, p.PolicyNumber as policyNo, po.[Name] as productOption,
          isnull(invRpt.ClientCompanyName , policyOwner.DisplayName) as DisplayName , isnull(invRpt.AddressLine1 , isnull(RolePlayerAddress.AddressLine1,'')) as addressLine1,
          isnull(invRpt.AddressLine2,isnull(RolePlayerAddress.AddressLine2,'')) as addressLine2,isnull(ppbi.AccumulatesInterest,0) AccumulatesInterest,
          isnull(invRpt.PostalCode,isnull(RolePlayerAddress.PostalCode,'')) as postalCode,isnull(invRpt.City ,isnull(RolePlayerAddress.City,'')) as City,case when (i.invoicenumber like '%INV%' or i.invoicenumber like '%IV%') then 'Invoice' 
		  when i.invoicenumber like '%CN%' then 'Credit Note' end as [DocumentType],
          CASE WHEN RolePlayerAddress.PostalCode IS NOT NULL
          THEN 'South Africa' ELSE '' END as country, cast(i.TotalInvoiceAmount as decimal(16,2)) as totalPremium,
          cast(i.TotalInvoiceAmount as decimal(16,2)) as installmentPremium, fp.FinPayeNumber as AccountNumber,
		  cast(Concat(bify.StartMonth,'-',bify.StartDay,'-',bify.StartYear) as date) CoverStartDate,
		  cast(Concat(bify.EndMonth,'-',bify.EndDay,'-',bify.EndYear) as date) CoverEndDate,
		  case when p.PaymentfrequencyId = 1 then 100
		       when p.PaymentfrequencyId = 4 then 50
			   when p.PaymentfrequencyId = 3 then 25 else 8.3 end as [Percentage],
		  bili.rate,
		  --Case when ic.[Id] = 2 then Concat(bify.StartYear,'-',bify.EndYear ) else cast(bify.StartYear as char(10)) end as [FinancialYear]
          noOfInsuredLifes = (SELECT count(pil.PolicyId) FROM [policy].[PolicyInsuredLives] pil, [policy].[Policy] p2
          where pil.PolicyId = p2.PolicyId and p2.ParentPolicyId = i.PolicyId
          and pil.InsuredLifeStatusId in (1) -- active
          and pil.RolePlayerTypeId in (10) -- main member
          ) 
          FROM [billing].[Invoice] i
          inner join [policy].[Policy] p on p.PolicyId = i.PolicyId
          inner join [client].[RolePlayer] policyOwner on policyOwner.RolePlayerId = p.PolicyOwnerId
          inner join [client].[RolePlayer] policyPayee on policyPayee.RolePlayerId = p.PolicyPayeeId
          inner join [product].[ProductOption] po on po.Id = p.ProductOptionId
          inner join [product].[Product] pr on pr.Id = po.ProductId
		  inner join [billing].[InvoiceLineItems] bili on i.InvoiceId =bili.InvoiceId
		  inner join [client].[roleplayercontact] crc on policyOwner.RolePlayerId = crc.Roleplayerid
          left join [client].[RolePlayerAddress] RolePlayerAddress on
          RolePlayerAddress.RolePlayerId = policyPayee.RolePlayerId AND RolePlayerAddress.AddressTypeId = 1
		  left join [billing].InvoiceReportDetails invRpt on  invRpt.InvoiceId = i.InvoiceId and invRpt.IsActive = 1
          left join [client].[FinPayee] fp on fp.RolePlayerId = policyOwner.RolePlayerId
		  left join  common.Industry ind on ind.Id = fp.IndustryId
		  left join  common.IndustryClass ic on ic.Id = ind.IndustryClassId 
  		  left join [product].[ProductOptionBillingIntegration] ppbi on ic.Id =ppbi.IndustryClassId and po.Id =ppbi.ProductOptionId
          left join [billing].[IndustryFinancialYear] bify on ic.Id =bify.IndustryClassId and bify.IsActive=1
		  where i.InvoiceId = @invoiceId 
          END TRY
          BEGIN CATCH
          --TO DO: LOG ERROR
          END CATCH
   end
