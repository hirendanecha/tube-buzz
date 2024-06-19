const loginUrl = 'https://freedom.buzz/login';
const logoutUrl = 'https://freedom.buzz/logout';
const frontendUrl = 'https://tube.freedom.buzz/';
const backendUrl = 'https://freedom-api.opash.in/';

// const frontendUrl = 'http://localhost:4200/';
// const backendUrl = 'http://localhost:8080/';
// const loginUrl = 'http://localhost:4200/login';
const wasabiUrl = 'https://freedom-social.s3.us-east-1.wasabisys.com/'


export const environment = {
  production: false,
  frontendUrl: frontendUrl,
  backendUrl: backendUrl,
  loginUrl: loginUrl,
  apiUrl: `${backendUrl}api/v1/`,
  domain: '.freedom.buzz',
  wasabiUrl: wasabiUrl,
  socketUrl: `${backendUrl}`,
  conferenceUrl: 'https://facetime.tube/',
  logoutUrl: logoutUrl

};

