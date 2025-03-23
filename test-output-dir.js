// Test script for testing output directory functionality
import { rulesGenerate } from './lib/rulesGenerate.js';

// Set a dummy API key for testing
process.env.ANTHROPIC_API_KEY = 'dummy-key';

// Run the test
async function runTest() {
  try {
    console.log('Testing output directory functionality...');
    
    // Test with a local path and custom output directory
    await rulesGenerate('.', {
      provider: 'claude-sonnet-3.5-latest', 
      outputDir: './test-output',
      guidelinesPath: './cursorrules-guidelines.md'
    });
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

runTest(); 