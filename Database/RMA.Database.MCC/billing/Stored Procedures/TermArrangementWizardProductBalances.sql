-- =============================================
-- Author:		Bongani Makelane
-- Create date: 2023/03/30
-- =============================================
CREATE   PROCEDURE [billing].[TermArrangementWizardProductBalances] 
    @wizardId int
	as 
	begin  

 declare @json varchar(max) =(select data from bpm.Wizard where id =@wizardId)
declare @termProductOptions table (productOptionId int, balance decimal);

insert into @termProductOptions(productOptionId,balance)
select * from  OPENJSON((SELECT termArrangementProductOptions
FROM OPENJSON(@json, '$') 
WITH (    
    termArrangementProductOptions NVARCHAR(MAX) '$.termArrangementProductOptions' AS JSON
) )
,'$')
WITH (
productOptionId int '$.productOptionId',
balance decimal '$.contractAmount' 
)  	  
	--  select * from @termProductOptions

	 declare @productTerms table (productOptionId int, productName varchar(100), balance decimal(18,2))

insert into @productTerms
select  tp.ProductOptionId,
case when po.description  ='COID Policy' then replace(po.description,'COID Policy', 'COID') 
 when po.description  ='Commuting Journey Policy' then replace(po.description,'Commuting Journey Policy', 'CJP') 
 when po.description  ='Crime Injury Commuting Journey Policy' then replace(po.description,'Crime Injury Commuting Journey Policy', 'CICJP') 
 when po.description  ='Augmentation' then replace(po.description,'Augmentation', 'AUG')
end as productName, 

tp.balance from [product].[ProductOption] po 
inner join @termProductOptions tp on po.Id = tp.ProductOptionId

		 declare @products table (productName varchar(50))
		 insert into @products 
		 values ('COID'),
		('AUG'),
		('CICJP'),
		('CJP');

	with balances(productname, balance) as 
(select productName, sum(balance) as balance  from @productTerms group by productName)		

select * from (
select * from balances) b
PIVOT(
    sum(b.balance) 
    FOR b.productname IN (
        [COID], 
        [AUG], 
        [CICJP], 
        [CJP])
) AS results;
   end