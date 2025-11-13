import { randomUUID } from 'node:crypto';

export type AutomationExerciseTitle = 'Mr' | 'Mrs';

export interface AutomationExerciseUser {
  id: string;
  title: AutomationExerciseTitle;
  name: string;
  email: string;
  password: string;
  birthDay: string;
  birthMonth: string;
  birthYear: string;
  subscribeNewsletter: boolean;
  receiveSpecialOffers: boolean;
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  country: string;
  state: string;
  city: string;
  zipcode: string;
  mobileNumber: string;
}

function createId(): string {
  return randomUUID().replaceAll('-', '');
}

function buildDisplayName(firstName: string, lastName: string, explicitName?: string): string {
  if (explicitName && explicitName.trim().length > 0) {
    return explicitName;
  }
  return `${firstName} ${lastName}`.trim();
}

export function createUniqueEmail(baseEmail: string): string {
  const uniqueSuffix = createId().slice(0, 8);
  const [localPart, domain] = baseEmail.split('@');
  if (!domain) {
    return `${baseEmail}+${uniqueSuffix}@example.com`;
  }
  return `${localPart}+${uniqueSuffix}@${domain}`;
}

export function generateAutomationExerciseUser(
  overrides: Partial<AutomationExerciseUser> = {},
): AutomationExerciseUser {
  const id = overrides.id ?? createId();
  const firstName = overrides.firstName ?? 'Auto';
  const lastName = overrides.lastName ?? 'Tester';
  const email = overrides.email ?? `automationexercise.${id.slice(0, 8).toLowerCase()}@example.com`;
  const password = overrides.password ?? `Password!${id.slice(0, 4)}`;

  const baseUser: AutomationExerciseUser = {
    id,
    title: overrides.title ?? 'Mr',
    firstName,
    lastName,
    name: buildDisplayName(firstName, lastName, overrides.name),
    email,
    password,
    birthDay: overrides.birthDay ?? '15',
    birthMonth: overrides.birthMonth ?? '6',
    birthYear: overrides.birthYear ?? '1992',
    subscribeNewsletter: overrides.subscribeNewsletter ?? true,
    receiveSpecialOffers: overrides.receiveSpecialOffers ?? true,
    company: overrides.company ?? 'Automation Exercise',
    address1: overrides.address1 ?? '123 Automation Street',
    address2: overrides.address2 ?? 'Suite 100',
    country: overrides.country ?? 'United States',
    state: overrides.state ?? 'CA',
    city: overrides.city ?? 'Los Angeles',
    zipcode: overrides.zipcode ?? '90001',
    mobileNumber: overrides.mobileNumber ?? '5551234567',
  };

  return {
    ...baseUser,
    ...overrides,
    name: buildDisplayName(baseUser.firstName, baseUser.lastName, overrides.name),
    email,
    password,
  };
}
