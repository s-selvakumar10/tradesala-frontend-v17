import { PLATFORM_ID, Inject, Injectable } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {  DeviceInfo, DevicePlatform, DeviceOs, DeviceMobile, DeviceTablet } from './../models/device-detector.models';
@Injectable({
    providedIn: 'root',
  })
export class MobileDeviceDetectorService {
  userAgent: string
  
  constructor(@Inject(PLATFORM_ID) private platformId) {
    this.userAgent = isPlatformBrowser(this.platformId) ? window.navigator.userAgent.toLowerCase() : ''
  }

  private find(match) {
    return this.userAgent.indexOf(match) !== -1
  }

  private findMatch(type) {
    return Object.entries(type).find(([key, val]) => !!val) || []
  }

  private deviceOS() {
    const isWindows = this.find('windows')
    const isIos = this.deviceShared()[DeviceMobile.Iphone] || this.deviceShared()[DeviceTablet.Ipad]

    return {
      [DeviceOs.Windows]: isWindows,
      [DeviceOs.Macos]: !isIos && this.find('mac'),
      [DeviceOs.Android]: !isWindows && this.find('android'),
      [DeviceOs.Ios]: isIos,
      [DeviceOs.Blackberry]: this.find('blackberry') || this.find('bb10'),
      [DeviceOs.Fxos]: (this.find('(mobile') || this.find('(tablet')) && this.find(' rv:')
    }
  }

  private deviceShared() {
    return {
      [DeviceMobile.Iphone]: !this.find('windows') && this.find('iphone'),
      [DeviceTablet.Ipad]: this.find('ipad') || (isPlatformBrowser(this.platformId) && navigator.platform === 'MacIntel') && ((isPlatformBrowser(this.platformId) && navigator.maxTouchPoints) > 1),
    }
  }

  private deviceMobile() {
    return {
      [DeviceMobile.Iphone]: this.deviceShared()[DeviceMobile.Iphone],
      [DeviceMobile.AndroidPhone]: this.deviceOS()[DeviceOs.Android] && this.find('mobile'),
      [DeviceMobile.WindowsPhone]: this.deviceOS()[DeviceOs.Windows] && this.find('phone'),
      [DeviceMobile.BlackberryPhone]: this.deviceOS()[DeviceOs.Blackberry] && !this.find('tablet'),
      [DeviceMobile.Meego]: this.find('meego'),
      [DeviceMobile.FxosPhone]: this.deviceOS()[DeviceOs.Fxos] && this.find('mobile')
    }
  }

  private deviceTablet() {
    return {
      [DeviceTablet.Ipad]: this.deviceShared()[DeviceTablet.Ipad],
      [DeviceTablet.AndroidTablet]: this.deviceOS()[DeviceOs.Android] && !this.find('mobile'),
      [DeviceTablet.BlackberryTablet]: this.deviceOS()[DeviceOs.Blackberry] && this.find('tablet'),
      [DeviceTablet.WindowsTablet]: this.deviceOS()[DeviceOs.Windows] && (this.find('touch') && !this.deviceMobile()[DeviceMobile.WindowsPhone]),
      [DeviceTablet.FxosTablet]: this.deviceOS()[DeviceOs.Fxos] && this.find('tablet'),
    }
  }

  isMobile() {
    return this.findMatch(this.deviceMobile()).length > 0
  }

  isTablet() {
    return this.findMatch(this.deviceTablet()).length > 0
  }

  isDesktop() {
    return !this.isTablet() && !this.isMobile()
  }

  getDeviceInfo(): DeviceInfo {
    const touchDevices = this.findMatch({ ...this.deviceMobile(), ...this.deviceTablet() })
    return {
      platform: this.isDesktop() ? DevicePlatform.Desktop : (this.isMobile() ? DevicePlatform.Mobile : DevicePlatform.Tablet),
      os: this.findMatch(this.deviceOS())[0],
      device: touchDevices.length ? touchDevices[0] : DevicePlatform.Desktop
    }
  }
}
