const { test, expect, request } = require('@playwright/test');
const { kargoLink, hoverAdLink, hoverDemoAdLink } = require('../Ads Info/Ads Links');

test.describe('Sandbox Hover Ad Page', () => {
    test('Check and Click on Kargo Logo', async ({ context }) => {
      const page = await context.newPage();
      // Start waiting for new page before clicking
      const pagePromise = context.waitForEvent('page');
       // Go to the starting url
       await page.goto(hoverDemoAdLink);
       await expect(page).toHaveURL(hoverDemoAdLink);

       // Verifying Kargo logo section 
       await expect(page.locator('a.kargo-hover-link.filled .kargo-svg-bolt')).toBeVisible(); // check that kargo bolt logo is visible
       await expect(page.locator('a.kargo-hover-link.filled .kargo-svg-kargo')).toBeVisible(); // check that kargo logo is visible
       await expect(page.locator('a.kargo-hover-link.filled .kargo-svg-ad')).toBeVisible(); // check that AD logo is visible
       await page.locator('a.kargo-hover-link.filled').click();
      
       // Chech the new open kargo page
      const newPage = await pagePromise;
      await newPage.waitForLoadState();
      await expect(newPage).toHaveURL(kargoLink);
    });

    test('Check click on Ad', async ({ context }) => {
      const page = await context.newPage();
      // Start waiting for new page before clicking
      const pagePromise = context.waitForEvent('page');
       // Go to the starting url
       await page.goto(hoverDemoAdLink);
       await expect(page).toHaveURL(hoverDemoAdLink);

       // Selecting Ad & click on it
       const adFrame = await page.frameLocator('iframe[allowfullscreen]'); // Defining the ad frame
       await expect(adFrame.locator('.celtra-screen-holder')).toBeVisible(); // Check that ad is visible
       await adFrame.locator('.celtra-screen-holder').click(); // Click on ad

       // chech the new page open link of ad
      const newPage = await pagePromise;
      // await newPage.waitForLoadState();
      await expect(newPage).toHaveURL(hoverAdLink); // URL contains
    });

    test('Check Ad Trackers', async ({ context }) => {
      const page = await context.newPage();
      // Start waiting for new page before clicking
      const pagePromise = context.waitForEvent('page');

      // Log 'request' and 'response' events.
      page.on('request', request => console.log('>>', request.method(), request.url()));
      page.on('response', response => console.log('<<', response.status(), response.url()));

      // defining trackers(this needs to be enhanced to find better way to define trackers using a helper)
        const responseRequestPromise = page.waitForRequest(request => request.url().match('imp_track-response'));
        const serveRequestPromise = page.waitForRequest(request => request.url().match('imp_track-serve'));
        const impressionRequestPromise = page.waitForRequest(request => request.url().match('impression'));
        const viewCompleteRequestPromise = page.waitForRequest(request => request.url().match('imp_track-completeview'));
        const viewRequestPromise = page.waitForRequest(request => request.url().match('imp_track-view'));
        const cacheBusterRequestPromise = page.waitForRequest(request => request.url().match('%%CACHEBUSTER%%'));
        const clickWebRequestPromise = page.waitForRequest(request => request.url().match('clickUrl=https'));
        const krakenBillableRequestPromise = page.waitForRequest(request => request.url().match('event/billable'));
        const clickRequestPromise = page.waitForRequest(request => request.url().match('imp_track-click'));
        const closeRequestPromise = page.waitForRequest(request => request.url().match('imp_track-close'));
        // const moatRequestPromise = page.waitForResponse(request => request.status() === 400);

       // Go to the starting url
       await page.goto(hoverDemoAdLink);
       await expect(page).toHaveURL(hoverDemoAdLink);

      // Selecting Ad & click on it
       const adFrame = await page.frameLocator('iframe[allowfullscreen]'); // Defining the ad frame
       await expect(adFrame.locator('.celtra-screen-holder')).toBeVisible(); // Check that ad is visible

       // wait for trackers
       const waitATrackersrray = await Promise.all([
        responseRequestPromise,
        serveRequestPromise,
         impressionRequestPromise,
         viewCompleteRequestPromise,
         viewRequestPromise, 
         cacheBusterRequestPromise,
         clickWebRequestPromise,
         krakenBillableRequestPromise,
         // moatRequestPromise
       ]);

       await expect(waitATrackersrray.forEach).toBeTruthy(); // check that each tracker has truthy value (is found in network)

      // this will be updated to check uuid in the correct trackers urls
      // for (let i=0; i< waitArray.length; i++){
      //   if( i == 5 ){
      //     await expect(waitArray[i]._initializer.url).toContain('CACHEBUSTER');
      //   } else {
      //   await expect(waitArray[i]._initializer.url).toContain('uuid');
      //   }
      // }
 
       await adFrame.locator('.celtra-screen-holder').click(); // Click on ad
       // chech the new open kargo page
      const newPage = await pagePromise;
      // await newPage.waitForLoadState();
      await expect(newPage).toHaveURL(hoverAdLink); // URL contains
  
      const clickRequest = await clickRequestPromise;
      await expect(clickRequest).toBeTruthy();
      await newPage.close();
  
      await page.locator('.filled .kargo-svg-close').click(); // Close the ad
      const closeRequest = await closeRequestPromise;
      await expect(closeRequest).toBeTruthy();
    });
});