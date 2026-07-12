export type CompanyAccess = {
  companyId: string;
  membershipId: string;
  role: string;
  permissions: string[];
};

export type CurrentUserContext = {
  userId: string;
  email: string;
  companies: CompanyAccess[];
  roles: string[];
  permissions: string[];
};
