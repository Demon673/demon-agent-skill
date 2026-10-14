#!/bin/sh
EVENT="Stop"
REASON=""
SUMMARY=""
MODE="both"
INTENSITY="normal"
OUTPUT="none"
DRY_RUN=0

while [ "$#" -gt 0 ]; do
  case "$1" in
    --dry-run) DRY_RUN=1; shift; continue ;;
    --event|--reason|--summary|--mode|--intensity|--output) [ "$#" -ge 2 ] || exit 2 ;;
    *) exit 2 ;;
  esac
  case "$1" in
    --event) EVENT="$2" ;;
    --reason) REASON="$2" ;;
    --summary) SUMMARY="$2" ;;
    --mode) MODE="$2" ;;
    --intensity) INTENSITY="$2" ;;
    --output) OUTPUT="$2" ;;
  esac
  shift 2
done

if [ -z "$REASON" ]; then
  case "$EVENT" in
    Elicitation|Notification) REASON="needs-input" ;;
    PermissionRequest) REASON="approval" ;;
    StopFailure) REASON="failed" ;;
    *) REASON="done" ;;
  esac
fi
case "$REASON" in done|needs-input|approval|blocked|failed|cancelled) ;; *) exit 2 ;; esac
case "$MODE" in auto|toast|sound|both|none) ;; *) exit 2 ;; esac
case "$INTENSITY" in quiet|normal|loud) ;; *) exit 2 ;; esac
case "$OUTPUT" in none|gemini) ;; *) exit 2 ;; esac

[ -n "$SUMMARY" ] || SUMMARY="Agent event: $EVENT"
TITLE="Agent stopped"
MESSAGE="$REASON - $SUMMARY"
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd) || exit 2
SOUND="$SCRIPT_DIR/../assets/$REASON.wav"
[ "$REASON" != "cancelled" ] || SOUND=""

if [ "$DRY_RUN" = 1 ]; then
  printf 'reason=%s\nsound=%s\nmode=%s\n' "$REASON" "$SOUND" "$MODE"
  exit 0
fi

play_sound() {
  case "$(uname -s 2>/dev/null)" in
    Darwin*) afplay "$SOUND" >/dev/null 2>&1 ;;
    *)
      if command -v paplay >/dev/null 2>&1 && paplay "$SOUND" >/dev/null 2>&1; then return 0; fi
      command -v aplay >/dev/null 2>&1 && aplay "$SOUND" >/dev/null 2>&1
      ;;
  esac
}

ring() {
  case "$MODE" in
    toast|both|auto)
      case "$(uname -s 2>/dev/null)" in
        Darwin*)
          osascript - "$TITLE" "$MESSAGE" <<'APPLESCRIPT'
on run argv
  display notification (item 2 of argv) with title (item 1 of argv)
end run
APPLESCRIPT
          ;;
        *) command -v notify-send >/dev/null 2>&1 && notify-send "$TITLE" "$MESSAGE" ;;
      esac
      ;;
  esac
  case "$MODE" in
    sound|both|auto)
      if play_sound; then
        [ "$INTENSITY" != "loud" ] || play_sound
      else
        case "$(uname -s 2>/dev/null)" in
          Darwin*) osascript -e 'beep 1' || printf '\a' > /dev/tty ;;
          *) printf '\a' > /dev/tty ;;
        esac
      fi
      ;;
  esac
}

if [ "$MODE" != "none" ] && [ "$REASON" != "cancelled" ]; then
  (ring) >/dev/null 2>&1 &
fi
if [ "$OUTPUT" = "gemini" ]; then printf '%s\n' '{"suppressOutput":true}'; fi
exit 0
