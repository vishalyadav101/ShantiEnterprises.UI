import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  DEFAULT_NAVBAR_THEME,
  NAVBAR_PRESETS,
  NavbarTheme,
  applyNavbarTheme,
  isNavbarThemeTooLight,
} from './../../../core/utils/navbar-theme';

/**
 * Admin website-settings form ke andar lagayein:
 * <app-navbar-theme-picker [theme]="navbarTheme" (themeChange)="onNavbarTheme($event)" />
 * Live preview apne aap hota hai; DB mein save aapka existing Save button karega.
 */
@Component({
  selector: 'app-navbar-theme-picker',
  standalone: true,
  template: `
    <div class="ntp">
      <div class="ntp-title">Navbar color</div>

      <div
        class="ntp-preview"
        [style.background]="'linear-gradient(115deg,' + theme.a + ',' + theme.b + ')'"
      >
        <span class="pv-btn">Home</span>
        <span class="pv-btn">Login</span>
        <span class="pv-btn pv-gold" [style.background]="theme.accent">Sign Up</span>
        <span
          class="pv-glow"
          [style.background]="'linear-gradient(90deg,transparent,' + theme.glow + ',transparent)'"
        ></span>
      </div>

      <div class="ntp-row">
        @for (p of presets; track p.name) {
          <button
            type="button"
            class="ntp-sw"
            (click)="usePreset(p.name)"
            [class.sel]="isSame(p.t)"
          >
            <i [style.background]="'linear-gradient(135deg,' + p.t.a + ',' + p.t.b + ')'"></i
            >{{ p.name }}
          </button>
        }
      </div>

      <div class="ntp-row">
        <label
          >Color 1
          <input type="color" [value]="theme.a" (input)="set('a', $any($event.target).value)"
        /></label>
        <label
          >Color 2
          <input type="color" [value]="theme.b" (input)="set('b', $any($event.target).value)"
        /></label>
        <label
          >Glow
          <input type="color" [value]="theme.glow" (input)="set('glow', $any($event.target).value)"
        /></label>
        <label
          >Button (Sign Up)
          <input
            type="color"
            [value]="theme.accent"
            (input)="set('accent', $any($event.target).value)"
        /></label>
        <button type="button" class="ntp-reset" (click)="usePreset('blue')">Reset</button>
      </div>

      @if (warning) {
        <div class="ntp-warn">{{ warning }}</div>
      }
    </div>
  `,
  styles: [
    `
      .ntp-title {
        font-weight: 700;
        margin-bottom: 10px;
      }
      .ntp-preview {
        position: relative;
        display: flex;
        gap: 8px;
        justify-content: flex-end;
        align-items: center;
        padding: 12px 14px;
        border-radius: 16px;
        margin-bottom: 14px;
        box-shadow: 0 6px 0 -2px rgba(0, 0, 0, 0.35);
      }
      .pv-btn {
        padding: 7px 14px;
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        background: rgba(255, 255, 255, 0.14);
        color: #fff;
        font-size: 13px;
        font-weight: 600;
      }
      .pv-gold {
        color: #2b1500;
        border-color: rgba(255, 255, 255, 0.5);
      }
      .pv-glow {
        position: absolute;
        left: 8%;
        right: 8%;
        bottom: -1px;
        height: 2px;
      }
      .ntp-row {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        align-items: center;
        margin-bottom: 12px;
      }
      .ntp-sw {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        border: 2px solid #dee2e6;
        background: #fff;
        border-radius: 99px;
        padding: 4px 14px 4px 4px;
        font-size: 13px;
        font-weight: 600;
        text-transform: capitalize;
        cursor: pointer;
      }
      .ntp-sw i {
        width: 26px;
        height: 26px;
        border-radius: 50%;
        display: block;
      }
      .ntp-sw.sel {
        border-color: #0d6efd;
      }
      label {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        font-weight: 600;
        color: #495057;
      }
      input[type='color'] {
        width: 38px;
        height: 30px;
        padding: 0;
        border: 2px solid #dee2e6;
        border-radius: 8px;
        background: #fff;
        cursor: pointer;
      }
      .ntp-reset {
        border: 1px solid #dee2e6;
        background: #fff;
        border-radius: 8px;
        padding: 5px 14px;
        font-size: 13px;
        cursor: pointer;
      }
      .ntp-warn {
        font-size: 13px;
        color: #b02a37;
      }
    `,
  ],
})
export class NavbarThemePickerComponent {
  @Input() theme: NavbarTheme = { ...DEFAULT_NAVBAR_THEME };
  @Output() themeChange = new EventEmitter<NavbarTheme>();

  presets = Object.entries(NAVBAR_PRESETS).map(([name, t]) => ({ name, t }));
  warning = '';

  isSame(t: NavbarTheme) {
    return JSON.stringify(t) === JSON.stringify(this.theme);
  }

  usePreset(name: string) {
    this.update({ ...NAVBAR_PRESETS[name] });
  }

  set(key: keyof NavbarTheme, value: string) {
    this.update({ ...this.theme, [key]: value });
  }

  private update(t: NavbarTheme) {
    if (isNavbarThemeTooLight(t)) {
      this.warning = 'Color 1 aur Color 2 dark rakhein, warna white text nahi dikhega.';
      return;
    }
    this.warning = '';
    this.theme = t;
    applyNavbarTheme(t); // live preview
    this.themeChange.emit(t);
  }
}
