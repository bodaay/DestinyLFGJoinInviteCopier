/**
 * @name DestinyLFGJoinInviteCopier
 * @author Khalefa
 * @description Render /join /invite Destiny LFG as hyperlinks for easy copying
 * @website https://github.com/bodaay/DestinyLFGJoinInviteCopier
 * @source https://raw.githubusercontent.com/bodaay/DestinyLFGJoinInviteCopier/master/DestinyLFGJoinInviteCopier.plugin.js
 * @version 1.2.0
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

module.exports = class DestinyLFGJoinInviteCopier {
  constructor(meta) {
    // Do stuff in here before starting
  }
  start() {
    // Do stuff when enabled
    const parser = BdApi.Webpack.getModule(BdApi.Webpack.Filters.byProps("parse", "parseTopic"));
    // console.log(parser)
    BdApi.Patcher.after("DestinyLFGPatcher", parser, 'parse', (_, args, res) => this.inject(args, res));
  }
  stop() {
    // Cleanup when disabled
    BdApi.Patcher.unpatchAll("DestinyLFGPatcher");
  }
  inject(args, res) {
    // console.log(args[0])
    const regex = /\/(?:join|invite) .+#\d{4}/gi
    const rendered = []
    // console.log(res) 
    if (!regex.test(args[0])) { // if it fails regex test, just return it as it as
      rendered.push(res);
      return rendered
    }
    // console.log("This one pass: " + args[0])
    
    //
    //Update June 28th, 2023: this might be the best solution, but actually its faster now since I'm right away returning if reges fail
    // console.log(res) if you print this, you will understand the recent changes
    //with recent changes, res now split into multiple smaller items, each space or / is a new item
    //the optimum way I think is that I don't change how they are doing it, just replace the items with a hyperlink item
    //
    const mentions = args[0].split(/(\/(?:join|invite) .+#\d{4})/i) //this will split the sentence into multiple items, all we wll just push them as they are, except the one matching our regest, we will replace it with a hyperlink
    // console.log(mentions)
    for (const mention of mentions) {
      if (!regex.test(mention)) {
            // console.log("xxxx  ===  " + mention)
            rendered.push(mention)
            continue
      }
      const entity = mention.match(/(\/(?:join|invite) .+#\d{4})/i)[1]
      rendered.push(
            BdApi.React.createElement('a', {
              title: "Copy: '" + entity + "'",
              rel: 'noreferrer noopener',
              onClick: () => { DiscordNative.clipboard.copy(entity); BdApi.showToast("Copied: '" + entity + "' To Clipboard") },
              role: 'button',
              target: '_blank'
            }, entity)
          )
    }
    return rendered
   
  }
};


/*@end@*/
