CREATE PROCEDURE [Load].[GetPremiumListingPaymentErrors] @fileIdentifier uniqueidentifier
AS BEGIN
	select pe.[Company],
		pe.[GroupPolicyNumber],
		pe.[MemberPolicyNumber],
		pe.[MemberIdNumber],
		concat(per.FirstName, ' ', per.Surname) [MemberName],
		pe.PaymentDate,
		cast(pe.PaymentAmount as money) [PaymentAmount],
		pe.ErrorMessage
	from [Load].[PremiumListingPaymentError] pe with (nolock)
		left join [client].[Person] per with (nolock) on per.IdNumber = pe.MemberIdNumber
	where pe.[FileIdentifier] = @fileIdentifier
	order by [ErrorMessage], [MemberIdNumber]
END

