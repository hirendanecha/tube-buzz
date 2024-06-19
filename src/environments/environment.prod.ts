// const frontendUrl = 'http://localhost:4200/';
// const backendUrl = 'http://localhost:8080/';
// const loginUrl = 'http://localhost:4200/login';

const frontendUrl = 'https://www.tube.buzz/';
const backendUrl = 'https://api.tube.buzz/';
const loginUrl = 'https://www.tube.buzz/login';
const wasabiUrl = 'https://tube-social.s3.us-east-1.wasabisys.com/';
const logoutUrl = 'https://www.tube.buzz/logout';



export const environment = {
  production: true,
  frontendUrl: frontendUrl,
  backendUrl: backendUrl,
  loginUrl: loginUrl,
  apiUrl: `${backendUrl}api/v1/`,
  domain: '.tube.buzz',
  wasabiUrl: wasabiUrl,
  socketUrl: `${backendUrl}`,
  conferenceUrl: 'https://facetime.tube/',
  logoutUrl: logoutUrl
};

