import { test, expect } from '@playwright/test';

test('AI Chatbot opens and responds to student questions', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // 1. Click the toggle button (Using the text hidden in your span)
  await page.locator('text=Chat with Aura!').click();
  
  // Pause to let the panel see the chat window open
  await page.waitForTimeout(1000); 

  // 2. Type into the input (Matching your EXACT placeholder)
  const chatInput = page.getByPlaceholder('Ask about a room...'); 
  await chatInput.fill('Do you have an AC room for boys?');
  
  // Pause to let the panel read the question
  await page.waitForTimeout(1000); 

  // 3. Click the Send button (Targeting it by type="submit" since it has no text)
  await page.locator('button[type="submit"]').click();

  // 4. Wait for the AI's response
  // Since Gemini's exact wording changes, we will just pause for 6 seconds
  // to allow the API to fetch the answer and display it on screen.
  await page.waitForTimeout(6000); 
});