import { IconNamesEnum } from '@design-system/constants/iconNames.enum';

export const IconMap: {
  [key in IconNamesEnum]: () => Promise<typeof import('*.svg')>;
} = {
  [IconNamesEnum.Apple]: () => import(`@design-system/icons/apple.svg`),
  [IconNamesEnum.ArrowDown]: () =>
    import(`@design-system/icons/arrow-down.svg`),
  [IconNamesEnum.ArrowLeft]: () =>
    import(`@design-system/icons/arrow-left.svg`),
  [IconNamesEnum.ArrowRight]: () =>
    import(`@design-system/icons/arrow-right.svg`),
  [IconNamesEnum.ArrowUp]: () => import(`@design-system/icons/arrow-up.svg`),
  [IconNamesEnum.Arrow]: () => import(`@design-system/icons/arrow.svg`),
  [IconNamesEnum.Ban]: () => import(`@design-system/icons/ban.svg`),
  [IconNamesEnum.Basket]: () => import(`@design-system/icons/basket.svg`),
  [IconNamesEnum.BatteryFair]: () =>
    import(`@design-system/icons/battery-fair.svg`),
  [IconNamesEnum.BellAlt]: () => import(`@design-system/icons/bell-alt.svg`),
  [IconNamesEnum.Brush]: () => import(`@design-system/icons/brush.svg`),
  [IconNamesEnum.CalendarPen]: () =>
    import(`@design-system/icons/calendar-pen.svg`),
  [IconNamesEnum.Calendar]: () => import(`@design-system/icons/calendar.svg`),
  [IconNamesEnum.Camera]: () => import(`@design-system/icons/camera.svg`),
  [IconNamesEnum.Card]: () => import(`@design-system/icons/card.svg`),
  [IconNamesEnum.CargoOpen]: () =>
    import(`@design-system/icons/cargo-open.svg`),
  [IconNamesEnum.ChartGantt]: () =>
    import(`@design-system/icons/chart-gantt.svg`),
  [IconNamesEnum.CheckFalseHoverFalsePressedFalseDisabledFalse]: () =>
    import(
      `@design-system/icons/check-false-hover-false-pressed-false-disabled-false.svg`
    ),
  [IconNamesEnum.CheckFalseHoverFalsePressedFalseDisabledTrue]: () =>
    import(
      `@design-system/icons/check-false-hover-false-pressed-false-disabled-true.svg`
    ),
  [IconNamesEnum.CheckFalseHoverFalsePressedTrueDisabledFalse]: () =>
    import(
      `@design-system/icons/check-false-hover-false-pressed-true-disabled-false.svg`
    ),
  [IconNamesEnum.CheckFalseHoverTruePressedFalseDisabledFalse]: () =>
    import(
      `@design-system/icons/check-false-hover-true-pressed-false-disabled-false.svg`
    ),
  [IconNamesEnum.CheckTrueHoverFalsePressedFalseDisabledFalse]: () =>
    import(
      `@design-system/icons/check-true-hover-false-pressed-false-disabled-false.svg`
    ),
  [IconNamesEnum.CheckTrueHoverFalsePressedFalseDisabledTrue]: () =>
    import(
      `@design-system/icons/check-true-hover-false-pressed-false-disabled-true.svg`
    ),
  [IconNamesEnum.CheckTrueHoverFalsePressedTrueDisabledFalse]: () =>
    import(
      `@design-system/icons/check-true-hover-false-pressed-true-disabled-false.svg`
    ),
  [IconNamesEnum.CheckTrueHoverTruePressedFalseDisabledFalse]: () =>
    import(
      `@design-system/icons/check-true-hover-true-pressed-false-disabled-false.svg`
    ),
  [IconNamesEnum.Check]: () => import(`@design-system/icons/check.svg`),
  [IconNamesEnum.CheckboxCheckedFilled]: () =>
    import(`@design-system/icons/checkbox-checked-filled.svg`),
  [IconNamesEnum.CheckboxChecked]: () =>
    import(`@design-system/icons/checkbox-checked.svg`),
  [IconNamesEnum.CheckboxIndeterminate]: () =>
    import(`@design-system/icons/checkbox-indeterminate.svg`),
  [IconNamesEnum.CheckboxUnchecked]: () =>
    import(`@design-system/icons/checkbox-unchecked.svg`),
  [IconNamesEnum.ChevronDownLeft]: () =>
    import(`@design-system/icons/chevron-down-left.svg`),
  [IconNamesEnum.ChevronDown]: () =>
    import(`@design-system/icons/chevron-down.svg`),
  [IconNamesEnum.ChevronLeftDouble]: () =>
    import(`@design-system/icons/chevron-left-double.svg`),
  [IconNamesEnum.ChevronLeft]: () =>
    import(`@design-system/icons/chevron-left.svg`),
  [IconNamesEnum.ChevronRightDouble]: () =>
    import(`@design-system/icons/chevron-right-double.svg`),
  [IconNamesEnum.ChevronRight]: () =>
    import(`@design-system/icons/chevron-right.svg`),
  [IconNamesEnum.ChevronUp]: () =>
    import(`@design-system/icons/chevron-up.svg`),
  [IconNamesEnum.CircleQuestion]: () =>
    import(`@design-system/icons/circle-question.svg`),
  [IconNamesEnum.Circuit]: () => import(`@design-system/icons/circuit.svg`),
  [IconNamesEnum.City]: () => import(`@design-system/icons/city.svg`),
  [IconNamesEnum.ClipboardList]: () =>
    import(`@design-system/icons/clipboard-list.svg`),
  [IconNamesEnum.Cloche]: () => import(`@design-system/icons/cloche.svg`),
  [IconNamesEnum.Clock]: () => import(`@design-system/icons/clock.svg`),
  [IconNamesEnum.CloseSmall]: () =>
    import(`@design-system/icons/close-small.svg`),
  [IconNamesEnum.Close]: () => import(`@design-system/icons/close.svg`),
  [IconNamesEnum.CloudUpload]: () =>
    import(`@design-system/icons/cloud-upload.svg`),
  [IconNamesEnum.Coins]: () => import(`@design-system/icons/coins.svg`),
  [IconNamesEnum.Combine]: () => import(`@design-system/icons/combine.svg`),
  [IconNamesEnum.Crescent]: () => import(`@design-system/icons/crescent.svg`),
  [IconNamesEnum.Crosshair]: () => import(`@design-system/icons/crosshair.svg`),
  [IconNamesEnum.Cursoradded]: () =>
    import(`@design-system/icons/cursoradded.svg`),
  [IconNamesEnum.Cursoralt]: () => import(`@design-system/icons/cursoralt.svg`),
  [IconNamesEnum.Cursoraltnodeadd]: () =>
    import(`@design-system/icons/cursoraltnodeadd.svg`),
  [IconNamesEnum.Cursorhandalt]: () =>
    import(`@design-system/icons/cursorhandalt.svg`),
  [IconNamesEnum.Cursorpennode]: () =>
    import(`@design-system/icons/cursorpennode.svg`),
  [IconNamesEnum.CustomArrow]: () =>
    import(`@design-system/icons/custom-arrow.svg`),
  [IconNamesEnum.DashboardCustomize]: () =>
    import(`@design-system/icons/dashboard-customize.svg`),
  [IconNamesEnum.Delete]: () => import(`@design-system/icons/delete.svg`),
  [IconNamesEnum.DoorOpen]: () => import(`@design-system/icons/door-open.svg`),
  [IconNamesEnum.Dot]: () => import(`@design-system/icons/dot.svg`),
  [IconNamesEnum.Download]: () => import(`@design-system/icons/download.svg`),
  [IconNamesEnum.Elevator]: () => import(`@design-system/icons/elevator.svg`),
  [IconNamesEnum.EnterDoor]: () =>
    import(`@design-system/icons/enter-door.svg`),
  [IconNamesEnum.ExitDoor]: () => import(`@design-system/icons/exit-door.svg`),
  [IconNamesEnum.EyeSlash]: () => import(`@design-system/icons/eye-slash.svg`),
  [IconNamesEnum.Eye]: () => import(`@design-system/icons/eye.svg`),
  [IconNamesEnum.FileCopy]: () => import(`@design-system/icons/file-copy.svg`),
  [IconNamesEnum.FileList]: () => import(`@design-system/icons/file-list.svg`),
  [IconNamesEnum.Fix]: () => import(`@design-system/icons/fix.svg`),
  [IconNamesEnum.Flipbackward]: () =>
    import(`@design-system/icons/flipbackward.svg`),
  [IconNamesEnum.Flipforward]: () =>
    import(`@design-system/icons/flipforward.svg`),
  [IconNamesEnum.Gamingpad]: () => import(`@design-system/icons/gamingpad.svg`),
  [IconNamesEnum.Gear]: () => import(`@design-system/icons/gear.svg`),
  [IconNamesEnum.GoogleMapDisabled]: () =>
    import(`@design-system/icons/google-map-disabled.svg`),
  [IconNamesEnum.Handle]: () => import(`@design-system/icons/handle.svg`),
  [IconNamesEnum.HeadphonesOff]: () =>
    import(`@design-system/icons/headphones-off.svg`),
  [IconNamesEnum.Headphones]: () =>
    import(`@design-system/icons/headphones.svg`),
  [IconNamesEnum.HomeFilledFalse]: () =>
    import(`@design-system/icons/home-filled-false.svg`),
  [IconNamesEnum.HomeFilledTrue]: () =>
    import(`@design-system/icons/home-filled-true.svg`),
  [IconNamesEnum.IconBoltWired]: () =>
    import(`@design-system/icons/icon-bolt-wired.svg`),
  [IconNamesEnum.IconBoltWireless]: () =>
    import(`@design-system/icons/icon-bolt-wireless.svg`),
  [IconNamesEnum.IconParkSolidIpad]: () =>
    import(`@design-system/icons/icon-park-solid-ipad.svg`),
  [IconNamesEnum.Information]: () =>
    import(`@design-system/icons/information.svg`),
  [IconNamesEnum.Kakao]: () => import(`@design-system/icons/kakao.svg`),
  [IconNamesEnum.LabelFalseSizeSStateDisabledCheckSelected]: () =>
    import(
      `@design-system/icons/label-false-size-s-state-disabled-check-selected.svg`
    ),
  [IconNamesEnum.LabelFalseSizeSStateDisabledCheckUnselected]: () =>
    import(
      `@design-system/icons/label-false-size-s-state-disabled-check-unselected.svg`
    ),
  [IconNamesEnum.LabelFalseSizeSStateEnabledCheckSelected]: () =>
    import(
      `@design-system/icons/label-false-size-s-state-enabled-check-selected.svg`
    ),
  [IconNamesEnum.LabelFalseSizeSStateEnabledCheckUnselected]: () =>
    import(
      `@design-system/icons/label-false-size-s-state-enabled-check-unselected.svg`
    ),
  [IconNamesEnum.LabelFalseSizeSStateHoverCheckSelected]: () =>
    import(
      `@design-system/icons/label-false-size-s-state-hover-check-selected.svg`
    ),
  [IconNamesEnum.LabelFalseSizeSStateHoverCheckUnselected]: () =>
    import(
      `@design-system/icons/label-false-size-s-state-hover-check-unselected.svg`
    ),
  [IconNamesEnum.LabelFalseSizeSStatePressedCheckSelected]: () =>
    import(
      `@design-system/icons/label-false-size-s-state-pressed-check-selected.svg`
    ),
  [IconNamesEnum.LabelFalseSizeSStatePressedCheckUnselected]: () =>
    import(
      `@design-system/icons/label-false-size-s-state-pressed-check-unselected.svg`
    ),
  [IconNamesEnum.Layer]: () => import(`@design-system/icons/layer.svg`),
  [IconNamesEnum.LightBulb]: () =>
    import(`@design-system/icons/light-bulb.svg`),
  [IconNamesEnum.LightEmergencyError]: () =>
    import(`@design-system/icons/light-emergency-error.svg`),
  [IconNamesEnum.LightEmergency]: () =>
    import(`@design-system/icons/light-emergency.svg`),
  [IconNamesEnum.LinesLeaning]: () =>
    import(`@design-system/icons/lines-leaning.svg`),
  [IconNamesEnum.LocationArrowFilledFalse]: () =>
    import(`@design-system/icons/location-arrow-filled-false.svg`),
  [IconNamesEnum.LocationArrowFilledTrue]: () =>
    import(`@design-system/icons/location-arrow-filled-true.svg`),
  [IconNamesEnum.LocationArrowSlantOff]: () =>
    import(`@design-system/icons/location-arrow-slant-off.svg`),
  [IconNamesEnum.LocationArrowSlant]: () =>
    import(`@design-system/icons/location-arrow-slant.svg`),
  [IconNamesEnum.LocationCrosshairs]: () =>
    import(`@design-system/icons/location-crosshairs.svg`),
  [IconNamesEnum.LocationFilledFalse]: () =>
    import(`@design-system/icons/location-filled-false.svg`),
  [IconNamesEnum.LocationFilledTrue]: () =>
    import(`@design-system/icons/location-filled-true.svg`),
  [IconNamesEnum.LocationPinFair]: () =>
    import(`@design-system/icons/location-pin-fair.svg`),
  [IconNamesEnum.LocationPin]: () =>
    import(`@design-system/icons/location-pin.svg`),
  [IconNamesEnum.Loop]: () => import(`@design-system/icons/loop.svg`),
  [IconNamesEnum.MapLocationPin]: () =>
    import(`@design-system/icons/map-location-pin.svg`),
  [IconNamesEnum.MapPinSlash]: () =>
    import(`@design-system/icons/map-pin-slash.svg`),
  [IconNamesEnum.MapPin]: () => import(`@design-system/icons/map-pin.svg`),
  [IconNamesEnum.Maximize]: () => import(`@design-system/icons/maximize.svg`),
  [IconNamesEnum.MdiTag]: () => import(`@design-system/icons/mdi-tag.svg`),
  [IconNamesEnum.MicrophoneOff]: () =>
    import(`@design-system/icons/microphone-off.svg`),
  [IconNamesEnum.Microphone]: () =>
    import(`@design-system/icons/microphone.svg`),
  [IconNamesEnum.Minimize]: () => import(`@design-system/icons/minimize.svg`),
  [IconNamesEnum.Minus]: () => import(`@design-system/icons/minus.svg`),
  [IconNamesEnum.Monitor]: () => import(`@design-system/icons/monitor.svg`),
  [IconNamesEnum.Move]: () => import(`@design-system/icons/move.svg`),
  [IconNamesEnum.Music]: () => import(`@design-system/icons/music.svg`),
  [IconNamesEnum.NaverMapDisabled]: () =>
    import(`@design-system/icons/naver-map-disabled.svg`),
  [IconNamesEnum.NaverMap]: () => import(`@design-system/icons/naver-map.svg`),
  [IconNamesEnum.NeubilityLogo]: () =>
    import(`@design-system/icons/neubility-logo.svg`),
  [IconNamesEnum.NoEntry]: () => import(`@design-system/icons/no-entry.svg`),
  [IconNamesEnum.Nodeadd]: () => import(`@design-system/icons/nodeadd.svg`),
  [IconNamesEnum.OrderListFilledFalse]: () =>
    import(`@design-system/icons/order-list-filled-false.svg`),
  [IconNamesEnum.OrderListFilledTrue]: () =>
    import(`@design-system/icons/order-list-filled-true.svg`),
  [IconNamesEnum.PasswordRefresh]: () =>
    import(`@design-system/icons/password-refresh.svg`),
  [IconNamesEnum.Pause]: () => import(`@design-system/icons/pause.svg`),
  [IconNamesEnum.Pen]: () => import(`@design-system/icons/pen.svg`),
  [IconNamesEnum.Pensquare]: () => import(`@design-system/icons/pensquare.svg`),
  [IconNamesEnum.Phone]: () => import(`@design-system/icons/phone.svg`),
  [IconNamesEnum.Play]: () => import(`@design-system/icons/play.svg`),
  [IconNamesEnum.Plus]: () => import(`@design-system/icons/plus.svg`),
  [IconNamesEnum.PowerPlugOffOutline]: () =>
    import(`@design-system/icons/power-plug-off-outline.svg`),
  [IconNamesEnum.QrScan]: () => import(`@design-system/icons/qr-scan.svg`),
  [IconNamesEnum.RadioChecked]: () =>
    import(`@design-system/icons/radio-checked.svg`),
  [IconNamesEnum.RadioFalseHoverFalsePressedFalseDisabledFalse]: () =>
    import(
      `@design-system/icons/radio-false-hover-false-pressed-false-disabled-false.svg`
    ),
  [IconNamesEnum.RadioFalseHoverFalsePressedFalseDisabledTrue]: () =>
    import(
      `@design-system/icons/radio-false-hover-false-pressed-false-disabled-true.svg`
    ),
  [IconNamesEnum.RadioFalseHoverFalsePressedTrueDisabledFalse]: () =>
    import(
      `@design-system/icons/radio-false-hover-false-pressed-true-disabled-false.svg`
    ),
  [IconNamesEnum.RadioFalseHoverTruePressedFalseDisabledFalse]: () =>
    import(
      `@design-system/icons/radio-false-hover-true-pressed-false-disabled-false.svg`
    ),
  [IconNamesEnum.RadioTrueHoverFalsePressedFalseDisabledFalse]: () =>
    import(
      `@design-system/icons/radio-true-hover-false-pressed-false-disabled-false.svg`
    ),
  [IconNamesEnum.RadioTrueHoverFalsePressedFalseDisabledTrue]: () =>
    import(
      `@design-system/icons/radio-true-hover-false-pressed-false-disabled-true.svg`
    ),
  [IconNamesEnum.RadioTrueHoverFalsePressedTrueDisabledFalse]: () =>
    import(
      `@design-system/icons/radio-true-hover-false-pressed-true-disabled-false.svg`
    ),
  [IconNamesEnum.RadioTrueHoverTruePressedFalseDisabledFalse]: () =>
    import(
      `@design-system/icons/radio-true-hover-true-pressed-false-disabled-false.svg`
    ),
  [IconNamesEnum.RadioUnchecked]: () =>
    import(`@design-system/icons/radio-unchecked.svg`),
  [IconNamesEnum.RefreshAll]: () =>
    import(`@design-system/icons/refresh-all.svg`),
  [IconNamesEnum.RefreshPoi]: () =>
    import(`@design-system/icons/refresh-poi.svg`),
  [IconNamesEnum.Refresh]: () => import(`@design-system/icons/refresh.svg`),
  [IconNamesEnum.Restaurant]: () =>
    import(`@design-system/icons/restaurant.svg`),
  [IconNamesEnum.Rocket]: () => import(`@design-system/icons/rocket.svg`),
  [IconNamesEnum.RoomList]: () => import(`@design-system/icons/room-list.svg`),
  [IconNamesEnum.RoundCheckFalseHoverFalsePressedFalseDisabledFalse]: () =>
    import(
      `@design-system/icons/round-check-false-hover-false-pressed-false-disabled-false.svg`
    ),
  [IconNamesEnum.RoundCheckFalseHoverFalsePressedFalseDisabledTrue]: () =>
    import(
      `@design-system/icons/round-check-false-hover-false-pressed-false-disabled-true.svg`
    ),
  [IconNamesEnum.RoundCheckFalseHoverFalsePressedTrueDisabledFalse]: () =>
    import(
      `@design-system/icons/round-check-false-hover-false-pressed-true-disabled-false.svg`
    ),
  [IconNamesEnum.RoundCheckFalseHoverTruePressedFalseDisabledFalse]: () =>
    import(
      `@design-system/icons/round-check-false-hover-true-pressed-false-disabled-false.svg`
    ),
  [IconNamesEnum.RoundCheckTrueHoverFalsePressedFalseDisabledFalse]: () =>
    import(
      `@design-system/icons/round-check-true-hover-false-pressed-false-disabled-false.svg`
    ),
  [IconNamesEnum.RoundCheckTrueHoverFalsePressedFalseDisabledTrue]: () =>
    import(
      `@design-system/icons/round-check-true-hover-false-pressed-false-disabled-true.svg`
    ),
  [IconNamesEnum.RoundCheckTrueHoverFalsePressedTrueDisabledFalse]: () =>
    import(
      `@design-system/icons/round-check-true-hover-false-pressed-true-disabled-false.svg`
    ),
  [IconNamesEnum.RoundCheckTrueHoverTruePressedFalseDisabledFalse]: () =>
    import(
      `@design-system/icons/round-check-true-hover-true-pressed-false-disabled-false.svg`
    ),
  [IconNamesEnum.Route]: () => import(`@design-system/icons/route.svg`),
  [IconNamesEnum.Scissors]: () => import(`@design-system/icons/scissors.svg`),
  [IconNamesEnum.ScreenUser]: () =>
    import(`@design-system/icons/screen-user.svg`),
  [IconNamesEnum.Search]: () => import(`@design-system/icons/search.svg`),
  [IconNamesEnum.SendEmail]: () =>
    import(`@design-system/icons/send-email.svg`),
  [IconNamesEnum.SignalFair]: () =>
    import(`@design-system/icons/signal-fair.svg`),
  [IconNamesEnum.SignalGood]: () =>
    import(`@design-system/icons/signal-good.svg`),
  [IconNamesEnum.SignalPoor]: () =>
    import(`@design-system/icons/signal-poor.svg`),
  [IconNamesEnum.SignalWeak]: () =>
    import(`@design-system/icons/signal-weak.svg`),
  [IconNamesEnum.SmileFilledFalse]: () =>
    import(`@design-system/icons/smile-filled-false.svg`),
  [IconNamesEnum.SmileFilledTrue]: () =>
    import(`@design-system/icons/smile-filled-true.svg`),
  [IconNamesEnum.SoundWave]: () =>
    import(`@design-system/icons/sound-wave.svg`),
  [IconNamesEnum.Spinner]: () => import(`@design-system/icons/spinner.svg`),
  [IconNamesEnum.Stop]: () => import(`@design-system/icons/stop.svg`),
  [IconNamesEnum.Sun]: () => import(`@design-system/icons/sun.svg`),
  [IconNamesEnum.SwitchOff]: () =>
    import(`@design-system/icons/switch-off.svg`),
  [IconNamesEnum.SwitchOn]: () => import(`@design-system/icons/switch-on.svg`),
  [IconNamesEnum.SwitchVertical]: () =>
    import(`@design-system/icons/switch-vertical.svg`),
  [IconNamesEnum.Tag]: () => import(`@design-system/icons/tag.svg`),
  [IconNamesEnum.Timeout]: () => import(`@design-system/icons/timeout.svg`),
  [IconNamesEnum.TowerBroadcastSlash]: () =>
    import(`@design-system/icons/tower-broadcast-slash.svg`),
  [IconNamesEnum.Trash]: () => import(`@design-system/icons/trash.svg`),
  [IconNamesEnum.TriangleExclamation]: () =>
    import(`@design-system/icons/triangle-exclamation.svg`),
  [IconNamesEnum.UnionThreeBar]: () =>
    import(`@design-system/icons/union-three-bar.svg`),
  [IconNamesEnum.Union]: () => import(`@design-system/icons/union.svg`),
  [IconNamesEnum.Upload]: () => import(`@design-system/icons/upload.svg`),
  [IconNamesEnum.UserAlt]: () => import(`@design-system/icons/user-alt.svg`),
  [IconNamesEnum.VideoSlash]: () =>
    import(`@design-system/icons/video-slash.svg`),
  [IconNamesEnum.VolumeMax]: () =>
    import(`@design-system/icons/volume-max.svg`),
  [IconNamesEnum.Wave]: () => import(`@design-system/icons/wave.svg`),
  [IconNamesEnum.WayError]: () => import(`@design-system/icons/way-error.svg`),
  [IconNamesEnum.WifiSmall]: () =>
    import(`@design-system/icons/wifi-small.svg`),
  [IconNamesEnum.Wifi]: () => import(`@design-system/icons/wifi.svg`),
  [IconNamesEnum.WirelessCharger]: () =>
    import(`@design-system/icons/wireless-charger.svg`),
  [IconNamesEnum.ImgAccidentZoneEn]: () =>
    import(`@design-system/icons/imageIcons/img-accident-zone-en.svg`),
  [IconNamesEnum.ImgAccidentZoneKr]: () =>
    import(`@design-system/icons/imageIcons/img-accident-zone-kr.svg`),
  [IconNamesEnum.ImgCompass]: () =>
    import(`@design-system/icons/imageIcons/img-compass.svg`),
  [IconNamesEnum.ImgCurrentLocation]: () =>
    import(`@design-system/icons/imageIcons/img-current-location.svg`),
  [IconNamesEnum.ImgDangerSign]: () =>
    import(`@design-system/icons/imageIcons/img-danger-sign.svg`),
  [IconNamesEnum.ImgEditRobotLocation]: () =>
    import(`@design-system/icons/imageIcons/img-edit-robot-location.svg`),
  [IconNamesEnum.ImgFindNeubie]: () =>
    import(`@design-system/icons/imageIcons/img-find-neubie.svg`),
  [IconNamesEnum.ImgGoogleMap]: () =>
    import(`@design-system/icons/imageIcons/img-google-map.svg`),
  [IconNamesEnum.ImgMarkerArrow]: () =>
    import(`@design-system/icons/imageIcons/img-marker-arrow.svg`),
  [IconNamesEnum.ImgMarkerRobot]: () =>
    import(`@design-system/icons/imageIcons/img-marker-robot.svg`),
  [IconNamesEnum.ImgMarkerSimplify]: () =>
    import(`@design-system/icons/imageIcons/img-marker-simplify.svg`),
  [IconNamesEnum.ImgMarkerStation]: () =>
    import(`@design-system/icons/imageIcons/img-marker-station.svg`),
  [IconNamesEnum.ImgMarkerWait]: () =>
    import(`@design-system/icons/imageIcons/img-marker-wait.svg`),
  [IconNamesEnum.ImgPitchBackgroundCircle]: () =>
    import(`@design-system/icons/imageIcons/img-pitch-background-circle.svg`),
  [IconNamesEnum.ImgPitchDanger]: () =>
    import(`@design-system/icons/imageIcons/img-pitch-danger.svg`),
  [IconNamesEnum.ImgPitchNormal]: () =>
    import(`@design-system/icons/imageIcons/img-pitch-normal.svg`),
  [IconNamesEnum.ImgPitchWarning]: () =>
    import(`@design-system/icons/imageIcons/img-pitch-warning.svg`),
  [IconNamesEnum.ImgRollDanger]: () =>
    import(`@design-system/icons/imageIcons/img-roll-danger.svg`),
  [IconNamesEnum.ImgRollNormal]: () =>
    import(`@design-system/icons/imageIcons/img-roll-normal.svg`),
  [IconNamesEnum.ImgRollWarning]: () =>
    import(`@design-system/icons/imageIcons/img-roll-warning.svg`),
  [IconNamesEnum.ImgRoom]: () =>
    import(`@design-system/icons/imageIcons/img-room.svg`),
  [IconNamesEnum.ImgTrafficlightGreen]: () =>
    import(`@design-system/icons/imageIcons/img-trafficlight-green.svg`),
  [IconNamesEnum.ImgTrafficlightRed]: () =>
    import(`@design-system/icons/imageIcons/img-trafficlight-red.svg`),
};
