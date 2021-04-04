tyrano.plugin.kag.stat.running_key_event = [];



$.key_event = {


    pushEvent: function(pm) {

        switch (pm.method) {
            case 'click':
            case 'right_click':
            case 'keydown':
            case 'keyup':
                pm.event = this.on_event[pm.method];
                break;
            default:
                console.error('[key_event] メソッドが正しく指定されていません');
                return false;
        }

        tyrano.plugin.kag.stat.running_key_event.push(pm);

        this.resetEventAll();
        this.startEventAll();

    },


    clearEvent: function(pm) {
        const TG = tyrano.plugin.kag;
        this.resetEventAll();
        if (!pm.reset) {
            if (!pm.all || pm.name) {
                if (pm.name) {
                    TG.stat.running_key_event = TG.stat.running_key_event.filter(value => value != pm.name);
                } else {
                    console.error('[clear_key_event] nameが正しく指定されていません。');
                    return false;
                }
            } else {
                TG.stat.running_key_event = TG.stat.running_key_event.filter(value => !value.clear);
            }
        } else {
            TG.stat.running_key_event = [];
        }
        //console.log(TG.stat.running_key_event);
    },


    resetEventAll: function() {
        //console.log('resetEventAll');
        tyrano.plugin.kag.stat.running_key_event.forEach(value => $(value.element).off());
    },


    startEventAll: function() {
        //console.log('startEventAll');
        tyrano.plugin.kag.stat.running_key_event.forEach(value => {
            //console.log(value);
            value.event(value);
        });
    },


    on_event: {

        click: function(pm) {
            const that = $.key_event.on_event;
            const event = that.getEventObject('click', pm);
            const param = that.getEmbParam(pm);
            $(pm.element).on(event.click, () => that.embJump(...param.jump));
            if (!!event.touchstart) $(pm.element).on(event.touchstart, () => that.embJump(...param.jump));
            that.commonEvent(event, pm, param);
        },

        right_click: function(pm) {
            const that = $.key_event.on_event;
            const event = that.getEventObject('right_click', pm);
            const param = that.getEmbParam(pm);
            $(pm.element).on(event.contextmenu, () => that.embJump(...param.jump));
            that.commonEvent(event, pm, param);
        },

        keydown: function(pm) {
            const that = $.key_event.on_event;
            const event = that.getEventObject('keydown', pm);
            const param = that.getEmbParam(pm);
            $(pm.element).on(event.keydown, kde => {
                if (kde.keyCode == pm.key_code) {
                    that.embJump(...param.jump);
                }
            });
            that.commonEvent(event, pm, param);
        },

        keyup: function(pm) {
            const that = $.key_event.on_event;
            const event = that.getEventObject('keyup', pm);
            const param = that.getEmbParam(pm);
            $(pm.element).on(event.keyup, kue => {
                if (kue.keyCode == pm.key_code) {
                    that.embJump(...param.jump);
                }
            });
            that.commonEvent(event, pm, param);
        },

        commonEvent: function(event, pm, param) {
            const that = $.key_event.on_event;
            if (!!pm.mouseout_exp) $(pm.element).on(event.mouseover, () => that.embScript(...param.mouseover));
            if (!!pm.mouseout_exp) $(pm.element).on(event.mouseout, () => that.embScript(...param.mouseout));
        },

        getEventObject: function(content, pm) {
            const obj = {
                mouseover: 'mouseover.' + pm.name,
                mouseout: 'mouseout.' + pm.name
            };
            switch (content) {
                case 'click':
                    obj.click = 'click.' + pm.name;
                    if ($.userenv() != 'pc') obj.touchstart = 'touchstart.' + pm.name;
                    break;
                case 'right_click':
                    obj.contextmenu = 'contextmenu.' + pm.name;
                    break;
                case 'keydown':
                    obj.keydown = 'keydown.' + pm.name;
                    break;
                case 'keyup':
                    obj.keyup = 'keyup.' + pm.name;
                    break;
            }
            return obj;
        },

        getEmbParam: function(pm) {
            return {
                jump: [
                    pm.exp,
                    pm.preexp,
                    pm.storage,
                    pm.target
                ],
                mouseover: [
                    pm.mouseover_exp,
                    pm.preexp
                ],
                mouseout: [
                    pm.mouseout_exp,
                    pm.preexp
                ]
            };
        },

        embScript: function(exp, preexp) {
            if (exp) tyrano.plugin.kag.embScript(exp, preexp);
        },

        embJump: function(exp, preexp, storage, target) {
            this.embScript(exp, preexp);
            if (!!storage || !!target) tyrano.plugin.kag.ftag.startTag('jump', {storage, target});
        }

    },


    parseBoolean: function(bool) {
        return bool == 'true';
    },


    parseElement: function(elem) {
        return elem === 'window'? window : elem === 'document'? document : elem;
    }


};



tyrano.plugin.kag.tag.key_event = {

    pm: {
        name: 'event',
        clear: 'true',
        method: 'keydown',
        key_code: '13',
        element: 'window',
        storage: null,
        target: null,
        exp: null,
        mouseover_exp: null,
        mouseout_exp: null,
        preexp: null,
    },

    start: function(pm) {
        //console.log('tag: [key_event]');
        pm.clear = $.key_event.parseBoolean(pm.clear);
        pm.element = $.key_event.parseElement(pm.element);
        $.key_event.pushEvent(pm);
        this.kag.ftag.nextOrder();
    }

};



tyrano.plugin.kag.tag.clear_key_event = {

    pm: {
        name: null,
        element: 'window',
        all: 'true',
        reset: 'false'
    },

    start: function(pm) {
        //console.log('tag: [clear_key_event]');
        pm.element = $.key_event.parseElement(pm.element);
        pm.all = $.key_event.parseBoolean(pm.all);
        pm.reset = $.key_event.parseBoolean(pm.reset);
        $.key_event.clearEvent(pm);
        this.kag.ftag.nextOrder();
    }

};



tyrano.plugin.kag.tag.make_key_event = {

    start: function(pm) {
        //console.log('tag: [make_key_event]');
        $.key_event.resetEventAll();
        $.key_event.startEventAll();
        this.kag.ftag.nextOrder();
    }

};



['key_event', 'clear_key_event', 'make_key_event'].forEach(tag_name => {
    tyrano.plugin.kag.ftag.master_tag[tag_name] = object(tyrano.plugin.kag.tag[tag_name]);
    tyrano.plugin.kag.ftag.master_tag[tag_name].kag = TYRANO.kag;
});