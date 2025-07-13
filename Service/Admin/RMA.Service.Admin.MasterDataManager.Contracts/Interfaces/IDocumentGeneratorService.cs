using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Interfaces
{
    public interface IDocumentGeneratorService : IService
    {
        Task<byte[]> GenerateDocument(byte[] byteData, string templateData);
        Task<FormLetterResponse> GenerateDocumentLetter(FormLetterRequest request);
        Task<byte[]> GetFileByteData(string filePath);
        Task<byte[]> ConvertHtmlToPdf(string htmlDoc);
        Task<string> GenerateDocumentNumber(DocumentNumberTypeEnum documentNumberType, string prefixSuffix);
        Task<string> GetDocumentNumber(DocumentNumberTypeEnum documentNumberType, int nextNumber, string prefixSuffix);
        Task<int> GenerateTableId(DocumentNumberTypeEnum documentNumberType);
        Task<byte[]> GenerateWordDocument(byte[] byteData, Dictionary<string, string> documentTokens);
        Task<int> GetNextDocumentNumber(DocumentNumberTypeEnum documentNumberType);
        Task SetNextDocumentNumber(DocumentNumberTypeEnum documentNumberType, int nextNumber);
        Task<FileEncryptResponse> PasswordProtectPdf(string userPassword, string ownerPassword, FileEncryptRequest request);
    }
}