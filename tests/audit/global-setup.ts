import { startW3cDemoServer } from './w3c-demo-server';

export default async function globalSetup(): Promise<() => Promise<void>> {
  const server = await startW3cDemoServer();
  const beforeHome = `${server.baseUrl}/before/home.html`;
  const afterHome = `${server.baseUrl}/after/home.html`;

  process.env['BASE_URL_W3C_DEMO'] = server.baseUrl;
  process.env['BASE_URL_AXE_W3C_BAD'] = beforeHome;
  process.env['BASE_URL_AXE_W3C_AFTER'] = afterHome;
  process.env['BASE_URL_LIGHTHOUSE_W3C_BAD'] = beforeHome;

  return async () => {
    await server.stop();
  };
}
