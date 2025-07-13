using RMA.Common.Database.Extensions;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Billing.Contracts.Entities.DataExchange.Import;
using RMA.Service.Billing.Database.Constants;
using RMA.Service.Billing.Database.Context;
using RMA.Service.Billing.Database.Entities;
using RMA.Service.Billing.DataExchange.FileExchange;

using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Billing.DataExchange.Data
{
    /// <summary>
    /// This will perform bulk operations the data operations in fact belong to the existing database project which 
    /// needs to be extended for SqlClient (Bulk) operations.
    /// </summary>
    public class BillingDataExchange : FileExchangeBase //This should be excel exchange, csv etc...
    {
        //This should be a process, each process having their own implementation in a similiar fashion as with the wizard processes etc...
        public override async Task ProcessDataAsync<T>(IEnumerable<T> dataExchangeModels)
        {
            if (dataExchangeModels != null)
            {
                int fileId = 0;
                var dataTable = new DataTable("load.BulkManualAllocation"); //Should be a constant or a variable in the exchange service
                try
                {
                    decimal totalAmount = 0;
                    using (var scope = _dbContextScopeFactory.Create())
                    {
                        var file = new Load_BulkAllocationFile
                        {
                            FileIdentifier = ExchangeIdentifier,
                            FileName = $"File{ExchangeIdentifier}",
                            IsDeleted = false
                        };

                        var createdFile = base.GetRepository<Load_BulkAllocationFile>().Create(file);
                        await scope.SaveChangesAsync();

                        fileId = createdFile.BulkAllocationFileId;
                        base.ConnectionString = scope.DbContexts.Get<EfDbContext>().ConnectionString; //This wont create a new instance of the DbContext which is good.
                    }

                    //Manually mapping these fields for now this should be extensions with dbTypes going forward.

                    var dtColumn1 = new DataColumn();
                    dtColumn1.DataType = System.Type.GetType("System.Int32");
                    dtColumn1.AutoIncrement = true;
                    dtColumn1.AutoIncrementSeed = 1;
                    dtColumn1.AutoIncrementStep = 1;
                    dtColumn1.ColumnName = "Id";
                    dtColumn1.Caption = "Id";
                    dataTable.Columns.Add(dtColumn1);

                    var dtColumn2 = new DataColumn();
                    dtColumn2.DataType = typeof(String);
                    dtColumn2.ColumnName = "BankAccountNumber";
                    dtColumn2.Caption = "Bank Account Number";
                    dtColumn2.AutoIncrement = false;
                    dtColumn2.ReadOnly = false;
                    dtColumn2.Unique = false;
                    dataTable.Columns.Add(dtColumn2);

                    var dtColumn3 = new DataColumn();
                    dtColumn3.DataType = typeof(String);
                    dtColumn3.ColumnName = "UserReference";
                    dtColumn3.Caption = "UserReference";
                    dtColumn3.AutoIncrement = false;
                    dtColumn3.ReadOnly = false;
                    dtColumn3.Unique = false;
                    dataTable.Columns.Add(dtColumn3);

                    var dtColumn4 = new DataColumn();
                    dtColumn4.DataType = typeof(String);
                    dtColumn4.ColumnName = "StatementReference";
                    dtColumn4.Caption = "Statement Reference";
                    dtColumn4.AutoIncrement = false;
                    dtColumn4.ReadOnly = false;
                    dtColumn4.Unique = false;
                    dataTable.Columns.Add(dtColumn4);

                    var dtColumn5 = new DataColumn();
                    dtColumn5.DataType = typeof(String);
                    dtColumn5.ColumnName = "TransactionDate";
                    dtColumn5.Caption = "Transaction Date";
                    dtColumn5.AutoIncrement = false;
                    dtColumn5.ReadOnly = false;
                    dtColumn5.Unique = false;
                    dataTable.Columns.Add(dtColumn5);

                    var dtColumn6 = new DataColumn();
                    dtColumn6.DataType = typeof(String);
                    dtColumn6.ColumnName = "Amount";
                    dtColumn6.Caption = "Amount";
                    dtColumn6.AutoIncrement = false;
                    dtColumn6.ReadOnly = false;
                    dtColumn6.Unique = false;
                    dataTable.Columns.Add(dtColumn6);

                    var dtColumn7 = new DataColumn();
                    dtColumn7.DataType = typeof(String);
                    dtColumn7.ColumnName = "Status";
                    dtColumn7.Caption = "Status";
                    dtColumn7.AutoIncrement = false;
                    dtColumn7.ReadOnly = false;
                    dtColumn7.Unique = false;
                    dataTable.Columns.Add(dtColumn7);


                    var dtColumn8 = new DataColumn();
                    dtColumn8.DataType = typeof(String);
                    dtColumn8.ColumnName = "UserReference2";
                    dtColumn8.Caption = "User Reference2";
                    dtColumn8.AutoIncrement = false;
                    dtColumn8.ReadOnly = false;
                    dtColumn8.Unique = false;
                    dataTable.Columns.Add(dtColumn8);

                    var dtColumn9 = new DataColumn();
                    dtColumn9.DataType = typeof(String);
                    dtColumn9.ColumnName = "ReferenceType";
                    dtColumn9.Caption = "Reference Type";
                    dtColumn9.AutoIncrement = false;
                    dtColumn9.ReadOnly = false;
                    dtColumn9.Unique = false;
                    dataTable.Columns.Add(dtColumn9);

                    var dtColumn10 = new DataColumn();
                    dtColumn10.DataType = typeof(String);
                    dtColumn10.ColumnName = "Allocatable";
                    dtColumn10.Caption = "Allocatable";
                    dtColumn10.AutoIncrement = false;
                    dtColumn10.ReadOnly = false;
                    dtColumn10.Unique = false;
                    dataTable.Columns.Add(dtColumn10);

                    var dtColumn11 = new DataColumn();
                    dtColumn11.DataType = typeof(String);
                    dtColumn11.ColumnName = "AllocateTo";
                    dtColumn11.Caption = "Allocate To";
                    dtColumn11.AutoIncrement = false;
                    dtColumn11.ReadOnly = false;
                    dtColumn11.Unique = false;
                    dataTable.Columns.Add(dtColumn11);

                    var dtColumn12 = new DataColumn();
                    dtColumn12.DataType = System.Type.GetType("System.Int32");
                    dtColumn12.ColumnName = "BulkAllocationFileId";
                    dtColumn12.Caption = "BulkAllocationFileId";
                    dtColumn12.AutoIncrement = false;
                    dtColumn12.ReadOnly = false;
                    dtColumn12.Unique = false;
                    dataTable.Columns.Add(dtColumn12);

                    var dtColumn14 = new DataColumn();
                    dtColumn14.DataType = typeof(String);
                    dtColumn14.ColumnName = "Error";
                    dtColumn14.Caption = "Error";
                    dtColumn14.AutoIncrement = false;
                    dtColumn14.ReadOnly = false;
                    dtColumn14.Unique = false;
                    dataTable.Columns.Add(dtColumn14);

                    var dtColumn13 = new DataColumn();
                    dtColumn13.DataType = typeof(bool);
                    dtColumn13.ColumnName = "IsDeleted";
                    dtColumn13.Caption = "Is Deleted";
                    dtColumn13.AutoIncrement = false;
                    dtColumn13.ReadOnly = false;
                    dtColumn13.Unique = false;
                    dataTable.Columns.Add(dtColumn13);


                    var dtColumn15 = new DataColumn();
                    dtColumn15.DataType = System.Type.GetType("System.Int32");
                    dtColumn15.ColumnName = "LineProcessingStatusId";
                    dtColumn15.Caption = "LineProcessingStatusId";
                    dtColumn15.AutoIncrement = false;
                    dtColumn15.ReadOnly = false;
                    dtColumn15.Unique = false;
                    dataTable.Columns.Add(dtColumn15);

                    var dtColumn16 = new DataColumn();
                    dtColumn16.DataType = System.Type.GetType("System.Int32");
                    dtColumn16.ColumnName = "PeriodId";
                    dtColumn16.Caption = "PeriodId";
                    dtColumn16.AutoIncrement = false;
                    dtColumn16.ReadOnly = false;
                    dtColumn16.Unique = false;
                    dataTable.Columns.Add(dtColumn16);

                    foreach (var item in dataExchangeModels)
                    {
                        if (String.IsNullOrEmpty((item as BillingDataExchangeModel)?.BankAccountNumber?.Trim()))
                        {
                            continue;
                        }

                        var row = dataTable.NewRow();
                        row["BankAccountNumber"] = item != null ? (item as BillingDataExchangeModel)?.BankAccountNumber : string.Empty;
                        row["UserReference"] = item != null ? (item as BillingDataExchangeModel)?.UserReference : string.Empty;
                        row["StatementReference"] = item != null ? (item as BillingDataExchangeModel)?.StatementReference : string.Empty;
                        row["TransactionDate"] = item != null ? (item as BillingDataExchangeModel)?.TransactionDate : string.Empty;
                        row["Amount"] = item != null ? (item as BillingDataExchangeModel)?.Amount : string.Empty;
                        row["Status"] = item != null ? (item as BillingDataExchangeModel)?.Status : string.Empty;
                        row["UserReference2"] = item != null ? (item as BillingDataExchangeModel)?.UserReference2 : string.Empty;
                        row["ReferenceType"] = item != null ? (item as BillingDataExchangeModel)?.ReferenceType : string.Empty;
                        row["Allocatable"] = item != null ? (item as BillingDataExchangeModel)?.Allocatable : string.Empty;
                        row["AllocateTo"] = item != null ? (item as BillingDataExchangeModel)?.AllocateTo : string.Empty;
                        row["BulkAllocationFileId"] = fileId;
                        row["IsDeleted"] = item != null ? (item as BillingDataExchangeModel)?.IsDeleted : false;
                        row["Error"] = item != null ? (item as BillingDataExchangeModel)?.Error : string.Empty;
                        row["LineProcessingStatusId"] = (int)FileLineItemProcessingStatusEnum.Pending;
                        row["PeriodId"] = (int)(item as BillingDataExchangeModel)?.PeriodId;

                        if (decimal.TryParse((item as BillingDataExchangeModel)?.Amount, out decimal amount))
                        {
                            totalAmount += amount;
                        };

                        dataTable.Rows.Add(row);
                    }

                    using (var sqlBulkCopy = new SqlBulkCopy(base.ConnectionString))
                    {
                        sqlBulkCopy.BatchSize = 10000; //Should be constant or configuration settings
                        sqlBulkCopy.DestinationTableName = dataTable.TableName;
                        await sqlBulkCopy.WriteToServerAsync(dataTable);
                    }

                    //update totalAmount
                    using (var scope = _dbContextScopeFactory.Create())
                    {
                        var bulkAllocationFile = await base.GetRepository<Load_BulkAllocationFile>().FirstOrDefaultAsync(x => x.BulkAllocationFileId == fileId);
                        if (bulkAllocationFile != null)
                        {
                            bulkAllocationFile.Total = totalAmount;
                            base.GetRepository<Load_BulkAllocationFile>().Update(bulkAllocationFile);
                            await scope.SaveChangesAsync();
                        }
                    }

                    var task = Task.Run(() => //Lets spin up a new thread for this.
                    {
                        using (var scope = _dbContextScopeFactory.Create())
                        {
                            //This is synchronous which is fine it is calling a stored procedure.
                            base.GetRepository<billing_Transaction>().ExecuteSqlCommand(DatabaseConstants.BulkAllocateStagedAllocations, new SqlParameter { ParameterName = "@fileId", Value = fileId });
                        }
                    });
                }
                catch
                {
                    throw;
                }
                finally
                {
                    //Clean Up
                    dataTable?.Clear();
                    dataTable?.Dispose();
                }
            }
        }

        public override async Task<IEnumerable<T>> ExportDataAsync<T>(int id)
        {
            try
            {
                using (var scope = _dbContextScopeFactory.CreateReadOnly())
                {
                    var data = await base.GetRepository<Load_BulkManualAllocation>().Where(x => x.BulkAllocationFileId == id).ToListAsync();
                    //Need to improve mapping here, back to Automapper and its' security vulnerabilities also we are on C# 7, can do a lot better processing etc with c# 13
                    var mapToQuery = data.SelectMany(x => new List<BillingDataExchangeModel>() { new BillingDataExchangeModel() {
                        Id = id,
                        Allocatable = x.Allocatable,
                        AllocateTo = x.AllocateTo,
                        Amount = x.Amount,
                        BankAccountNumber = x.BankAccountNumber,
                        BulkAllocationFileId = x.BulkAllocationFileId,
                        IsDeleted = x.IsDeleted,
                        ReferenceType = x.ReferenceType,
                        StatementReference = x.StatementReference,
                        Status = x.Status,
                        TransactionDate = x.TransactionDate,
                        UserReference = x.UserReference,
                        UserReference2 = x.UserReference2,
                        Error = x.Error,
                        PeriodId = x.PeriodId??0
                    }});

                    return (IList<T>)mapToQuery.ToList();
                }
            }
            catch
            {
                throw;
            }
        }
    }
}