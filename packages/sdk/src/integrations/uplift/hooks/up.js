export const loadUplift = (code) => {
  (function (u, p, l, i, f, t, o, b, j) {
    u['UpLiftPlatformObject'] = f;
    ((u[f] =
      u[f] ||
      function () {
        (u[f].q = u[f].q || []).push(arguments);
      }),
      (u[f].l = 1 * new Date()));
    ((b = p.createElement(l)), (j = p.getElementsByTagName(l)[0]));
    b.async = 1;
    b.src = i + '?upcode=' + t;
    j.parentNode.insertBefore(b, j);
    o = u.location.host.match(/[\w-]+\.\w{2,3}(:\d+)?$/);
    if (o) o = o[0];
    u[f]('create', t, o);
  })(
    window,
    document,
    'script',
    'https://carbon.rc01gw.uplift-platform.com/external/up.js',
    'up',
    code,
  );
};
