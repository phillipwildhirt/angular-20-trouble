/*eslint-env es6*/

const insecureCookies = (proxyResponse) => {
  if (proxyResponse.headers['set-cookie']) {
    proxyResponse.headers['set-cookie'] = proxyResponse.headers['set-cookie']
      .map(function (c) {
        return c.replace(/;\s?Secure/gi, '').replace(/;\s?SameSite=None/, '');
      });
  }
}

module.exports = [{
  context: "/ExtranetServices",
  target: "https://edevmig.dillards.com",
  secure: false,
  logLevel: "debug",
  cookieDomainRewrite: "localhost",
  onProxyRes: insecureCookies
}]
