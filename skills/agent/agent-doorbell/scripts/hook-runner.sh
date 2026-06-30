#!/bin/sh
EVENT="Stop"
REASON=""
SUMMARY=""
MODE="both"
INTENSITY="normal"
OUTPUT="none"

while [ "$#" -gt 0 ]; do
  case "$1" in
    --event) EVENT="${2:-$EVENT}"; shift 2 ;;
    --reason) REASON="${2:-$REASON}"; shift 2 ;;
    --summary) SUMMARY="${2:-$SUMMARY}"; shift 2 ;;
    --mode) MODE="${2:-$MODE}"; shift 2 ;;
    --intensity) INTENSITY="${2:-$INTENSITY}"; shift 2 ;;
    --output) OUTPUT="${2:-$OUTPUT}"; shift 2 ;;
    *) shift ;;
  esac
done

reason_for_event() {
  case "$1" in
    AfterAgent) printf '%s' "done" ;;
    Elicitation|Notification|PermissionRequest) printf '%s' "needs-input" ;;
    StopFailure) printf '%s' "blocked" ;;
    *) printf '%s' "done" ;;
  esac
}

summary_for_event() {
  case "$1" in
    AfterAgent) printf '%s' "Agent finished responding" ;;
    Elicitation) printf '%s' "Agent is waiting for user input" ;;
    Notification) printf '%s' "Agent notification needs attention" ;;
    PermissionRequest) printf '%s' "Agent is waiting for permission" ;;
    StopFailure) printf '%s' "Agent stopped because of an error" ;;
    *) printf '%s' "Agent stopped and handed control back" ;;
  esac
}

[ -n "$REASON" ] || REASON="$(reason_for_event "$EVENT")"
[ -n "$SUMMARY" ] || SUMMARY="$(summary_for_event "$EVENT")"
TITLE="Agent stopped"
MESSAGE="$REASON - $SUMMARY"

ring_macos() {
  if [ "$MODE" = "toast" ] || [ "$MODE" = "both" ] || [ "$MODE" = "auto" ]; then
    osascript -e "display notification \"$MESSAGE\" with title \"$TITLE\"" >/dev/null 2>&1 || true
  fi
  if [ "$MODE" = "sound" ] || [ "$MODE" = "both" ] || [ "$MODE" = "auto" ]; then
    if [ "$INTENSITY" = "loud" ]; then
      osascript -e "beep 2" >/dev/null 2>&1 || printf '\a'
    else
      osascript -e "beep 1" >/dev/null 2>&1 || printf '\a'
    fi
  fi
}

ring_linux() {
  if [ "$MODE" = "toast" ] || [ "$MODE" = "both" ] || [ "$MODE" = "auto" ]; then
    command -v notify-send >/dev/null 2>&1 && notify-send "$TITLE" "$MESSAGE" >/dev/null 2>&1 || true
  fi
  if [ "$MODE" = "sound" ] || [ "$MODE" = "both" ] || [ "$MODE" = "auto" ]; then
    printf '\a'
  fi
}

if [ "$MODE" != "none" ]; then
  (
    case "$(uname -s 2>/dev/null)" in
      Darwin*) ring_macos ;;
      *) ring_linux ;;
    esac
  ) >/dev/null 2>&1 &
fi

if [ "$OUTPUT" = "gemini" ]; then
  printf '%s\n' '{"suppressOutput":true}'
fi

exit 0
