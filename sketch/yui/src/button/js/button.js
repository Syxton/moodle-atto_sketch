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
    REGEX = {
        ISPERCENT: /\d+%/
    },
    ALIGNMENTS = [
        // Vertical alignment.
        {
            name: 'verticalAlign',
            str: 'alignment_top',
            value: 'text-top',
            margin: '0 0.5em'
        }, {
            name: 'verticalAlign',
            str: 'alignment_middle',
            value: 'middle',
            margin: '0 0.5em'
        }, {
            name: 'verticalAlign',
            str: 'alignment_bottom',
            value: 'text-bottom',
            margin: '0 0.5em',
            isDefault: true
        },

        // Floats.
        {
            name: 'float',
            str: 'alignment_left',
            value: 'left',
            margin: '0 0.5em 0 0'
        }, {
            name: 'float',
            str: 'alignment_right',
            value: 'right',
            margin: '0 0 0 0.5em'
        }
    ],
    IFSOURCE = '../lib/editor/atto/plugins/sketch/sketch.html',
    IFID = 'sketchpad',
    IFID = 'sketchpad',
    SUBMITID = 'submit',
    SELECTALIGN = '',
    CSS = {
        INPUTSUBMIT: 'atto_sketch_submit',
        HEIGHT: 'min-height: 400px;height: calc(100% - 40px);',
        WIDTH: 'width: 100%;'
    },
    myLC = null,
    TEMPLATE = '<iframe src="{{isource}}" id="{{iframeID}}" style="{{CSS.HEIGHT}}{{CSS.WIDTH}}" scrolling="auto" frameborder="0"></iframe>' +
               '<div style="text-align:center"><button class="mdl-align {{CSS.INPUTSUBMIT}}" id="{{submitid}}" style="{{selectalign}}">{{get_string "insert" component}}</button></div>';

    Y.namespace('M.atto_sketch').Button = Y.Base.create('button', Y.M.editor_atto.EditorPlugin, [], {
        /**
         * A reference to the current selection at the time that the dialogue
         * was opened.
         *
         * @property _currentSelection
         * @type Range
         * @private
         */
        _currentSelection: null,

        /**
         * Initialize the button
         *
         * @method Initializer
         */
        initializer: function () {
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
                    height: null,
                    align: '',
                    presentation: false
                },

                // Get the current selection.
                images = this.get('host').getSelectedNodes(),
                width,
                height,
                style,
                image;

            if (images) {
                images = images.filter('img');
            }

            if (images && images.size()) {
                image = this._removeLegacyAlignment(images.item(0));
                this._selectedImage = image;

                style = image.getAttribute('style');
                properties.customstyle = style;

                width = image.getAttribute('width');
                if (!width.match(REGEX.ISPERCENT)) {
                    width = parseInt(width, 10);
                }
                height = image.getAttribute('height');
                if (!height.match(REGEX.ISPERCENT)) {
                    height = parseInt(height, 10);
                }

                if (width !== 0) {
                    properties.width = width;
                }
                if (height !== 0) {
                    properties.height = height;
                }
                this._getAlignmentPropeties(image, properties);
                properties.src = image.getAttribute('src');
                properties.alt = image.getAttribute('alt') || '';
                properties.presentation = (image.get('role') === 'presentation');
                return properties;
            }

            // No image selected - clean up.
            this._selectedImage = null;
            return false;
        },

        /**
         * Removes any legacy styles added by previous versions of the atto image button.
         *
         * @method _removeLegacyAlignment
         * @param {Y.Node} imageNode
         * @return {Y.Node}
         * @private
         */
        _removeLegacyAlignment: function(imageNode) {
            if (!imageNode.getStyle('margin')) {
                // There is no margin therefore this cannot match any known alignments.
                return imageNode;
            }

            ALIGNMENTS.some(function(alignment) {
                if (imageNode.getStyle(alignment.name) !== alignment.value) {
                    // The name/value do not match. Skip.
                    return false;
                }

                var normalisedNode = Y.Node.create('<div>');
                normalisedNode.setStyle('margin', alignment.margin);
                if (imageNode.getStyle('margin') !== normalisedNode.getStyle('margin')) {
                    // The margin does not match.
                    return false;
                }

                Y.log('Legacy alignment found and removed.', 'info', 'atto_image-button');
                imageNode.addClass(this._getAlignmentClass(alignment.value));
                imageNode.setStyle(alignment.name, null);
                imageNode.setStyle('margin', null);

                return true;
            }, this);

            return imageNode;
        },

        _getAlignmentClass: function(alignment) {
            return CSS.ALIGNSETTINGS + '_' + alignment;
        },

        /**
         * Sets the alignment of a properties object.
         *
         * @method _getAlignmentPropeties
         * @param {Node} image The image that the alignment properties should be found for
         * @param {Object} properties The properties object that is created in _getSelectedImageProperties()
         * @private
         */
        _getAlignmentPropeties: function(image, properties) {
            var complete = false,
                defaultAlignment;

            // Check for an alignment value.
            complete = ALIGNMENTS.some(function(alignment) {
                var classname = this._getAlignmentClass(alignment.value);
                if (image.hasClass(classname)) {
                    properties.align = alignment.value;
                    Y.log('Found alignment ' + alignment.value, 'debug', 'atto_image-button');
    
                    return true;
                }
    
                if (alignment.isDefault) {
                    defaultAlignment = alignment.value;
                }
    
                return false;
            }, this);
    
            if (!complete && defaultAlignment) {
                properties.align = defaultAlignment;
            }
        },

        /**
         * Display the panoptobutton Dialogue
         *
         * @method _displayDialogue
         * @private
         */
        _displayDialogue: function (e, clickedicon) {
            // Store the current selection.
            this._currentSelection = this.get('host').getSelection();

            var width = '95%',
                height = '95%',
                dialogue = this.getDialogue({
                    headerContent: M.util.get_string('sketchtitle', COMPONENTNAME),
                    width: width,
                    height: height,
                    focusAfterHide: clickedicon
                }),
                buttonform,
                bodycontent,
                defaultserver,
                eventmethod,
                evententer,
                messageevent,
                aservername;

            e.preventDefault();

            // When dialog becomes invisible, reset it. This fixes problems with multiple editors per page.
            dialogue.after('visibleChange', function() {
                var attributes = dialogue.getAttrs();

                if(attributes.visible === false) {
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

            Y.one('.moodle-dialogue-bd').setStyle('min-height', '500px');
            Y.one('.moodle-dialogue-bd').setStyle('height', 'calc(100% - 55px)');

            // IE 11 and under do not understand CSS3 height calc().
            if (navigator.userAgent.indexOf('MSIE')!==-1
                || navigator.appVersion.indexOf('Trident/') > 0) {
                Y.one('.moodle-dialogue').setStyle('height', '0');
                Y.one('.moodle-dialogue').setStyle('min-height', '560px');
            }

            // Set to bodycontent.
            dialogue.set('bodyContent', bodycontent);

            document.getElementById(IFID).src = IFSOURCE;
            dialogue.centerDialogue();
            dialogue.show();
            this.markUpdated();

            var selected = false;
            if (this._currentSelection !== false) {
                selected = this._getSelectedImageProperties();
            }
            document.getElementById(IFID).addEventListener("load", function() {
                myLC =  document.getElementById(IFID).contentWindow.LC.init(document.getElementById(IFID).contentDocument.getElementsByClassName('literally')[0],
                        {
                            imageURLPrefix: 'assets/img'
                        });

                if (selected) { // Selection is an image.
                    var newImage = new Image()
                    newImage.src = selected.src;
    
                    myLC.saveShape(document.getElementById(IFID).contentWindow.LC.createShape('Image', {x: 10, y: 10, image: newImage}));
                }

            });
        },

        /**
         * Return the dialogue content for the tool, attaching any required
         * events.
         *
         * @method _getDialogueContent
         * @return {Node} The content to place in the dialogue.
         * @private
         */
        _getFormContent: function (clickedicon) {
            var template = Y.Handlebars.compile(TEMPLATE),
                content = Y.Node.create(template({
                    elementid: this.get('host').get('elementid'),
                    CSS: CSS,
                    component: COMPONENTNAME,
                    clickedicon: clickedicon,
                    isource: IFSOURCE,
                    iframeID: IFID,
                    submitid: SUBMITID,
                    selectalign: SELECTALIGN
                }));

            this._form = content;
            this._form.one('.' + CSS.INPUTSUBMIT).on('click', this._doInsert, this);
            return content;
        },

        /**
         * Inserts the users input onto the page
         * @method _getDialogueContent
         * @private
         */
        _doInsert: function (e) {
            e.preventDefault();
            var parent = this,
                imgstring = myLC.getImage().toDataURL(),
                sketch = '<img src="'+imgstring+'" />';

            // Hide the pop-up after we've received the selection in the "deliveryList" message.
            // Hiding before message is received causes exceptions in IE.
            parent.getDialogue({ focusAfterHide: null }).hide();

            parent.editor.focus();
            parent.get('host').insertContentAtFocusPoint(sketch);
            parent.markUpdated();
        }
    });