/**
 * @name DestinyLFGJoinInviteCopier
 * @website https://github.com/bodaay/DestinyLFGJoinInviteCopier
 * @source https://raw.githubusercontent.com/bodaay/DestinyLFGJoinInviteCopier/master/DestinyLFGJoinInviteCopier.plugin.js
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
    const config = {"main":"index.js","info":{"name":"DestinyLFGJoinInviteCopier","authors":[{"name":"Khalefa","github_username":"bodaay"}],"version":"1.0.0","description":"Render /join /invite Destiny LFG as hyperlinks for easy copying","github":"https://github.com/vBread/bd-contributions/tree/master/RedditMentions","github_raw":"https://raw.githubusercontent.com/bodaay/DestinyLFGJoinInviteCopier/master/DestinyLFGJoinInviteCopier.plugin.js"}};
  
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
          const { Patcher, WebpackModules, DiscordModules } = Library
          const { React } = DiscordModules
        
          const regex = /\/(?:join|invite) (?:[A-Za-z0-9_ @,!$\^%\-&*~.])*#\d{4}/gi
        
          return class DestinyLFGJoinInviteCopier extends Plugin {
            onStart() {
              const parser = WebpackModules.getByProps('parse', 'parseTopic')
        
              Patcher.after(parser, 'parse', (_, args, res) => this.inject(args, res))
            }
        
            onStop() {
              Patcher.unpatchAll()
            }
        
            inject(args, res) {
              const rendered = []
        
              for (const el of res) {
                if (typeof el !== 'string') {
                  if (['u', 'em', 'strong'].includes(el.type)) {
                    el.props.children = this.inject({}, el.props.children)
                  }
        
                  if (el.type.name === 'StringPart') {
                    el.props.parts = this.inject({}, el.props.parts)
                  }
                  // console.log("eee" + el)
                  rendered.push(el);
                  continue;
                }
                
                if (!regex.test(el)) {
                  rendered.push(el);
                  continue;
                }
                const mentions = el.split(/(\/(?:join|invite) (?:[A-Za-z0-9_ @,!$\^%\-&*~.])*#\d{4})/i)
                // console.log(mentions)
                for (const mention of mentions) {
                  if (!regex.test(mention)) {
                    // console.log("xxxx  ===  " + mention)
                    rendered.push(mention)
                    continue
                  }
        
                  const entity = mention.match(/(\/(?:join|invite) (?:[A-Za-z0-9_ @,!$\^%\-&*~.])*#\d{4})/i)[1]
                  
                  rendered.push(
                    React.createElement('a', {
                      title: "Copy: '" + entity + "'",
                      rel: 'noreferrer noopener',
                      onClick: () => {DiscordNative.clipboard.copy(entity);BdApi.showToast("Copied: '" + entity + "' To Clipboard")},
                      role: 'button',
                      target: '_blank'
                    }, entity)
                  )
                }
              }
        
              return rendered
      }
    }
  };
          return plugin(Plugin, Api);
      })(global.ZeresPluginLibrary.buildPlugin(config));
  })();
  /*@end@*/