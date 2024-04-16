/**
 * @name DestinyLFGJoinInviteCopier
 * @author Khalefa
 * @description Render /join /invite Destiny LFG as hyperlinks for easy copying
 * @website https://github.com/bodaay/DestinyLFGJoinInviteCopier
 * @source https://raw.githubusercontent.com/bodaay/DestinyLFGJoinInviteCopier/master/DestinyLFGJoinInviteCopier.plugin.js
 * @version 1.4.0
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
  static mySettings = {enable_es: true,enable_fr: true,enable_it: true,enable_de: true};
  constructor(meta) {
    // Do stuff in here before starting
    
  }
  static buildSetting(text, key, type, value, callback = () => {}) {
      const setting = Object.assign(document.createElement("div"), {className: "setting"});
      const label = Object.assign(document.createElement("span"), {textContent: text});
      const input = Object.assign(document.createElement("input"), {type: type, name: key, value: value});
      if (type == "checkbox" && value) input.checked = true;
      input.addEventListener("change", () => {
          const newValue = type == "checkbox" ? input.checked : input.value;
          DestinyLFGJoinInviteCopier.mySettings[key] = newValue;
          BdApi.Data.save(DestinyLFGJoinInviteCopier.name, "settings", DestinyLFGJoinInviteCopier.mySettings);
          callback(newValue);
      });
      setting.append(label, input);
      return setting;
  }
  static enabled_Langauge(name){
      //TODO, show at least something when we change the value here of the checkbox
  }
  getSettingsPanel() {
    const mySettingsPanel = document.createElement("div");
    mySettingsPanel.id = "my-settings";
    //Langauge Settings
      //Espanol
      const es_lang_Setting = DestinyLFGJoinInviteCopier.buildSetting("Espanol", "enable_es", "checkbox",
              DestinyLFGJoinInviteCopier.mySettings.enable_es, DestinyLFGJoinInviteCopier.enabled_Langauge("Espanol"));
      const fr_lang_Setting = DestinyLFGJoinInviteCopier.buildSetting("French", "enable_fr", "checkbox",
              DestinyLFGJoinInviteCopier.mySettings.enable_fr, DestinyLFGJoinInviteCopier.enabled_Langauge("French"));
      const it_lang_Setting = DestinyLFGJoinInviteCopier.buildSetting("Italian", "enable_it", "checkbox",
              DestinyLFGJoinInviteCopier.mySettings.enable_it, DestinyLFGJoinInviteCopier.enabled_Langauge("Italian"));
      const de_lang_Setting = DestinyLFGJoinInviteCopier.buildSetting("Deutsch", "enable_de", "checkbox",
              DestinyLFGJoinInviteCopier.mySettings.enable_de, DestinyLFGJoinInviteCopier.enabled_Langauge("Italian"));
     
    //add all
    mySettingsPanel.append(es_lang_Setting,fr_lang_Setting,it_lang_Setting,de_lang_Setting);

    return mySettingsPanel;
}
  start() {
    //load saved settings
    Object.assign(DestinyLFGJoinInviteCopier.mySettings, BdApi.Data.load(DestinyLFGJoinInviteCopier.name, "settings"));
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
    const regex = /\/(?:join|invite) .+?#\d{4}/gi
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
    const mentions = args[0].split(/(\/(?:join|invite) .+?#\d{4})/i) //this will split the sentence into multiple items, all we wll just push them as they are, except the one matching our regest, we will replace it with a hyperlink
    // console.log(mentions)
    for (const mention of mentions) {
      if (!regex.test(mention)) {
            // console.log("xxxx  ===  " + mention)
            rendered.push(mention)
            continue
      }
      const entity = mention.match(/(\/(?:join|invite) .+?#\d{4})/i)[1]
      const entity_es = entity.replace(/\/join|\/invite/gi, function(matched) {
        return matched.toLowerCase() === '/join' ? '/unirse' : '/invitar';
      });
      const entity_fr = entity.replace(/\/join|\/invite/gi, function(matched) {
        return matched.toLowerCase() === '/join' ? '/rejoindre' : '/inviter';
      });
      const entity_it = entity.replace(/\/join|\/invite/gi, function(matched) {
        return matched.toLowerCase() === '/join' ? '/partecipa' : '/invita';
      });
      const entity_de = entity.replace(/\/join|\/invite/gi, function(matched) {
        return matched.toLowerCase() === '/join' ? '/beitreten' : '/einladen';
      });

      var enable_es=DestinyLFGJoinInviteCopier.mySettings.enable_es;
      var enable_fr=DestinyLFGJoinInviteCopier.mySettings.enable_fr;
      var enable_it=DestinyLFGJoinInviteCopier.mySettings.enable_it;
      var enable_de=DestinyLFGJoinInviteCopier.mySettings.enable_de;
      //English
      rendered.push(
            BdApi.React.createElement('a', {
              title: "Copy: '" + entity + "'",
              rel: 'noreferrer noopener',
              onClick: () => { DiscordNative.clipboard.copy(entity); BdApi.showToast("Copied: '" + entity + "' To Clipboard") },
              role: 'button',
              target: '_blank'
            }, entity)
          )
     
      //Espanol
      if (enable_es){
          rendered.push(BdApi.React.createElement(
              'span',
              null, // No props are needed since it's just text
              "  |  "  // This is the text you want to display
          ))
          rendered.push(
            BdApi.React.createElement('a', {
              title: "Copy: '" + entity_es + "'",
              rel: 'noreferrer noopener',
              onClick: () => { DiscordNative.clipboard.copy(entity_es); BdApi.showToast("Copied: '" + entity_es + "' To Clipboard") },
              role: 'button',
              target: '_blank'
            }, "es")
          )
        
      }

  //French
  if (enable_fr){
      rendered.push(BdApi.React.createElement(
          'span',
          null, // No props are needed since it's just text
          "  |  "  // This is the text you want to display
      ))
  rendered.push(
    BdApi.React.createElement('a', {
      title: "Copy: '" + entity_fr + "'",
      rel: 'noreferrer noopener',
      onClick: () => { DiscordNative.clipboard.copy(entity_fr); BdApi.showToast("Copied: '" + entity_fr + "' To Clipboard") },
      role: 'button',
      target: '_blank'
    }, "fr")
  )
}
//Italian
if (enable_it){
              rendered.push(BdApi.React.createElement(
                  'span',
                  null, // No props are needed since it's just text
                  "  |  "  // This is the text you want to display
              ))
          rendered.push(
          BdApi.React.createElement('a', {
              title: "Copy: '" + entity_it + "'",
              rel: 'noreferrer noopener',
              onClick: () => { DiscordNative.clipboard.copy(entity_it); BdApi.showToast("Copied: '" + entity_it + "' To Clipboard") },
              role: 'button',
              target: '_blank'
          }, "it")
          )
}
//Deutsch
if (enable_de){
          rendered.push(BdApi.React.createElement(
              'span',
              null, // No props are needed since it's just text
              "  |  "  // This is the text you want to display
          ))
      rendered.push(
      BdApi.React.createElement('a', {
      title: "Copy: '" + entity_de + "'",
      rel: 'noreferrer noopener',
      onClick: () => { DiscordNative.clipboard.copy(entity_de); BdApi.showToast("Copied: '" + entity_de + "' To Clipboard") },
      role: 'button',
      target: '_blank'
      }, "de")
      )
  }
    }
    return rendered
   
  }
};


/*@end@*/
