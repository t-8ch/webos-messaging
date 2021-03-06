enyo.kind({
    name: "Purple.AccountService",
    kind: "PalmService",
    service: "palm://org.webosinternals.purple.validator/"
});

enyo.kind({
    name: "Purple.Validator",
    kind: "VFlexBox",
    className: "basic-back",
    width: "100%",
    prefs: {},

    create: function(params) {
        this.inherited(arguments);

        if (params && (params.template || params.initialTemplate))
        {
            this.template = params.initialTemplate || params.template;
            this.prefs = this.template.preferences || {};
        }
        else
        {
            this.template = {"templateId": "org.webosinternals.purple.icq",
                             "prpl": "prpl-icq",
                             "loc_usernameLabel": "ICQ Number"};
        }
        
        if (this.template.loc_usernameLabel)
            this.$.usernameGroup.setCaption(this.template.loc_usernameLabel);
        if (this.template.loc_passwordLabel)
            this.$.passwordGroup.setCaption(this.template.loc_passwordLabel);

        enyo.log(this.template);

        // var locale = enyo.g11n && enyo.g11n.currentLocale.toISOString();

        var call_params = { prpl: this.template.prpl }

        if (enyo.g11n.toISOString)
            call_params["locale"] = enyo.g11n.toISOString();

        this.$.getOptions.call(call_params);
    },

    gotOptions: function(inSender, inResponse) {
        enyo.log(inResponse);
        this.$.options.setOptions(inResponse.options);
        this.render();
    },

    prefChanged: function(inSender, key, value) {
        this.prefs[key] = value;
    },

    signIn: function() {
        this.$.username.setDisabled(true);
        this.$.password.setDisabled(true);
        this.$.options.setDisabled(true);
        
        this.$.createButton.setCaption(AccountsUtil.BUTTON_SIGNING_IN);
        this.$.createButton.setActive(true);
        this.$.createButton.setDisabled(true);

        var params = {
            username: this.$.username.getValue(),
            password: this.$.password.getValue(),
            templateId: this.template.templateId,
            config: { prpl: this.template.prpl, preferences: this.prefs }
        }

        // TODO: Allow updating an account
        this.$.validateAccount.call(params);
        this.$.getEvent.call();
    },

    eventFail: function(inSender, inResponse) {
        enyo.log("Fail", inResponse);
        // TODO: Show error popup
        this.$.username.setDisabled(false);
        this.$.password.setDisabled(false);
        this.$.options.setDisabled(false);

        this.$.createButton.setCaption(AccountsUtil.BUTTON_SIGN_IN);
        this.$.createButton.setActive(false);
        this.$.createButton.setDisabled(false);
    },

    eventSuccess: function(inSender, inResponse) {
        enyo.log("Success", inResponse);
        if ("credentials" in inResponse)
        {
            var result = inResponse;
            result.username = this.$.username.getValue();

            return this.$.crossAppResult.sendResult(result);
        }
        else
        {
            this.$.popupGenerator.showPopup(inResponse);
        }
    },

    popupAction: function(inSender, inResponse) {
        enyo.log(inResponse);
        if ('answer' in inResponse && 'id' in inResponse) {
            this.$.answerEvent.call(inResponse);
        }
        else
        {
            enyo.log("Something is wrong here", inResponse);
            this.$.getEvent.call();
        }
    },

    answerResponse: function(inSender, inResponse) {
        enyo.log("Answer:", inResponse);
        this.$.getEvent.call();
    },

    components: [
        {
            kind: "Toolbar",
            className: "enyo-toolbar-light accounts-header",
            pack: "center",
            components: [
                {
                    kind: "Image",
                    name: "icon"
                },
                {
                    kind: "Control",
                    name: "title",
                    content: $L("Create Account")
                }
            ]
        },
        { className: "accounts-header-shadow" },
        {
            kind: "Scroller",
            flex: 1,
            components: [
                {
                    className: "box-center",
                    components: [
                        {
                            kind: "RowGroup",
                            name: "usernameGroup",
                            caption: AccountsUtil.LIST_TITLE_USERNAME,
                            className: "accounts-group",
                            components: [
                                {
                                    name: "username",
                                    kind: "Input",
                                    inputType: "email",
                                    value: "",
                                    spellcheck: false,
                                    autoCapitalize: "lowercase",
                                    autocorrect: false,
                                    oninput: "validateInput",
                                    onkeydown: "checkForEnter"
                                }
                            ]
                        },
                        {
                            kind: "RowGroup",
                            name: "passwordGroup",
                            caption: AccountsUtil.LIST_TITLE_PASSWORD,
                            className: "accounts-group",
                            components: [
                                {
                                    name: "password",
                                    kind: "Input",
                                    inputType: "password",
                                    value: "",
                                    spellcheck: false,
                                    autocorrect: false,
                                    oninput: "validateInput",
                                    onkeydown: "checkForEnter"
                                }
                            ]
                        },
                        {
                            kind: "Purple.Options",
                            name: "options",
                            onPreferenceChanged: "prefChanged"
                        },
                        {
                            name: "createButton",
                            kind: "ActivityButton",
                            disabled: true,
                            active: false,
                            caption: AccountsUtil.BUTTON_SIGN_IN,
                            className: "enyo-button-dark accounts-btn",
                            onclick: "signIn"
                        }
                    ]
                }
            ]
        },
        { className: "accounts-footer-shadow", tabIndex: -1 },
        {
            kind: "Toolbar",
            className: "enyo-toolbar-light",
            components: [
                {
                    name: "doneButton",
                    kind: "Button",
                    caption: AccountsUtil.BUTTON_BACK,
                    onclick: "doBack",
                    className: "accounts-toolbar-btn"
                }
            ]
        },
        {
            name: "popupGenerator",
            kind: "Purple.PopupGenerator",
            onAction: "popupAction"
        },
        {
            name: "getOptions",
            kind: "Purple.AccountService",
            onSuccess: "gotOptions",
        },
        {
            name: "answerEvent",
            kind: "Purple.AccountService",
            onResponse: "answerResponse"
        },
        {
            name: "validateAccount",
            kind: "Purple.AccountService"
        },
        {
            name: "getEvent",
            kind: "Purple.AccountService",
            onSuccess: "eventSuccess",
            onFailure: "eventFail"
        },
        { kind: "CrossAppResult" }
    ],

    doBack: function(sender) {
        this.$.crossAppResult.sendResult({});
    },

    validateInput: function() {
        this.$.createButton.setDisabled(
            this.$.username.isEmpty() || this.$.password.isEmpty()
        );
    },

    checkForEnter: function(inSender, inResponse) {
        if (inResponse.keyCode != 13) {
            return;
        }

        if (inSender.getName() === "username") {
            enyo.asyncMethod(this.$.password, "forceFocus");
        }
        else {
            if (!this.$.createButton.getDisabled()) {
                this.$.password.forceBlur();
                this.signIn();
            }
            else {
                enyo.asyncMethod(this.$.username, "forceFocus");
            }
        }
    }
});
