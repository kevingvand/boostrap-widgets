$(function () {
    $.widget("custom.contextMenu",
        {
            options: {
                actions: [],
            },

            _create: function () {
                this.target = this.element;

                this._build();
            },

            _build: function () {
                var self = this;

                this.target.on("contextmenu", function (event) {
                    $(".context-menu").remove();

                    if (event.ctrlKey) return;

                    self._buildContextMenu(event);

                    return false;
                });

                $("body").click(function (event) {
                    if ($(event.target).parents(".context-menu").length) return;

                    if ($(".context-menu").length) {
                        $(".context-menu").remove();
                        return false;
                    }
                });
            },

            _buildContextMenu: function (event) {
                var self = this;

                this.contextMenu = this._buildMenuBlock(this.options.actions, true);
                $("body").append(this.contextMenu);

                self.contextMenu.css("left", self._getMenuPosition(event.clientX, "width", "scrollLeft"));
                self.contextMenu.css("top", self._getMenuPosition(event.clientY, "height", "scrollTop"));
            },

            _buildMenuBlock: function (actions, isRoot) {
                var self = this;

                var $contextMenu = $("<div>")
                    .addClass("dropdown context-menu")
                    .on("hide.bs.dropdown", function (e) {
                        return false;
                    });

                var $contextMenuItemWrapper = $("<div>")
                    .addClass("dropdown-menu")
                    .appendTo($contextMenu)

                if (isRoot)
                    $contextMenuItemWrapper.css("display", "block");

                actions.forEach(action => {

                    if (action.isDivider) {
                        $("<div>")
                            .addClass("dropdown-divider")
                            .appendTo($contextMenuItemWrapper);

                        return;
                    }

                    if (action.type === "switch") {
                        action.keepOpen = true;
                        var $switch = self._buildMenuItemSwitch(action);
                        $switch.appendTo($contextMenuItemWrapper);

                        return;
                    }

                    var $menuItem = $("<a>")
                        .addClass("dropdown-item")
                        .text(action.text)
                        .appendTo($contextMenuItemWrapper);

                    if(action.dataAttributes) {
                        Object.keys(action.dataAttributes).forEach((attribute) => {
                            $menuItem.attr(`data-${toKebabCase(attribute)}`, action.dataAttributes[attribute]);
                        })
                    }

                    if (action.actions) {

                        var $menuItemGroup = $("<div>")
                            .addClass("dropright")
                            .appendTo($contextMenuItemWrapper);

                        $menuItem
                            .addClass("d-flex justify-content-between align-items-center")
                            .append($("<i>").addClass("fas fa-angle-right ml-3"))
                            .attr("data-toggle", "dropdown")
                            .click(function () {
                                var $siblingDropdowns = $(this).closest(".dropdown-menu").find(".dropdown");

                                $siblingDropdowns.hide();

                                $(this).parent().siblings(".dropdown-item").removeClass("context-menu-item-active");
                                $(this).parent().siblings().find(".dropdown-item").removeClass("context-menu-item-active");

                                $(this).addClass("context-menu-item-active");

                                var $nextDropdown = $(this).next();
                                if ($nextDropdown.is(":hidden"))
                                    $nextDropdown.show();
                            })
                            .appendTo($menuItemGroup);

                        var $subMenu = self._buildMenuBlock(action.actions);
                        $subMenu.appendTo($menuItemGroup);
                    } else {
                        $menuItem
                            .click(action.action)
                            .click(function () {
                                if (!action.keepParentsOpen && !action.keepOpen) {
                                    $contextMenu.parents(".context-menu").remove();
                                    $contextMenu.remove();
                                    return;
                                }

                                if (!action.keepOpen) {
                                    $contextMenu.hide();
                                }
                            });
                    }
                });

                return $contextMenu;
            },

            _buildMenuItemSwitch: function (action) {
                var self = this;

                var itemWrapper = $("<li>")
                    .addClass("dropdown-item dropdown-item-switch");

                $("<span>")
                    .addClass("mr-3")
                    .text(action.text)
                    .appendTo(itemWrapper);

                var switchWrapper = $("<div>")
                    .addClass("custom-control custom-switch custom-switch-no-label")
                    .appendTo(itemWrapper);

                var switchInput = $("<input>")
                    .addClass("custom-control-input")
                    .attr("type", "checkbox")
                    .change(function () {
                        if (!action.onToggle) return;

                        action.onToggle($(this).prop("checked"), $(this));
                    })
                    .appendTo(switchWrapper);

                if (action.isChecked)
                    switchInput.prop("checked", true);

                var switchLabel = $("<label>")
                    .addClass("custom-control-label mr-2")
                    .appendTo(switchWrapper);

                itemWrapper.click(function () {
                    var isChecked = switchInput.prop("checked");
                    switchInput
                        .prop("checked", !isChecked)
                        .trigger("change");

                });

                return itemWrapper;
            },

            _getMenuPosition: function (mouse, direction, scrollDir) {
                var win = $(window)[direction](),
                    scroll = $(window)[scrollDir](),
                    menu = this.contextMenu.find(".dropdown-menu")[direction](),
                    position = mouse + scroll;

                // opening menu would pass the side of the page
                if (mouse + menu > win && menu < mouse) {
                    position -= menu;
                }

                return position;
            },

            _destroy: function () {
                this.contextMenu.remove();
            }
        });
});