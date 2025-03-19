import { test } from '@playwright/test';


test('bigboytest', async ({ page }) => {
  await page.goto('http://127.0.0.1:8080/tests/index1.html');
  await page.waitForEvent("frameattached");

  const allFrames = page.frames();
  const frameByURL = page.frame({url:"https://hackertyper.net/"});
  const frameByLocator = page.frameLocator("МеняБросилаЖена");
});
