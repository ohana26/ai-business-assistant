export type CompanyAccess = {
  companyId: string;
  membershipId: string;
  role: string;
  permissions: string[];
};

export type CurrentUserContext = {
  userId: string;
  email: string;
  profile: {
    department: string | null;
    jobTitle: string | null;
    location: string | null;
    securityLevel: string | null;
  };
  attributes: Record<string, string>;
  companies: CompanyAccess[];
  roles: string[];
  permissions: string[];
};
