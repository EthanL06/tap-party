export async function usePreloadAssets() {
  const fileNames = [
    "banner_loser.png",
    "banner_tied.png",
    "banner.png",
    "stickman-happy.svg",
    "stickman-sad.svg",
    "stickman.svg",
    "tap.svg",
  ];

  const loadImages = fileNames.map((fileName) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = `../assets/${fileName}`;
      img.onload = resolve;
      img.onerror = reject;
    });
  });

  await Promise.all(loadImages);
}
