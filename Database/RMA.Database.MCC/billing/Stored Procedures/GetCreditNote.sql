

CREATE   PROCEDURE [billing].[GetCreditNote]
    @transactionId int
	as 
	begin

          --InvoiceData
          BEGIN TRY 
          SELECT DISTINCT i.InvoiceNumber as docNo, CONVERT(VARCHAR, i.CreatedDate, 23) as docDate,crc.FirstName + ' ' + crc.Surname AS [CantactName],
		  pr.[Name] as product, p.PolicyNumber as policyNo, po.[Name] as productOption,
          policyOwner.DisplayName, isnull(RolePlayerAddress.AddressLine1,'') as addressLine1,
          isnull(RolePlayerAddress.AddressLine2,'') as addressLine2,
          isnull(RolePlayerAddress.PostalCode,'') as postalCode,isnull(RolePlayerAddress.City,'') as City,
          CASE WHEN RolePlayerAddress.PostalCode IS NOT NULL
          THEN 'South Africa' ELSE '' END as country, cast(i.TotalInvoiceAmount as decimal(16,2)) as totalPremium,
          cast(i.TotalInvoiceAmount as decimal(16,2)) as installmentPremium, fp.FinPayeNumber as AccountNumber,
		  --cast(bili.coverstartDate as date) CoverStartDate,
		  cast(Concat(bify.StartMonth,'-',bify.StartDay,'-',bify.StartYear) as date) CoverStartDate,
		 --cast(bili.CoverEndDate as date) CoverEndDate,
		  cast(Concat(bify.EndMonth,'-',bify.EndDay,'-',bify.EndYear) as date) CoverEndDate,
		  case when p.PaymentfrequencyId = 1 then 100
		       when p.PaymentfrequencyId = 4 then 50
			   when p.PaymentfrequencyId = 3 then 25 else 8.3 end as [Percentage],
		  bili.rate,
          noOfInsuredLifes = (SELECT count(pil.PolicyId) FROM [policy].[PolicyInsuredLives] pil, [policy].[Policy] p2
          where pil.PolicyId = p2.PolicyId and p2.ParentPolicyId = i.PolicyId
          and pil.InsuredLifeStatusId in (1) -- active
          and pil.RolePlayerTypeId in (10) -- main member
          ) 
          FROM billing.transactions bt (nolock)
		  left join [billing].[Invoice] (nolock) i on bt.RmaReference = i.InvoiceNumber
          inner join [policy].[Policy] p on p.PolicyOwnerId = bt.RolePlayerId and i.policyid =p.PolicyId
          inner join [client].[RolePlayer] policyOwner on policyOwner.RolePlayerId = p.PolicyOwnerId
          inner join [client].[RolePlayer] policyPayee on policyPayee.RolePlayerId = p.PolicyPayeeId
          inner join [product].[ProductOption] po on po.Id = p.ProductOptionId
          inner join [product].[Product] pr on pr.Id = po.ProductId
		  inner join [billing].[InvoiceLineItems] bili on i.InvoiceId =bili.InvoiceId
		  inner join [client].[roleplayercontact] crc on policyOwner.RolePlayerId = crc.Roleplayerid
          left join [client].[RolePlayerAddress] RolePlayerAddress on
          RolePlayerAddress.RolePlayerId = policyPayee.RolePlayerId AND RolePlayerAddress.AddressTypeId = 1
          left join [client].[FinPayee] fp on fp.RolePlayerId = policyOwner.RolePlayerId
		  left join  common.Industry ind on ind.Id = fp.IndustryId
		  left join  common.IndustryClass ic on ic.Id = ind.IndustryClassId 
		  left join [billing].[IndustryFinancialYear] bify on ic.Id =bify.IndustryClassId and bify.IsActive=1
          where bt.TransactionId = @transactionId and bt.TransactionTypeId = 4
          END TRY
          BEGIN CATCH
          --TO DO: LOG ERROR
          END CATCH
   end
