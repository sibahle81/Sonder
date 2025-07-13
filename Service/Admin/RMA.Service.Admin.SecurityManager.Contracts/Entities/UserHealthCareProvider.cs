using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;

namespace RMA.Service.Admin.SecurityManager.Contracts.Entities
{
    public class UserHealthCareProvider : IEquatable<UserHealthCareProvider>
    {
        public int UserHealthCareProviderMapId { get; set; }
        public int HealthCareProviderId { get; set; }
        public string Name { get; set; }
        public string PracticeNumber { get; set; }
        public int UserId { get; set; }
        public int CompCareMSPId { get; set; }
        public int TenantId { get; set; }
        public UserHealthCareProviderMapStatusEnum? UserHealthCareProviderMapStatus { get; set; }

        public bool Equals(UserHealthCareProvider other)
        {
            if (other is null)
                return false;

            return UserId == other.UserId && HealthCareProviderId == other.HealthCareProviderId;
        }

        public override bool Equals(object obj) => Equals(obj as UserHealthCareProvider);
        public override int GetHashCode() => (UserId.ToString(), HealthCareProviderId.ToString()).GetHashCode();
    }
}
