#!/usr/bin/env node

/**
 * LinkedIn API Test Script
 * Tests the LinkedIn API integration with the configured tokens
 */

const axios = require('axios');
require('dotenv').config({ path: '../.env' });

// LinkedIn API Configuration
const LINKEDIN_CONFIG = {
  company: {
    clientId: process.env.LINKEDIN_COMPANY_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_COMPANY_CLIENT_SECRET,
    accessToken: process.env.LINKEDIN_COMPANY_ACCESS_TOKEN,
    refreshToken: process.env.LINKEDIN_COMPANY_REFRESH_TOKEN
  },
  personal: {
    clientId: process.env.LINKEDIN_PERSONAL_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_PERSONAL_CLIENT_SECRET,
    accessToken: process.env.LINKEDIN_PERSONAL_ACCESS_TOKEN,
    refreshToken: process.env.LINKEDIN_PERSONAL_REFRESH_TOKEN
  }
};

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

/**
 * Refresh LinkedIn Access Token
 */
async function refreshAccessToken(accountType = 'company') {
  const config = LINKEDIN_CONFIG[accountType];
  
  if (!config.refreshToken) {
    console.log(`${colors.yellow}No refresh token available for ${accountType} account${colors.reset}`);
    return null;
  }

  try {
    console.log(`${colors.blue}Refreshing ${accountType} access token...${colors.reset}`);
    
    const response = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', null, {
      params: {
        grant_type: 'refresh_token',
        refresh_token: config.refreshToken,
        client_id: config.clientId,
        client_secret: config.clientSecret
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    console.log(`${colors.green}✅ Access token refreshed successfully!${colors.reset}`);
    console.log(`New access token: ${response.data.access_token.substring(0, 20)}...`);
    console.log(`Expires in: ${response.data.expires_in} seconds`);
    
    return response.data.access_token;
  } catch (error) {
    console.error(`${colors.red}❌ Failed to refresh access token:${colors.reset}`);
    console.error(error.response?.data || error.message);
    return null;
  }
}

/**
 * Test LinkedIn API - Get Profile
 */
async function testGetProfile(accessToken) {
  try {
    console.log(`${colors.blue}Testing LinkedIn API - Get Profile...${colors.reset}`);
    
    const response = await axios.get('https://api.linkedin.com/v2/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });

    console.log(`${colors.green}✅ Profile retrieved successfully!${colors.reset}`);
    console.log('Profile data:', JSON.stringify(response.data, null, 2));
    
    return true;
  } catch (error) {
    console.error(`${colors.red}❌ Failed to get profile:${colors.reset}`);
    console.error(error.response?.data || error.message);
    return false;
  }
}

/**
 * Test LinkedIn API - Get Company Info
 */
async function testGetCompanyInfo(accessToken) {
  try {
    console.log(`${colors.blue}Testing LinkedIn API - Get Company Organizations...${colors.reset}`);
    
    const response = await axios.get('https://api.linkedin.com/v2/organizationalEntityAcls', {
      params: {
        q: 'roleAssignee',
        projection: '(elements*(organizationalTarget))'
      },
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });

    console.log(`${colors.green}✅ Company organizations retrieved successfully!${colors.reset}`);
    console.log('Organizations:', JSON.stringify(response.data, null, 2));
    
    return true;
  } catch (error) {
    console.error(`${colors.red}❌ Failed to get company info:${colors.reset}`);
    console.error(error.response?.data || error.message);
    return false;
  }
}

/**
 * Create a test post on LinkedIn
 */
async function testCreatePost(accessToken, authorUrn, text) {
  try {
    console.log(`${colors.blue}Testing LinkedIn API - Create Post...${colors.reset}`);
    
    const postData = {
      author: authorUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: text
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };

    const response = await axios.post('https://api.linkedin.com/v2/ugcPosts', postData, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });

    console.log(`${colors.green}✅ Post created successfully!${colors.reset}`);
    console.log('Post ID:', response.data.id);
    
    return true;
  } catch (error) {
    console.error(`${colors.red}❌ Failed to create post:${colors.reset}`);
    console.error(error.response?.data || error.message);
    return false;
  }
}

/**
 * Main test function
 */
async function runTests() {
  console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.blue}LinkedIn API Integration Test${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}\n`);

  // Test Company Account
  console.log(`${colors.yellow}Testing Company Account...${colors.reset}`);
  console.log('-'.repeat(40));
  
  let companyAccessToken = LINKEDIN_CONFIG.company.accessToken;
  
  // Try to refresh token if refresh token is available
  if (LINKEDIN_CONFIG.company.refreshToken) {
    const newToken = await refreshAccessToken('company');
    if (newToken) {
      companyAccessToken = newToken;
      console.log(`${colors.green}Please update your .env file with the new access token${colors.reset}\n`);
    }
  }
  
  // Test with current or new access token
  if (companyAccessToken) {
    await testGetProfile(companyAccessToken);
    await testGetCompanyInfo(companyAccessToken);
    
    // Uncomment to test posting (be careful, this will create a real post!)
    // await testCreatePost(
    //   companyAccessToken,
    //   'urn:li:organization:YOUR_COMPANY_ID',
    //   '🚀 Test post from AI Finance Agency API integration!'
    // );
  } else {
    console.log(`${colors.red}No access token available for company account${colors.reset}`);
  }

  console.log(`\n${colors.yellow}Testing Personal Account...${colors.reset}`);
  console.log('-'.repeat(40));
  
  let personalAccessToken = LINKEDIN_CONFIG.personal.accessToken;
  
  // Test Personal Account (if configured)
  if (LINKEDIN_CONFIG.personal.clientId) {
    if (LINKEDIN_CONFIG.personal.refreshToken) {
      const newToken = await refreshAccessToken('personal');
      if (newToken) {
        personalAccessToken = newToken;
        console.log(`${colors.green}Please update your .env file with the new access token${colors.reset}\n`);
      }
    }
    
    if (personalAccessToken) {
      await testGetProfile(personalAccessToken);
    } else {
      console.log(`${colors.red}No access token available for personal account${colors.reset}`);
    }
  } else {
    console.log(`${colors.yellow}Personal account not configured${colors.reset}`);
  }

  console.log(`\n${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.green}Test Complete!${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}`);
}

// Run the tests
runTests().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});