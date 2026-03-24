import { Show } from "solid-js";

import { useLingui } from "@lingui-solid/solid/macro";
import { styled } from "styled-system/jsx";

import { CONFIGURATION } from "@revolt/common";
import { useVoice } from "@revolt/rtc";
import { useState } from "@revolt/state";
import { Button, IconButton, Slider, Text } from "@revolt/ui/components/design";
import { Symbol } from "@revolt/ui/components/utils/Symbol";
import { ContextMenu, ContextMenuItem } from "@revolt/app/menus/ContextMenu";

export function VoiceCallCardActions(props: { size: "xs" | "sm" }) {
  const voice = useVoice();
  const { t } = useLingui();

  function isVideoEnabled() {
    return CONFIGURATION.ENABLE_VIDEO;
  }

  return (
    <Actions>
      <Show when={props.size === "xs"}>
        <a href={voice.channel()?.path}>
          <IconButton variant="standard" size={props.size}>
            <Symbol>arrow_top_left</Symbol>
          </IconButton>
        </a>
      </Show>
      <IconButton
        size={props.size}
        variant={voice.microphone() ? "filled" : "tonal"}
        onPress={() => voice.toggleMute()}
        use:floating={{
          tooltip: voice.speakingPermission
            ? undefined
            : {
                placement: "top",
                content: t`Missing permission`,
              },
        }}
        isDisabled={!voice.speakingPermission}
      >
        <Show when={voice.microphone()} fallback={<Symbol>mic_off</Symbol>}>
          <Symbol>mic</Symbol>
        </Show>
      </IconButton>
      <IconButton
        size={props.size}
        variant={voice.deafen() || !voice.listenPermission ? "tonal" : "filled"}
        onPress={() => voice.toggleDeafen()}
        use:floating={{
          tooltip: voice.listenPermission
            ? undefined
            : {
                placement: "top",
                content: t`Missing permission`,
              },
        }}
        isDisabled={!voice.listenPermission}
      >
        <Show
          when={voice.deafen() || !voice.listenPermission}
          fallback={<Symbol>headset</Symbol>}
        >
          <Symbol>headset_off</Symbol>
        </Show>
      </IconButton>
      <IconButton
        size={props.size}
        variant={isVideoEnabled() && voice.video() ? "filled" : "tonal"}
        onPress={() => {
          if (isVideoEnabled()) voice.toggleCamera();
        }}
        use:floating={{
          tooltip: {
            placement: "top",
            content: isVideoEnabled()
              ? voice.video()
                ? "Stop Camera"
                : "Start Camera"
              : "Coming soon! 👀",
          },
        }}
        isDisabled={!isVideoEnabled()}
      >
        <Symbol>camera_video</Symbol>
      </IconButton>
      <IconButton
        size={props.size}
        variant={isVideoEnabled() && voice.screenshare() ? "filled" : "tonal"}
        onPress={() => {
          if (isVideoEnabled()) voice.toggleScreenshare();
        }}
        use:floating={{
          tooltip: {
            placement: "top",
            content: isVideoEnabled()
              ? voice.screenshare()
                ? "Stop Sharing"
                : "Share Screen"
              : "Coming soon! 👀",
          },
        }}
        isDisabled={!isVideoEnabled()}
      >
        <Show
          when={!isVideoEnabled() || voice.screenshare()}
          fallback={<Symbol>stop_screen_share</Symbol>}
        >
          <Symbol>screen_share</Symbol>
        </Show>
      </IconButton>
      <Show when={isVideoEnabled()}>
        <IconButton
          size={props.size}
          variant="tonal"
          use:floating={{
            contextMenu: () => <ScreenShareSettingsMenu />,
            contextMenuHandler: "click",
          }}
        >
          <Symbol>more_vert</Symbol>
        </IconButton>
      </Show>
      <Button
        size={props.size}
        variant="_error"
        onPress={() => voice.disconnect()}
      >
        <Symbol>call_end</Symbol>
      </Button>
    </Actions>
  );
}

const RESOLUTION_PRESETS = [
  { label: "720p", width: 1280, height: 720 },
  { label: "1080p", width: 1920, height: 1080 },
  { label: "1440p", width: 2560, height: 1440 },
  { label: "4K", width: 3840, height: 2160 },
] as const;

const SettingsMenuHeader = styled("div", {
  base: {
    padding: "var(--gap-sm) var(--gap-lg)",
    fontWeight: 600,
    fontSize: "0.85rem",
    color: "var(--md-sys-color-on-surface-variant)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
});

const SettingsSection = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    padding: "var(--gap-sm) 0",
  },
});

const SettingsLabel = styled("div", {
  base: {
    padding: "0 var(--gap-lg)",
    fontSize: "0.8rem",
    color: "var(--md-sys-color-on-surface-variant)",
    marginBottom: "var(--gap-xs)",
  },
});

const SliderWrapper = styled("div", {
  base: {
    padding: "0 var(--gap-lg)",
    minWidth: "200px",
  },
});

function ScreenShareSettingsMenu() {
  const state = useState();

  return (
    <ContextMenu
      onMouseDown={(e: MouseEvent) => e.stopImmediatePropagation()}
      onClick={(e: MouseEvent) => e.stopImmediatePropagation()}
    >
      <SettingsMenuHeader>Screen Share Settings</SettingsMenuHeader>
      <SettingsSection>
        <SettingsLabel>Resolution</SettingsLabel>
        {RESOLUTION_PRESETS.map((preset) => (
          <ContextMenuItem
            button
            action
            selected={
              state.voice.screenShareWidth === preset.width &&
              state.voice.screenShareHeight === preset.height
            }
            onClick={() => {
              state.voice.screenShareWidth = preset.width;
              state.voice.screenShareHeight = preset.height;
            }}
          >
            <Text>
              {preset.label} ({preset.width}x{preset.height})
            </Text>
          </ContextMenuItem>
        ))}
      </SettingsSection>
      <SettingsSection>
        <SettingsLabel>
          Framerate: {state.voice.screenShareFramerate} fps
        </SettingsLabel>
        <SliderWrapper>
          <Slider
            min={5}
            max={30}
            step={5}
            value={state.voice.screenShareFramerate}
            onInput={(event) =>
              (state.voice.screenShareFramerate = event.currentTarget.value)
            }
            labelFormatter={(value) => `${value} fps`}
          />
        </SliderWrapper>
      </SettingsSection>
      <SettingsSection>
        <SettingsLabel>
          Bitrate: {(state.voice.screenShareBitrate / 1_000_000).toFixed(1)} Mbps
        </SettingsLabel>
        <SliderWrapper>
          <Slider
            min={500_000}
            max={10_000_000}
            step={500_000}
            value={state.voice.screenShareBitrate}
            onInput={(event) =>
              (state.voice.screenShareBitrate = event.currentTarget.value)
            }
            labelFormatter={(value) => `${(value / 1_000_000).toFixed(1)} Mbps`}
          />
        </SliderWrapper>
      </SettingsSection>
    </ContextMenu>
  );
}

const Actions = styled("div", {
  base: {
    flexShrink: 0,
    gap: "var(--gap-md)",
    padding: "var(--gap-md)",

    display: "flex",
    width: "fit-content",
    justifyContent: "center",
    alignSelf: "center",

    borderRadius: "var(--borderRadius-full)",
    background: "var(--md-sys-color-surface-container)",
  },
});
