(async function () {
  var b64 = window.__KHEP_B64;
  var bin = Uint8Array.from(atob(b64), function (c) { return c.charCodeAt(0); });
  var html = await new Response(new Blob([bin]).stream().pipeThrough(new DecompressionStream("gzip"))).text();
  document.open();
  document.write(html);
  document.close();
})();
