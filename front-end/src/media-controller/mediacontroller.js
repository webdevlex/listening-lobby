export default function setMediaController(applePlayer) {
  if ("mediaSession" in navigator) {
    console.log(navigator.mediaSession);
    navigator.mediaSession.setActionHandler("play", () => {});
    navigator.mediaSession.setActionHandler("nexttrack", () => {});
    navigator.mediaSession.setActionHandler("pause", () => {});
    navigator.mediaSession.setActionHandler("stop", () => {
      if (applePlayer) {
        applePlayer.bitrate = 0;
      }
    });

    navigator.mediaSession.setActionHandler("seekforward", () => {});
    navigator.mediaSession.setActionHandler("seekbackward", () => {});
    navigator.mediaSession.setActionHandler("previoustrack", () => {});
    navigator.mediaSession.setActionHandler("seekto", () => {});
    navigator.mediaSession.setActionHandler("previoustrack", () => {});

    navigator.mediaSession.setActionHandler("togglemicrophone", () => {});
    navigator.mediaSession.setActionHandler("togglecamera", () => {});
    navigator.mediaSession.setActionHandler("togglecamera", () => {});
  }
}
