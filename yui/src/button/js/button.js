// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/*
 * @package    atto_sketch
 * @copyright  2017 Matt Davidson <davidso1@rose-hulman.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/**
 * @module moodle-atto_sketch-button
 */

/**
 * Atto text editor sketch plugin.
 *
 * @namespace M.atto_sketch
 * @class button
 * @extends M.editor_atto.EditorPlugin
 */

var COMPONENTNAME = 'atto_sketch',
    ATTRSTOREINREPO = 'storeinrepo',
    REGEX = {
        ISPERCENT: /\d+%/
    },
    IFSOURCE = M.cfg.wwwroot + '/lib/editor/atto/plugins/sketch/sketch.html',
    IFID = 'sketchpad',
    SUBMITID = 'submit',
    CSS = {
        INPUTSUBMIT: 'atto_sketch_submit',
        HGT: 'height: calc(100% - 40px);',
        WDT: 'width: 100%;'
    },
    TEMPLATE = '' +
            '<iframe src="{{isource}}" id="{{iframeID}}" style="{{CSS.HGT}}{{CSS.WDT}}" scrolling="auto" frameborder="0">' +
            '</iframe>' +
            '<div style="text-align:center">' +
                '<button class="mdl-align {{CSS.INPUTSUBMIT}}" id="{{submitid}}" style="{{selectalign}}">' +
                    '{{get_string "insert" component}}' +
                '</button>' +
            '</div>',
    IMAGETEMPLATE = '' +
                '<img src="{{url}}" alt="{{alt}}" ' +
                    '{{#if width}}width="{{width}}" {{/if}}' +
                    '{{#if height}}height="{{height}}" {{/if}}' +
                    '{{#if presentation}}role="presentation" {{/if}}' +
                    '{{#if customstyle}}style="{{customstyle}}" {{/if}}' +
                    '{{#if classlist}}class="{{classlist}}" {{/if}}' +
                    '{{#if id}}id="{{id}}" {{/if}}' +
                '/>',
    myLC = null;

    Y.namespace('M.atto_sketch').Button = Y.Base.create('button', Y.M.editor_atto.EditorPlugin, [], {
        /**
         * Initialize the button
         *
         * @method Initializer
         */
        initializer: function() {
            // Filepicker must be enabled to work.
            if (!this.get('host').canShowFilepicker('media') && this.get(ATTRSTOREINREPO) > 0) {
                return;
            }

            // Set name of button icon to be loaded.
            var icon = 'iconone';

            // Add the panoptobutton icon/buttons.
            this.addButton({
                icon: 'ed/' + icon,
                iconComponent: 'atto_sketch',
                buttonName: icon,
                callback: this._displayDialogue,
                callbackArgs: icon,
                tags: 'img',
                tagMatchRequiresAll: false
            });
        },

        /**
         * Converts base64 to binary.
         *
         * @method _convertImage
         * @param {string} dataURI
         * @return {Blob} Binary object.
         * @private
         */
        _convertImage: function(dataURI) {
            // convert base64/URLEncoded data component to raw binary data held in a string
            var byteString;
            if (dataURI.split(',')[0].indexOf('base64') >= 0) {
                byteString = atob(dataURI.split(',')[1]);
            } else {
                byteString = decodeURI(dataURI.split(',')[1]);
            }
            // separate out the mime component
            var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

            // write the bytes of the string to a typed array
            var ia = new Uint8Array(byteString.length);
            for (var i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }

            return new Blob([ia], {type: mimeString});
        },

        /**
         * Handle an image to repo.
         *
         * @method _doInsert
         * @param {EventFacade} e
         * @return {object}
         * @private
         */
        _doInsert: function(e) {
            var self = this,
                host = this.get('host'),
                template = Y.Handlebars.compile(IMAGETEMPLATE);

            host.saveSelection();
            e = e._event;

            var sketchimage = self._convertImage(myLC.getImage().toDataURL());

            // Only handle the event if an image file was dropped in.
            var handlesDataTransfer = (sketchimage && sketchimage.size && sketchimage.type == 'image/png');
            if (handlesDataTransfer) {
                var options = host.get('filepickeroptions').image,
                    savepath = (options.savepath === undefined) ? '/' : options.savepath,
                    formData = new FormData(),
                    timestamp = 0,
                    uploadid = "",
                    xhr = new XMLHttpRequest(),
                    imagehtml = "",
                    keys = Object.keys(options.repositories);

                e.preventDefault();
                e.stopPropagation();
                formData.append('repo_upload_file', sketchimage);
                formData.append('itemid', options.itemid);

                // List of repositories is an object rather than an array.  This makes iteration more awkward.
                for (var i = 0; i < keys.length; i++) {
                    if (options.repositories[keys[i]].type === 'upload') {
                        formData.append('repo_id', options.repositories[keys[i]].id);
                        break;
                    }
                }
                formData.append('env', options.env);
                formData.append('sesskey', M.cfg.sesskey);
                formData.append('client_id', options.client_id);
                formData.append('savepath', savepath);
                formData.append('ctx_id', options.context.id);

                // Insert spinner as a placeholder.
                timestamp = new Date().getTime();
                uploadid = 'moodleimage_' + Math.round(Math.random() * 100000) + '-' + timestamp;
                self.getDialogue({focusAfterHide: null}).hide();
                host.focus();
                host.restoreSelection();
                imagehtml = template({
                    url: M.util.image_url("i/loading_small", 'moodle'),
                    alt: M.util.get_string('uploading', COMPONENTNAME),
                    id: uploadid
                });
                host.insertContentAtFocusPoint(imagehtml);
                self.markUpdated();

                // Kick off a XMLHttpRequest.
                xhr.onreadystatechange = function() {
                    var placeholder = self.editor.one('#' + uploadid),
                        result,
                        file,
                        newhtml,
                        newimage;

                    if (xhr.readyState === 4) {
                        if (xhr.status === 200) {
                            result = JSON.parse(xhr.responseText);
                            if (result) {
                                if (result.error) {
                                    if (placeholder) {
                                        placeholder.remove(true);
                                    }
                                    return new M.core.ajaxException(result);
                                }

                                file = result;
                                if (result.event && result.event === 'fileexists') {
                                    // A file with this name is already in use here - rename to avoid conflict.
                                    // Chances are, it's a different image (stored in a different folder on the user's computer).
                                    // If the user wants to reuse an existing image, they can copy/paste it within the editor.
                                    file = result.newfile;
                                }

                                // Replace placeholder with actual image.
                                newhtml = template({
                                    url: file.url,
                                    presentation: true
                                });
                                newimage = Y.Node.create(newhtml);
                                if (placeholder) {
                                    placeholder.replace(newimage);
                                } else {
                                    self.editor.appendChild(newimage);
                                }
                                self.markUpdated();
                            }
                        } else {
                            Y.use('moodle-core-notification-alert', function() {
                                new M.core.alert({message: M.util.get_string('servererror', 'moodle')});
                            });
                            if (placeholder) {
                                placeholder.remove(true);
                            }
                        }
                    }
                    return true;
                };
                xhr.open("POST", M.cfg.wwwroot + '/repository/repository_ajax.php?action=upload', true);
                xhr.send(formData);
                return true;
            }
            return true;
        },

        /**
         * Gets the properties of the currently selected image.
         *
         * The first image only if multiple images are selected.
         *
         * @method _getSelectedImageProperties
         * @return {object}
         * @private
         */
        _getSelectedImageProperties: function() {
            var properties = {
                src: null,
                alt: null,
                width: null,
                height: null
            },

            // Get the current selection.
            images = this.get('host').getSelectedNodes(),
            width,
            height;

            if (images) {
                images = images.filter('img');
            }

            if (images && images.size()) {
                this._selectedImage = images.item(0);

                width = this._selectedImage.getAttribute('width');
                if (!width.match(REGEX.ISPERCENT)) {
                    width = parseInt(width, 10);
                }
                height = this._selectedImage.getAttribute('height');
                if (!height.match(REGEX.ISPERCENT)) {
                    height = parseInt(height, 10);
                }

                if (width !== 0) {
                    properties.width = width;
                }
                if (height !== 0) {
                    properties.height = height;
                }

                properties.src = this._selectedImage.getAttribute('src');
                properties.alt = this._selectedImage.getAttribute('alt') || '';
                return properties;
            }

            // No image selected - clean up.
            this._selectedImage = null;
            return false;
        },

        /**
         * Display the panoptobutton Dialogue
         *
         * @method _displayDialogue
         * @param {EventFacade} e
         * @param {object} clickedicon
         * @private
         */
        _displayDialogue: function(e, clickedicon) {
            var width = '100%',
                height = '100vh',
                bodycontent,
                dialogue;

            dialogue = this.getDialogue({
                headerContent: M.util.get_string('sketchtitle', COMPONENTNAME),
                width: width,
                height: height,
                focusAfterHide: clickedicon
            });

            e.preventDefault();

            // When dialog becomes invisible, reset it. This fixes problems with multiple editors per page.
            dialogue.after('visibleChange', function() {
                var attributes = dialogue.getAttrs();

                if (attributes.visible === false) {
                    setTimeout(function() {
                        dialogue.reset();
                    }, 5);
                }
            });

            // Dialog doesn't detect changes in width without this.
            // If you reuse the dialog, this seems necessary.
            if (dialogue.width !== width + 'px') {
                dialogue.set('width', width + 'px');
            }

            if (dialogue.height !== height + 'px') {
                dialogue.set('height', height + 'px');
            }
            // Append buttons to iframe.
            bodycontent = this._getFormContent(clickedicon);

            // Set to bodycontent.
            dialogue.set('bodyContent', bodycontent);

            document.getElementById(IFID).src = IFSOURCE;
            dialogue.centerDialogue();
            dialogue.show();
            this.markUpdated();

            var selected = false;
            if (this.get('host').getSelection() !== false) {
                selected = this._getSelectedImageProperties();
            }
            document.getElementById(IFID).addEventListener("load", function() {
                var sketchpad = document.getElementById(IFID).contentDocument.getElementsByClassName('literally')[0];
                var iframe = document.getElementById(IFID).contentWindow;
                myLC = iframe.LC.init(sketchpad,
                       {
                            imageURLPrefix: 'assets/img',
                            tools: iframe.LC.defaultTools.concat([iframe.regularShapes])
                       });

                if (selected) { // Selection is an image.
                    var newImage = new Image();
                    newImage.src = selected.src;
                    var newShape = iframe.LC.createShape('Image',
                                   {
                                        x: 10,
                                        y: 10,
                                        image: newImage
                                   });
                    myLC.saveShape(newShape);
                }

                // IE 11 and under do not understand CSS3 height calc().
                if (navigator.userAgent.indexOf('MSIE') !== -1
                    || navigator.appVersion.indexOf('Trident/') > 0) {
                    var ieheight = document.documentElement.clientHeight;
                    if (Y.one('.moodle-dialogue-focused')) {
                        Y.one('.moodle-dialogue-focused').setStyle('height', ieheight + 'px');
                    }
                    if (Y.one('.moodle-dialogue-focused .moodle-dialogue-bd')) {
                        Y.one('.moodle-dialogue-focused .moodle-dialogue-bd').setStyle('height', ieheight - 50 + 'px');
                    }
                }

                // Set top and left to corner and calculate height with CSS3.
                if (Y.one('.moodle-dialogue-focused')) {
                    Y.one('.moodle-dialogue-focused').setStyle('position', 'fixed');
                    Y.one('.moodle-dialogue-focused').setStyle('z-index', '9999');
                    Y.one('.moodle-dialogue-focused').setStyle('top', '0');
                    Y.one('.moodle-dialogue-focused').setStyle('left', '0');
                }
                if (Y.one('.moodle-dialogue-focused .moodle-dialogue-bd')) {
                    Y.one('.moodle-dialogue-focused .moodle-dialogue-bd').setStyle('height', 'calc(100% - 50px)');
                    Y.one('.moodle-dialogue-focused .moodle-dialogue-bd').setStyle('padding', '0');
                }
                if (Y.one('.moodle-dialogue-focused').ancestor('.moodle-dialogue-base')) {
                    Y.one('.moodle-dialogue-focused').ancestor('.moodle-dialogue-base').setStyle('bottom', "0");
                }
                if (Y.one('.moodle-dialogue-focused').ancestor('.moodle-dialogue-fullscreen')) {
                    Y.one('.moodle-dialogue-focused').ancestor('.moodle-dialogue-fullscreen').setStyle('bottom', "0");
                }
            });
        },

        /**
         * Return the dialogue content for the tool, attaching any required
         * events.
         *
         * @method _getFormContent
         * @param {object} clickedicon
         * @return {Node} The content to place in the dialogue.
         * @private
         */
        _getFormContent: function(clickedicon) {
            var template = Y.Handlebars.compile(TEMPLATE),
                content = Y.Node.create(template({
                    elementid: this.get('host').get('elementid'),
                    CSS: CSS,
                    component: COMPONENTNAME,
                    clickedicon: clickedicon,
                    isource: IFSOURCE,
                    iframeID: IFID,
                    submitid: SUBMITID
                }));

                this._form = content;
                // Check setting.
                if (this.get(ATTRSTOREINREPO) > 0) {
                    this._form.one('.' + CSS.INPUTSUBMIT).on('click', this._doInsert, this);
                } else {
                    this._form.one('.' + CSS.INPUTSUBMIT).on('click', this._doInsertBase64, this);
                }

                return content;
        },

        /**
         * Inserts the users input onto the page
         * @method _doInsertBase64
         * @param {EventFacade} e
         * @private
         */
        _doInsertBase64: function(e) {
            e.preventDefault();
            var parent = this,
                imgstring = myLC.getImage().toDataURL(),
                sketch = '<img src="' + imgstring + '" />';

            // Hide the pop-up after we've received the selection in the "deliveryList" message.
            // Hiding before message is received causes exceptions in IE.
            parent.getDialogue({focusAfterHide: null}).hide();

            parent.editor.focus();
            parent.get('host').insertContentAtFocusPoint(sketch);
            parent.markUpdated();
        }
    }, {
    ATTRS: {
        /**
         * How to save sketches.
         *
         * @attribute storeinrepo
         * @type Number
         * @default 0
         */
        storeinrepo: {
            value: 0
        }
    }});