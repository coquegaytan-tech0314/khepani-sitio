window.KHEPANI_IMG=window.KHEPANI_IMG||{};
(function(key,n){
  var parts=new Array(n), left=n;
  function done(){
    try { Function(parts.join(''))(); } catch(e) { console.error(e); }
    document.querySelectorAll('img[data-k="'+key+'"]').forEach(function(img){
      var u=window.KHEPANI_IMG[key]; if(u) img.src=u;
    });
  }
  for (var i=0;i<n;i++){
    (function(i){
      fetch('../_src/'+key+'/'+String(i).padStart(2,'0')+'.txt').then(function(r){return r.text()}).then(function(t){ parts[i]=t; if(--left===0) done(); });
    })(i);
  }
})('nivel-secundaria-alumnos', 10);
