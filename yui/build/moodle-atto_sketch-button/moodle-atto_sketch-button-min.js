YUI.add("moodle-atto_sketch-button",function(g,e){var h="atto_sketch",o="storeinrepo",i=/\d+%/,a=M.cfg.wwwroot+"/lib/editor/atto/plugins/sketch/sketch.html",m="sketchpad",n={INPUTSUBMIT:"atto_sketch_submit",HGT:"height: calc(100vh - 110px);",WDT:"width: 100%;"};g.namespace("M.atto_sketch").Button=g.Base.create("button",g.M.editor_atto.EditorPlugin,[],{initializer:function(){var e;!this.get("host").canShowFilepicker("media")&&0<this.get(o)||this.addButton({icon:"ed/"+(e="iconone"),iconComponent:"atto_sketch",buttonName:e,callback:this._displayDialogue,callbackArgs:e,tags:"img",tagMatchRequiresAll:!1})},_convertImage:function(e){for(var t=(0<=e.split(",")[0].indexOf("base64")?atob:decodeURI)(e.split(",")[1]),e=e.split(",")[0].split(":")[1].split(";")[0],o=new Uint8Array(t.length),i=0;i<t.length;i++)o[i]=t.charCodeAt(i);return new Blob([o],{type:e})},_doInsert:function(e){var t,c,o,i,n,s,a,d,l=this,r=this.get("host"),u=g.Handlebars.compile('<img src="{{url}}" alt="{{alt}}" {{#if width}}width="{{width}}" {{/if}}{{#if height}}height="{{height}}" {{/if}}{{#if presentation}}role="presentation" {{/if}}{{#if customstyle}}style="{{customstyle}}" {{/if}}{{#if classlist}}class="{{classlist}}" {{/if}}{{#if id}}id="{{id}}" {{/if}}/>');if(r.saveSelection(),e=e._event,(s=$("#"+m).contents()).find("#selection"),(s=this._convertImage(s[0].getElementById("canvas_minipaint").toDataURL()))&&s.size&&"image/png"==s.type){for(c=(t=r.get("filepickeroptions").image).savepath===undefined?"/":t.savepath,o=new FormData,n=new XMLHttpRequest,a=Object.keys(t.repositories),e.preventDefault(),e.stopPropagation(),o.append("repo_upload_file",s),o.append("itemid",t.itemid),d=0;d<a.length;d++)if("upload"===t.repositories[a[d]].type){o.append("repo_id",t.repositories[a[d]].id);break}return o.append("env",t.env),o.append("sesskey",M.cfg.sesskey),o.append("client_id",t.client_id),o.append("savepath",c),o.append("ctx_id",t.context.id),e=(new Date).getTime(),i="moodleimage_"+Math.round(1e5*Math.random())+"-"+e,l.getDialogue({focusAfterHide:null}).hide(),r.focus(),r.restoreSelection(),s=u({url:M.util.image_url("i/loading_small","moodle"),alt:M.util.get_string("uploading",h),id:i}),r.insertContentAtFocusPoint(s),l.markUpdated(),n.onreadystatechange=function(){var e,t,o=l.editor.one("#"+i);if(4===n.readyState)if(200===n.status){if(e=JSON.parse(n.responseText)){if(e.error&&o)o.remove(!0);else if(e.error)return new M.core.ajaxException(e);(t=e).event&&"fileexists"===e.event&&(t=e.newfile),e=u({url:t.url,presentation:!0}),t=g.Node.create(e),o?o.replace(t):l.editor.appendChild(t),l.markUpdated()}}else g.use("moodle-core-notification-alert",function(){new M.core.alert({message:M.util.get_string("servererror","moodle")})}),o&&o.remove(!0);return!0},n.open("POST",M.cfg.wwwroot+"/repository/repository_ajax.php?action=upload",!0),n.send(o),!0}return!0},_getSelectedImageProperties:function(){var e,t={src:null,alt:null,width:null,height:null},o=this.get("host").getSelectedNodes();return(o=o&&o.filter("img"))&&o.size()?(this._selectedImage=o.item(0),(o=this._selectedImage.get("width")).toString().match(i)||(o=parseInt(o.toString(),10)),(e=this._selectedImage.get("height")).toString().match(i)||(e=parseInt(e.toString(),10)),0!==o&&(t.width=o),0!==e&&(t.height=e),t.src=this._selectedImage.get("currentSrc"),t.alt=this._selectedImage.get("alt")||"",t):(this._selectedImage=null,!1)},_displayDialogue:function(e,t){var o,i="100%",n="100vh",s=this.getDialogue({headerContent:M.util.get_string("sketchtitle",h),width:i,height:n,focusAfterHide:t});e.preventDefault(),s.after("visibleChange",function(){!1===s.getAttrs().visible&&setTimeout(function(){s.reset()},5)}),s.width!==i+"px"&&s.set("width",i+"px"),s.height!==n+"px"&&s.set("height",n+"px"),e=this._getFormContent(t),s.set("bodyContent",e),document.getElementById(m).src=a,s.centerDialogue(),s.show(),this.markUpdated(),(o=!1)!==this.get("host").getSelection()&&(o=this._getSelectedImageProperties()),document.getElementById(m).addEventListener("load",function(){var e,t;o&&((t=new Image).crossOrigin="anonymous",t.src=o.src,e=$("#"+m).contents()[0].defaultView.Layers,t={name:t.src.replace(/^.*[\\/]/,""),type:"image",data:t,width:t.naturalWidth||o.width,height:t.naturalHeight||o.height,width_original:t.naturalWidth||o.width,height_original:t.naturalHeight||o.height},e.insert(t)),(-1!==navigator.userAgent.indexOf("MSIE")||0<navigator.appVersion.indexOf("Trident/"))&&(t=document.documentElement.clientHeight,g.one(".moodle-dialogue-focused")&&g.one(".moodle-dialogue-focused").setStyle("height",t+"px"),g.one(".moodle-dialogue-focused .moodle-dialogue-bd")&&g.one(".moodle-dialogue-focused .moodle-dialogue-bd").setStyle("height",t-50+"px")),g.one(".moodle-dialogue-focused")&&(g.one(".moodle-dialogue-focused").setStyle("position","fixed"),g.one(".moodle-dialogue-focused").setStyle("z-index","999999"),g.one(".moodle-dialogue-focused").setStyle("top","0"),g.one(".moodle-dialogue-focused").setStyle("left","0")),g.one(".moodle-dialogue-focused .moodle-dialogue-bd")&&(g.one(".moodle-dialogue-focused .moodle-dialogue-bd").setStyle("height","calc(100% - 50px)"),g.one(".moodle-dialogue-focused .moodle-dialogue-bd").setStyle("padding","0")),g.one(".moodle-dialogue-focused").ancestor(".moodle-dialogue-base")&&g.one(".moodle-dialogue-focused").ancestor(".moodle-dialogue-base").setStyle("bottom","0"),g.one(".moodle-dialogue-focused").ancestor(".moodle-dialogue-fullscreen")&&g.one(".moodle-dialogue-focused").ancestor(".moodle-dialogue-fullscreen").setStyle("bottom","0")})},_getSketchWindow:function(e){var t;return e.contentWindow||e.window||((t=!(t=!t&&e.contentDocument?e.contentDocument:t)&&e.document?e.document:t)&&t.defaultView?t.defaultView:t&&t.parentWindow?t.parentWindow:undefined)},_getFormContent:function(e){var t=g.Handlebars.compile(
'<iframe src="{{isource}}" id="{{iframeID}}" style="{{CSS.HGT}}{{CSS.WDT}}" scrolling="auto" frameborder="0"></iframe><div style="text-align:center"><button class="mdl-align {{CSS.INPUTSUBMIT}}" id="{{submitid}}" style="{{selectalign}}">{{get_string "insert" component}}</button></div>'),e=g.Node.create(t({elementid:this.get("host").get("elementid"),CSS:n,component:h,clickedicon:e,isource:a,iframeID:m,submitid:"submit"}));return this._form=e,0<this.get(o)?this._form.one("."+n.INPUTSUBMIT).on("click",this._doInsert,this):this._form.one("."+n.INPUTSUBMIT).on("click",this._doInsertBase64,this),e},_doInsertBase64:function(e){e.preventDefault(),e='<img src="'+$("#"+m).contents()[0].getElementById("canvas_minipaint").toDataURL()+'" />',this.getDialogue({focusAfterHide:null}).hide(),this.editor.focus(),this.get("host").insertContentAtFocusPoint(e),this.markUpdated()}},{ATTRS:{storeinrepo:{value:0}}})},"@VERSION@",{requires:["moodle-editor_atto-plugin"]});