import{_}from"./BhbD4ngE.js";import{u as $,m as k,b as A,a as j,w as T,d as q,h as x,l as B,g as h,o as y}from"./BFmF7T1o.js";import{u as s}from"./ElZI6kBk.js";import{u as H,a as E}from"./BqCbOlpM.js";import"./BdxP3CMW.js";const C={__name:"[slug]",async setup(L){let o,c;const{locale:v}=$(),m=H(),l=`${m.protocol}//${m.host}`,{$axios:w}=k(),u=A(),p=u.public.siteId,g=j().params.slug,b=async(a,r=null)=>{const t={siteId:a};r&&(t.slug=r);try{return(await w.get("/pages/page-by-slug",{params:t})).data}catch(n){throw console.error("Ошибка запроса:",n.message),console.error("Код состояния:",n.response?.status),console.error("Детали ошибки:",n.response?.data),n}},{data:e}=([o,c]=T(()=>E(`page-${g}-${p}`,()=>b(p,g),{server:!0})),o=await o,c(),o),f=u.public.globalHead,d={link:f.filter(a=>a.startsWith("<link")).map(a=>{const r=Array.from(a.matchAll(/(\w+)=["'](.*?)["']/g));return Object.fromEntries(r.map(([t,n,i])=>[n,i]))}),meta:f.filter(a=>a.startsWith("<meta")).map(a=>{const r=Array.from(a.matchAll(/(\w+)=["'](.*?)["']/g));return Object.fromEntries(r.map(([t,n,i])=>[n,i]))})};if(e.value){const a=e.value.head||{},r=e.value.domain||l;v.value=e.value.lang||"en",s({htmlAttrs:{lang:e.value.lang||"tr"},title:a.title||"Sweet Bonanza Oyunu Oyna | Büyük Kazançları Yakala!",meta:[{name:"description",content:a.description},{name:"keywords",content:a.keywords},{property:"og:title",content:a.title},{property:"og:description",content:a.description},{property:"og:image",content:e.value.article?.introImage?.[0]?.path},{property:"og:url",content:`${r}/${e.value.slug}`},{property:"og:type",content:"article"},{property:"og:locale",content:"tr_TR"},{name:"twitter:card",content:"summary_large_image"},{name:"twitter:title",content:a.title},{name:"twitter:description",content:a.description},{name:"twitter:image",content:e.value.article?.introImage?.[0]?.path}],link:[{rel:"canonical",href:`${r}${e.value.homePage?"":`/${e.value.slug}`}/`}]}),s({link:[{rel:"alternate",hreflang:e.value.lang||"en",href:`${l}${e.value.homePage?"":`/${e.value.slug}`}/`}]}),e.value.alters&&Array.isArray(e.value.alters)&&s({link:e.value.alters.map(t=>({rel:"alternate",hreflang:t.hreflang,href:`${l}/${t.slug}${e.value.homePage?"":`/${e.value.slug}`}/`}))}),e.value.robots?.metaTags&&s({meta:e.value.robots.metaTags.map(t=>({name:t.name,content:t.content}))}),s({meta:d.meta,link:d.link}),Array.isArray(e.value.pixel)&&e.value.pixel.length>0&&s({script:[{innerHTML:`
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
        `}))})}return(a,r)=>{const t=_;return y(),q("main",null,[h(e)?.type?(y(),x(t,{key:0,data:h(e)},null,8,["data"])):B("",!0)])}}};export{C as default};
