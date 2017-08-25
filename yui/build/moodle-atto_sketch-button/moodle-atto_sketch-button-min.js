YUI.add("moodle-atto_sketch-button",function(e,t){var n="atto_sketch",r={ISPERCENT:/\d+%/},i=M.cfg.wwwroot+"/lib/editor/atto/plugins/sketch/sketch.html",s="sketchpad",o="submit",u={INPUTSUBMIT:"atto_sketch_submit",HGT:"height: calc(100% - 40px);",WDT:"width: 100%;"},a='<iframe src="{{isource}}" id="{{iframeID}}" style="{{CSS.HGT}}{{CSS.WDT}}" scrolling="auto" frameborder="0">                </iframe>                <div style="text-align:center">                    <button class="mdl-align {{CSS.INPUTSUBMIT}}" id="{{submitid}}" style="{{selectalign}}">                        {{get_string "insert" component}}                    </button>                </div>',f=null;e.namespace("M.atto_sketch").Button=e.Base.create("button",e.M.editor_atto.EditorPlugin,[],{initializer:function(){var e="iconone";this.addButton({icon:"ed/"+e,iconComponent:"atto_sketch",buttonName:e,callback:this._displayDialogue,callbackArgs:e,tags:"img",tagMatchRequiresAll:!1})},_getSelectedImageProperties:function(){var e={src:null,alt:null,width:null,height:null},t=this.get("host").getSelectedNodes(),n,i;return t&&(t=t.filter("img")),t&&t.size()?(this._selectedImage=t.item(0),n=this._selectedImage.getAttribute("width"),n.match(r.ISPERCENT)||(n=parseInt(n,10)),i=this._selectedImage.getAttribute("height"),i.match(r.ISPERCENT)||(i=parseInt(i,10)),n!==0&&(e.width=n),i!==0&&(e.height=i),e.src=this._selectedImage.getAttribute("src"),e.alt=this._selectedImage.getAttribute("alt")||"",e):(this._selectedImage=null,!1)},_displayDialogue:function(t,r){var o="100%",u="100vh",a,l;l=this.getDialogue({headerContent:M.util.get_string("sketchtitle",n),width:o,height:u,focusAfterHide:r}),t.preventDefault(),l.after("visibleChange",function(){var e=l.getAttrs();e.visible===!1&&setTimeout(function(){l.reset()},5)}),l.width!==o+"px"&&l.set("width",o+"px"),l.height!==u+"px"&&l.set("height",u+"px"),a=this._getFormContent(r),l.set("bodyContent",a),document.getElementById(s).src=i,l.centerDialogue(),l.show(),this.markUpdated();var c=!1;this.get("host").getSelection()!==!1&&(c=this._getSelectedImageProperties()),document.getElementById(s).addEventListener("load",function(){var t=document.getElementById(s).contentDocument.getElementsByClassName("literally")[0],n=document.getElementById(s).contentWindow;f=n.LC.init(t,{imageURLPrefix:"assets/img",tools:n.LC.defaultTools.concat([n.regularShapes])});if(c){var r=new Image;r.src=c.src;var i=n.LC.createShape("Image",{x:10,y:10,image:r});f.saveShape(i)}if(navigator.userAgent.indexOf("MSIE")!==-1||navigator.appVersion.indexOf("Trident/")>0){var o=document.documentElement.clientHeight;e.one(".moodle-dialogue-focused")&&e.one(".moodle-dialogue-focused").setStyle("height",o+"px"),e.one(".moodle-dialogue-focused .moodle-dialogue-bd")&&e.one(".moodle-dialogue-focused .moodle-dialogue-bd").setStyle("height",o-50+"px")}e.one(".moodle-dialogue-focused")&&(e.one(".moodle-dialogue-focused").setStyle("z-index","9999"),e.one(".moodle-dialogue-focused").setStyle("top","0"),e.one(".moodle-dialogue-focused").setStyle("left","0")),e.one(".moodle-dialogue-focused .moodle-dialogue-bd")&&(e.one(".moodle-dialogue-focused .moodle-dialogue-bd").setStyle("height","calc(100% - 50px)"),e.one(".moodle-dialogue-focused .moodle-dialogue-bd").setStyle("padding","0")),e.one(".moodle-dialogue-focused").ancestor(".moodle-dialogue-base")&&e.one(".moodle-dialogue-focused").ancestor(".moodle-dialogue-base").setStyle("bottom","0"),e.one(".moodle-dialogue-focused").ancestor(".moodle-dialogue-fullscreen")&&e.one(".moodle-dialogue-focused").ancestor(".moodle-dialogue-fullscreen").setStyle("bottom","0")})},_getFormContent:function(t){var r=e.Handlebars.compile(a),f=e.Node.create(r({elementid:this.get("host").get("elementid"),CSS:u,component:n,clickedicon:t,isource:i,iframeID:s,submitid:o}));return this._form=f,this._form.one("."+u.INPUTSUBMIT).on("click",this._doInsert,this),f},_doInsert:function(e){e.preventDefault();var t=this,n=f.getImage().toDataURL(),r='<img src="'+n+'" />';t.getDialogue({focusAfterHide:null}).hide(),t.editor.focus(),t.get("host").insertContentAtFocusPoint(r),t.markUpdated()}})},"@VERSION@",{requires:["moodle-editor_atto-plugin"]});
