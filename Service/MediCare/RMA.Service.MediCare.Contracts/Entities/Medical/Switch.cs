using RMA.Common.Entities;

using System.Collections.Generic;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class Switch : AuditDetails
    {
        public int SwitchId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string DownloadUrl { get; set; }
        public string CardHolderUrl { get; set; }
        public string ResponseFileUrl { get; set; }
        public string DownloadDirectory { get; set; }
        public string FtpUser { get; set; }
        public string FtpPassword { get; set; }
        public string LastFileNumber { get; set; }
        public string FileNumberRegex { get; set; }
        public string FileFormat { get; set; }
        public bool? DownloadActive { get; set; }
        public bool? CardHolderActive { get; set; }
        public bool? ResponseFileActive { get; set; }
        public string CardHolderFilePrefix { get; set; }
        public string DownloadFilePrefix { get; set; }
        public System.DateTime? LastDownloadDate { get; set; }
        public int? AssignToRole { get; set; }
        public string DownloadNamingType { get; set; }
        public string Protocol { get; set; }
        public string FtpSecure { get; set; }
        public string SsHostKeyFingerprint { get; set; }
        public int? PortNumber { get; set; }
        public System.DateTime? LastRemittanceDate { get; set; }
        public string SshPrivateKeyPath { get; set; }
        public string ContactPerson { get; set; }
        public string EmailAddress { get; set; }
        public string HostName { get; set; }
        public int? UseSecondRegexGroup { get; set; }
        public int? ResponseFileNumber { get; set; }
        public List<SwitchBatch> SwitchBatches { get; set; }
    }
}
