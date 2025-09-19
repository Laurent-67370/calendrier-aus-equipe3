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
    const players = JSON.parse(event.body);
    const batch = db.batch();

    players.forEach(player => {
      const docRef = db.collection('players-equipe3').doc(String(player.id));
      batch.set(docRef, player);
    });

    await batch.commit();
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Players updated successfully' }),
    };
  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
};