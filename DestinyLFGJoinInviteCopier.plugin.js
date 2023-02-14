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
    const config = {"main":"index.js","info":{"name":"DestinyLFGJoinInviteCopier","authors":[{"name":"Khalefa","github_username":"bodaay"}],"version":"1.0.0","description":"Renders subreddit and user mentions as hyperlinks","github":"https://github.com/vBread/bd-contributions/tree/master/RedditMentions","github_raw":"https://raw.githubusercontent.com/bodaay/DestinyLFGJoinInviteCopier/master/DestinyLFGJoinInviteCopier.plugin.js"}};
  
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
  const RegexEscape = function(string) {
    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  };
  const patter1= "/\\/join ([A-Za-z0-9_ @!:()$%&*~.])*#\\d{4}/"
  
  // const regex = /(?<!\w)\/?[ur]\/[\w\d-]{2,21}/g
  // const regex = /(?<!\w)\/join ([A-Za-z0-9_ @!:()$%&*~.])*#\d{4}/gi
  const regex = new RegExp("(?<!\\w)\\/?(join|invite) ([A-Za-z0-9_ @!$%&*~.])*#\\d{4}");
  
  return class RedditMentions extends Plugin {
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
  
          rendered.push(el);
          continue;
        }
       
        if (!regex.test(el)) {
          // BdApi.showToast(el);
          rendered.push(el);
          continue;
        }//nothing match, pust it as it is, and continue
  
        //by here, we have a match, we need now to reformat the string and push it
        const xx=el;
        let matches=regex.exec(xx);
        // BdApi.showToast(matches[0]);
        let joincopy= React.createElement('a', {
              title: "Copy Join/invite code: " + matches[0],
              rel: 'noreferrer noopener',
              onClick: () => {DiscordNative.clipboard.copy(matches[0])},
              role: 'button',
              target: '_blank'
            }, matches[0])
          
        rendered.push(joincopy);
        // BdApi.showToast(el);
        // const mentions = el.split(new RegExp("\\/(join|invite) ([A-Za-z0-9_ @!$%&*~.])*#\\d{4}"))
         
        // for (const mention of mentions) {
        //   if (!regex.test(mention)) {
        //     BdApi.showToast(mention);
        //     rendered.push(mention)
        //     continue
        //   }
        //   BdApi.showToast("okkkk");
        //   const entity = mention.match(new RegExp("\\/(join|invite) ([A-Za-z0-9_ @!$%&*~.])*#\\d{4}"))[0]
  
        //   rendered.push(
        //     React.createElement('a', {
        //       title: entity,
        //       rel: 'noreferrer noopener',
        //       href: `https://reddit.com/${entity}`,
        //       role: 'button',
        //       target: '_blank'
        //     }, mention)
        //   )
        // }
      }
  
      return rendered
    }
  }
  };
        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
  })();
  /*@end@*/