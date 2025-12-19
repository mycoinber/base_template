import{_ as v}from"./BhbD4ngE.js";import{u as b,m as _,b as $,a as k,w as A,d as j,f as x,g as q,o as H}from"./BFmF7T1o.js";import{u as s}from"./ElZI6kBk.js";import{u as T,a as E}from"./BqCbOlpM.js";import"./BdxP3CMW.js";const C={__name:"index",async setup(L){let o,c;const{locale:h}=b(),m=T(),i=`${m.protocol}//${m.host}`,{$axios:y}=_(),p=$(),u=p.public.siteId,g=k().params.slug,w=async(a,r=null)=>{const t={siteId:a};r&&(t.slug=r);try{return(await y.get("/pages/page-by-slug",{params:t})).data}catch(n){return console.error("Ошибка запроса:",n),console.error("Код состояния:",n.response?.status),console.error("Детали ошибки:",n.response?.data),{}}},{data:e,status:B,error:I,refresh:N,clear:R}=([o,c]=A(()=>E(`page-${g}-${u}`,()=>w(u,g),{server:!0})),o=await o,c(),o),f=p.public.globalHead,d={link:f.filter(a=>a.startsWith("<link")).map(a=>{const r=Array.from(a.matchAll(/(\w+)=["'](.*?)["']/g));return Object.fromEntries(r.map(([t,n,l])=>[n,l]))}),meta:f.filter(a=>a.startsWith("<meta")).map(a=>{const r=Array.from(a.matchAll(/(\w+)=["'](.*?)["']/g));return Object.fromEntries(r.map(([t,n,l])=>[n,l]))})};if(e.value&&Object.keys(e.value).length>0){const a=e.value.head||{},r=e.value.domain||i;h.value=e.value.lang||"en",s({htmlAttrs:{lang:e.value.lang||"en"},title:a.title||"Website",meta:[{name:"description",content:a.description},{name:"keywords",content:a.keywords},{property:"og:title",content:a.title},{property:"og:description",content:a.description},{property:"og:image",content:e.value.article?.introImage?.[0]?.path},{property:"og:url",content:`${r}/${e.value.slug}`},{property:"og:type",content:"article"},{property:"og:locale",content:e.value.lang||"en"},{name:"twitter:card",content:"summary_large_image"},{name:"twitter:title",content:a.title},{name:"twitter:description",content:a.description},{name:"twitter:image",content:e.value.article?.introImage?.[0]?.path}],link:[{rel:"canonical",href:`${r}/`}]}),s({link:[{rel:"alternate",hreflang:e.value.lang||"en",href:`${i}/`}]}),e.value.alters&&Array.isArray(e.value.alters)&&s({link:e.value.alters.map(t=>({rel:"alternate",hreflang:t.hreflang,href:`${i}/${t.slug}`}))}),e.value.robots?.metaTags&&s({meta:e.value.robots.metaTags.map(t=>({name:t.name,content:t.content}))}),s({meta:d.meta,link:d.link}),Array.isArray(e.value.pixel)&&e.value.pixel.length>0&&s({script:[{innerHTML:`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            ${e.value.pixel.map(t=>`fbq('init', '${t}');`).join(`
`)}
            fbq('track', 'PageView');
          `}],noscript:e.value.pixel.map(t=>({innerHTML:`
          <img height="1" width="1" style="display:none"
          src="https://www.facebook.com/tr?id=${t}&ev=PageView&noscript=1"/>
        `}))}),Array.isArray(e.value.gtm)&&e.value.gtm.length>0&&s({script:e.value.gtm.map((t,n)=>({key:`gtm-script-${n}`,innerHTML:`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${t}');
        `})),noscript:e.value.gtm.map((t,n)=>({key:`gtm-noscript-${n}`,innerHTML:`
          <iframe src="https://www.googletagmanager.com/ns.html?id=${t}"
          height="0" width="0" style="display:none;visibility:hidden"></iframe>
        `}))})}return(a,r)=>{const t=v;return H(),j("main",null,[x(t,{data:q(e)},null,8,["data"])])}}};export{C as default};
