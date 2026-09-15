import { useEffect, useState } from 'react';
import { api, type CompanyContact } from '../../lib/api';

export const DEFAULT_COMPANY_CONTACT: CompanyContact = {
  addressLine1: 'No 1 Pathfinder close',
  addressLine2: 'Sandfield, Borikiri',
  city: 'Port Harcourt',
  state: 'Rivers State',
};

export function formatCompanyAddress(contact: CompanyContact) {
  return [contact.addressLine1, contact.addressLine2, contact.city, contact.state]
    .filter(Boolean)
    .join(', ');
}

export function useCompanyContact() {
  const [contact, setContact] = useState<CompanyContact>(DEFAULT_COMPANY_CONTACT);

  useEffect(() => {
    let active = true;
    api.companyContact()
      .then(({ data }) => {
        if (active && data) setContact(data);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  return contact;
}