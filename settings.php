<?php
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

/**
 * Settings that allow different methods for image placement.
 *
 * @package    atto_sketch
 * @copyright  2017 Matt Davidson <davidso1@rose-hulman.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

$ADMIN->add('editoratto', new admin_category('atto_sketch', new lang_string('pluginname', 'atto_sketch')));

$settings = new admin_settingpage('atto_sketch_settings', new lang_string('settings', 'atto_sketch'));
if ($ADMIN->fulltree) {
    // Number of groups to show when collapsed.
    $name = new lang_string('storeinrepo', 'atto_sketch');
    $desc = new lang_string('storeinrepo_desc', 'atto_sketch');

    $setting = new admin_setting_configcheckbox('atto_sketch/storeinrepo',
                                                $name,
                                                $desc,
                                                0);
    $settings->add($setting);
}