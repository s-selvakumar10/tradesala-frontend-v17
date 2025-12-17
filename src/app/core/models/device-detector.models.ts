export enum DevicePlatform {
    Mobile = 'mobile',
    Tablet = 'tablet',
    Desktop = 'desktop'
  }
  
  export enum DeviceOs {
    Ios = 'ios',
    Android = 'android',
    Macos = 'macos',
    Windows = 'windows',
    Blackberry = 'blackberry',
    Fxos = 'fxos'
  }
  
  export enum DeviceMobile {
    AndroidPhone = 'androidPhone',
    Iphone = 'iphone',
    WindowsPhone = 'windowsPhone',
    BlackberryPhone = 'blackberryPhone',
    Meego = 'meego',
    FxosPhone = 'fxosPhone'
  }
  
  export enum DeviceTablet {
    Ipad = 'ipad',
    AndroidTablet = 'androidTablet',
    BlackberryTablet = 'blackberryTablet',
    WindowsTablet = 'windowsTablet',
    FxosTablet = 'fxosTablet'
  }
  
  export interface DeviceInfo {
    platform: DevicePlatform
    os: DeviceOs | string
    device: DeviceMobile | DeviceTablet | string
  }
  