const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}
const db = admin.firestore();

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { matchId, score } = JSON.parse(event.body);
    if (typeof score.alsatia !== 'number' || typeof score.opponent !== 'number') {
        return { statusCode: 400, body: 'Invalid score format' };
    }
    await db.collection('matches-equipe3').doc(matchId).update({ score });
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Score updated successfully' }),
    };
  } catch (error) {
    console.error("Error updating score: ", error);
    return { statusCode: 500, body: error.toString() };
  }
};