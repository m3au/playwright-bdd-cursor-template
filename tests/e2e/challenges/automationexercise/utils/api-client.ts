import { request as playwrightRequest } from '@playwright/test';

import type { AutomationExerciseUser } from '@automationexercise/utils/user-data';

const BASE_URL = 'https://automationexercise.com';
const LOGIN_PATH = '/login';
const SIGNUP_PATH = '/signup';

const TOKEN_REGEX = /name="csrfmiddlewaretoken"\s+value="([^"]+)"/i;

function extractCsrfToken(html: string, context: string): string {
  const match = TOKEN_REGEX.exec(html);
  if (!match) {
    throw new Error(`Unable to find CSRF token while ${context}`);
  }
  return match[1]!;
}

function buildCreateAccountForm(user: AutomationExerciseUser): Record<string, string> {
  return {
    csrfmiddlewaretoken: '',
    title: user.title,
    name: user.name,
    email: user.email,
    email_address: user.email,
    password: user.password,
    days: user.birthDay,
    months: user.birthMonth,
    years: user.birthYear,
    newsletter: user.subscribeNewsletter ? '1' : '0',
    optin: user.receiveSpecialOffers ? '1' : '0',
    first_name: user.firstName,
    last_name: user.lastName,
    company: user.company ?? '',
    address1: user.address1,
    address2: user.address2 ?? '',
    country: user.country,
    state: user.state,
    city: user.city,
    zipcode: user.zipcode,
    mobile_number: user.mobileNumber,
    form_type: 'create_account',
  };
}

function getReferer(path: string): string {
  return `${BASE_URL}${path}`;
}

export async function registerAutomationExerciseUser(user: AutomationExerciseUser): Promise<void> {
  const api = await playwrightRequest.newContext({
    baseURL: BASE_URL,
  });

  try {
    const loginResponse = await api.get(LOGIN_PATH);
    if (!loginResponse.ok()) {
      throw new Error(`Failed to load login page (${loginResponse.status()})`);
    }

    const loginHtml = await loginResponse.text();
    const signupToken = extractCsrfToken(loginHtml, 'preparing signup request');

    const startSignupResponse = await api.post(SIGNUP_PATH, {
      headers: {
        Referer: getReferer(LOGIN_PATH),
      },
      form: {
        csrfmiddlewaretoken: signupToken,
        name: user.name,
        email: user.email,
        form_type: 'signup',
      },
    });

    if (!startSignupResponse.ok()) {
      // If the user already exists the server responds with 302 which is handled later.
      const status = startSignupResponse.status();
      throw new Error(`Failed to start signup process (${status})`);
    }

    const signupFormHtml = await startSignupResponse.text();
    const accountToken = extractCsrfToken(signupFormHtml, 'submitting account details');

    const formData = buildCreateAccountForm(user);
    formData['csrfmiddlewaretoken'] = accountToken;

    const createAccountResponse = await api.post(SIGNUP_PATH, {
      headers: {
        Referer: getReferer(SIGNUP_PATH),
      },
      form: formData,
    });

    if (createAccountResponse.ok()) {
      return;
    }

    const status = createAccountResponse.status();
    const body = await createAccountResponse.text();
    if (status === 500 && body.includes('UNIQUE constraint failed')) {
      // Account already exists - nothing else to do
      return;
    }

    throw new Error(`Failed to create AutomationExercise account (${status})`);
  } finally {
    await api.dispose();
  }
}
