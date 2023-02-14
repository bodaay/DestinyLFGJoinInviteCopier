/**
 * @name DestinyLFGJoinInviteCopier
 * @authorLink https://github.com/bodaay
 * @website https://github.com/bodaay/DestinyLFGJoinInviteCopier
 * @source https://raw.githubusercontent.com/bodaay/DestinyLFGJoinInviteCopier/master/DestinyLFGJoinInviteCopier.plugin.js
 * @version 1.0.0
 * @updateUrl https://raw.githubusercontent.com/bodaay/DestinyLFGJoinInviteCopier/master/DestinyLFGJoinInviteCopier.plugin.js
 */
/*@cc_on
@if (@_jscript)
	
	// Offer to self-install for clueless users that try to run this directly.
	var shell = WScript.CreateObject("WScript.Shell");
	var fs = new ActiveXObject("Scripting.FileSystemObject");
	var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\BetterDiscord\plugins");
	var pathSelf = WScript.ScriptFullName;
	// Put the user at ease by addressing them in the first person
	shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
	if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
		shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
	} else if (!fs.FolderExists(pathPlugins)) {
		shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
	} else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
		fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
		// Show the user where to put plugins in the future
		shell.Exec("explorer " + pathPlugins);
		shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
	}
	WScript.Quit();

@else@*/ 

module.exports = (() => {
    const config = {"info":{"name":"DestinyLFGJoinInviteCopier","authors":[{"name":"Khalefa","discord_id":"135895345296048128","github_username":"bodaay"}],"version":"1.0.0","description":"Highlight /join /invite command in Destiny LFG","github":"https://github.com/bodaay/DestinyLFGJoinInviteCopier","github_raw":"https://raw.githubusercontent.com/bodaay/DestinyLFGJoinInviteCopier/master/DestinyLFGJoinInviteCopier.plugin.js","authorLink":"https://github.com/bodaay","updateUrl":"https://raw.githubusercontent.com/bodaay/DestinyLFGJoinInviteCopier/master/DestinyLFGJoinInviteCopier.plugin.js"},"main":"index.js"};
  
    return !global.ZeresPluginLibrary ? class {
        constructor() {this._config = config;}
        getName() {return config.info.name;}
        getAuthor() {return config.info.authors.map(a => a.name).join(", ");}
        getDescription() {return config.info.description;}
        getVersion() {return config.info.version;}
        load() {
            BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
                confirmText: "Download Now",
                cancelText: "Cancel",
                onConfirm: () => {
                    require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, response, body) => {
                        if (error) return require("electron").shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
                        await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
                    });
                }
            });
        }
        start() {}
        stop() {}
    } : (([Plugin, Api]) => {
        const plugin = (Plugin, Library) => {
    //         const switchCss = ``;
    // const inboxCss = ``;
  const defaultSettings = {
    whitelistedUsers: [],
    keywords:  [
      "/\\/join ([A-Za-z0-9_ @!:()$%&*~.])*#\\d{4}/",
      "/\\/invite ([A-Za-z0-9_ @!:()$%&*~.])*#\\d{4}/"
  ],
    ignoredUsers: [],
    guilds: {},
    enabled: true,
    unreadMatches: {},
    notifications: false, 
    allowSelf: true,  
    allowEmbeds: false, 
    allowBots: true, 
  };  
  const {
    DOMTools,
    Patcher,
    Logger, 
    Settings,
    Utilities,
    PluginUtilities,
    ReactTools,
    Modals, 
    Tooltip,
    Toasts: Toast,
    DiscordModules: Modules,
    WebpackModules,
  } = Library;
  
  const RegexEscape = function(string) {
    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  };
  
  return class DestinyLFGJoinInviteCopier extends Plugin {
    async onStart() {
      this.cancelPatches = [];
      this.loadSettings();
     
      // PluginUtilities.addStyle(this.getName(), switchCss);
      // PluginUtilities.addStyle(this.getName(), inboxCss);
  
      let dispatchModule = BdApi.findModuleByProps('dispatch', 'subscribe');
      BdApi.Patcher.after(this.getName(), dispatchModule, 'dispatch', this.handleMessage.bind(this));
  
      // const TitleBar = WebpackModules.getModule(m => Object.values(m).some(m => m?.Title && m?.Caret && m?.toString?.()?.includes('toolbar')), { searchGetters: false });
      // this.inboxPanel = null;
      // Patcher.after(TitleBar, "ZP", (self, [props], ret) => {
      //   if (props.toolbar.type === 'function') return;
      //   if (this.inboxPanel == null) {
      //     this.inboxPanel = this.buildInboxPanel();
      //   }
      //   if (typeof props.toolbar.props.children[0].splice !== 'function') return;
      //   props.toolbar.props.children[0].splice(Math.max(3, props.toolbar.props.children[0].length - 1), 0, this.inboxPanel);
      // });
  
      this.userId = Modules.UserStore.getCurrentUser().id;
    }
  
    onStop() {
      // this.saveSettings();
  
      BdApi.Patcher.unpatchAll(this.getName());
      PluginUtilities.removeStyle(this.getName());
    }
  
    objectValues(object) {
      if (!object) return [];
      const res = [];
      for(const [k, v] of Object.entries(object)) {
        if (typeof v === 'object') {
          res.push(...this.objectValues(v));
        } else {
          res.push(v);
        }
      }
      return res;
    }
  
    handleMessage(_, args) {
      try {
        // BdApi.showToast("Hello");
        const guilds = Object.
        values(Modules.GuildStore.getGuilds());
        let event = args[0];
        if (event.type !== 'MESSAGE_CREATE') return;
        // get me  data
        let { message } = event;
        // get channel data
        let channel = Modules.ChannelStore.getChannel(message.channel_id);
        // assert message data is right
        if (!message.author) {
          message = Modules.MessageStore.getMessage(channel.id, message.id);
          if (!message || !message.author) return;
        }
        if (this.settings.allowSelf === false && message.author.id === this.userId) return;
        // ignore ignored users
        if (this.settings.ignoredUsers.includes(message.author.id)) return;
  
        if (!message.content && (!message.embeds || message.embeds.length === 0)) return;
        if (message.author.bot && !this.settings.allowBots) return;
  
        // no dms!
        if (!channel.guild_id) return;
        if (!message.guild_id) message.guild_id = channel.guild_id;
  
        // add guild to settings if it does not exist
        //commented out by khalefa
        // if (this.settings.guilds[channel.guild_id] == null) {
        //   let g = guilds.find(g => g.id === channel.guild_id);
        //   if (!g) return;
        //   this.settings.guilds[g.id] = {
        //     // set all channels to enabled by default
        //     channels: g.channels
        //       .filter(c => c.type === 'GUILD_TEXT')
        //       .reduce((obj, c) => {
        //         obj[c.id] = true;
        //         return obj;
        //       }, {}),
        //     enabled: true,
        //   };
        //   this.saveSettings();
        // }
  
        // ensure that the channel this is from is enabled
        //commented out by khalefa
        // if (!this.settings.guilds[channel.guild_id].channels[channel.id]) return;
  
        let whitelistedUserFound = !this.settings.whitelistedUsers.every((userId) => {
          if (message.author.id === userId) {
            const guild = guilds.find(g => g.id === channel.guild_id);
            this.pingWhitelistMatch(message, channel, guild.name);
            return false; // stop searching
          }
          return true; 
        });
  
        // do not bother scanning keywords if the user themself was matched
        if (whitelistedUserFound) {
          return;
        }
  
        // run through every single keyword as a regex
        this.settings.keywords.every((kw) => {
          let rx;
          let uid;
          // first, filter out any user id matching
          let isUserSpecific = /^@(\d+):(.*)$/g.exec(kw);
          if (isUserSpecific != null) {
            uid = isUserSpecific[1];
            kw = isUserSpecific[2];
            console.log(kw);
            console.log(`uid = ${uid} ${typeof uid}`);
            console.log(`mid = ${message.author.id} ${typeof message.author.id}`);
          }
          // then convert the rest into a regex
          let isSlashRegex = /^\/(.*)\/([a-z]*)$/g.exec(kw);
          if (isSlashRegex != null) {
            let text = isSlashRegex[1];
            let flags = isSlashRegex[2];
            rx = new RegExp(text, flags);
          } else {
            rx = new RegExp(RegexEscape(kw));
          }
  
          if (uid != null && !isNaN(uid) && message.author.id !== uid) {
            return true;
          }
          if (rx.test(message.content) || (
            message.embeds &&
            this.settings.allowEmbeds &&
            rx.test(JSON.stringify(this.objectValues(message.embeds)))
          )) {
            let guild = guilds.find(g => g.id === channel.guild_id);
            this.pingSuccess(message, channel, guild.name, rx);
            return false; // stop searching
          }
          return true;
        });
      } catch (e) {
        BdApi.showToast(`${e}`);
        Logger.error(`${e}`);
      }
    } 
  
    sendMatchNotification(thumbnail, title, text, redirect, message) {
      // Modules.NotificationModule.showNotification(
      //   thumbnail,
      //   title,
      //   text,
      //   {
      //   },
      //   // opts
      //   {
      //     sound: this.settings.notifications ? 'message1' : null,
      //     onClick: () => {
      //       delete this.settings.unreadMatches[message.id];
      //       this.saveSettings(); 
      //       Modules.NavigationUtils.transitionTo(
      //         redirect,
      //         undefined,
      //         undefined,
      //       );
      //     }
      //   }
      // );
    }
  
    pingWhitelistMatch(message, channel, guild) {
      // Logger.info('Whitelist match found!');
      
      // this.sendMatchNotification(
      //   `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.webp?size=256`,
      //   `User match in ${guild}!`,
      //   `${message.author.username} typed in #${channel.name}.`,
      //   `/channels/${message.guild_id}/${channel.id}/${message.id}`,
      //   message,
      // );
      // message._match = `User ID ${message.author.id}`;
      // this.settings.unreadMatches[message.id] = message;
      // this.saveSettings();
    }
  
    pingSuccess(message, channel, guild, match) {
      //khalefa
      Logger.info('Match found!');
  
      let mymatch;
      mymatch = match.exec(message.content);
      Logger.info(mymatch[0]);
      BdApi.showToast(`${message.author.username} matched ${mymatch[0]} in #${channel.name}.`);
      // message.content="hi";
      // DiscordNative.clipboard.copy(mymatch[0]);
      BdApi.showToast(`${message.content}`);
      //BdApi.alert();
      this.sendMatchNotification(
        `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.webp?size=256`,
        `Keyword match in ${guild}!`,
        `${message.author.username} matched ${match} in #${channel.name}.`,
        `/channels/${message.guild_id}/${channel.id}/${message.id}`,
        message,
      );
      if (this.settings.notifications) { 
        Modules.SoundModule.playSound("message1", 0.4);
      }
      message._match = `${match}`;
      this.settings.unreadMatches[message.id] = message;
      this.saveSettings();
    }
  
    makeSwitch(iv, callback) {
      // let label = document.createElement('label');
      // label.className = 'switch';
      // let input = document.createElement('input');
      // input.setAttribute('type', 'checkbox');
      // input.checked = iv;
      // let div = document.createElement('div');
      // label.append(input);
      // label.append(div);
      // input.addEventListener('input', function (e) { 
      //   callback(this.checked);
      // });
      // return label;
    }
  
    
  
    saveSettings() {
      // clear out empty keywords :)
      // this.settings.keywords = this.settings.keywords.filter((v) => v.trim().length > 0);
      // PluginUtilities.saveSettings('DestinyLFGJoinInviteCopier', this.settings);
    }
  
    loadSettings() {
      this.settings = Utilities.deepclone(PluginUtilities.loadSettings('DestinyLFGJoinInviteCopier', defaultSettings));
    }
  
  
  
  };
  };
        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
  })();
  /*@end@*/ 