import ExpoModulesCore

public class ExpoSettingsModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoSettings")

    Events("onChange", "onChangeTheme")
    
    Function("setTheme", { (value: Theme) -> Void in
      Self.setValue("theme", value:value.rawValue)
      self.sendEvent("onChangeTheme", [
        "theme": value.rawValue
      ])
    })
    
    Function("getTheme", { () -> String? in
      Self.getValue("theme") ?? Theme.System.rawValue
    })
  
    Function("get", { (key: String) -> String? in
      Self.getValue(key)
    })
    
    Function("set", { (key: String, value: String) -> Void in
      Self.setValue(key, value:value)
      self.sendEvent("onChange", [
        "key": key,
        "value": value
      ])
    })
  
    Function("get", { (key: String) -> String? in
      Self.getValue(key)
    })
  }
  
  enum Theme: String, Enumerable {
    case Light = "light"
    case Dark = "dark"
    case System = "system"
  }


  static func setValue(_ key: String, value: String) -> Void {
    UserDefaults.standard.set(value, forKey:key)
  }
  
  static func getValue(_ key: String) -> String? {
    UserDefaults.standard.string(forKey: key)
  }
  
// TODO: get all keys and send update
//  static func getAll() -> String {
//    UserDefaults.standard.keys
//  }
}
