const { google } = require("googleapis");
const readline = require("readline");
require("dotenv").config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const SCOPES = ["https://www.googleapis.com/auth/tasks"];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function getAccessToken() {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline", // ensures refresh_token is returned
    scope: SCOPES, // scopes you are requesting
    prompt: "consent", // force consent to get refresh_token again
    response_type: "code", // REQUIRED for response_type=code
  });

  console.log("\n Visit this URL to authorize the app:\n", authUrl);

  rl.question("\n Paste the code here: ", async (code) => {
    try {
      const { tokens } = await oauth2Client.getToken(code);
      console.log("\n Refresh Token:\n", tokens.refresh_token);
      rl.close();
    } catch (error) {
      console.error(
        " Failed to get token:",
        error.response?.data || error.message
      );
      rl.close();
    }
  });
}

getAccessToken();
