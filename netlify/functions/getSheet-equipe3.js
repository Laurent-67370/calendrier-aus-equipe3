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

// GET ?matchId=XXX -> { image, updatedAt } ou 404 si aucune feuille enregistrée
exports.handler = async function(event, context) {
  try {
    const matchId = event.queryStringParameters && event.queryStringParameters.matchId;
    if (!matchId) {
      return { statusCode: 400, body: 'matchId manquant' };
    }
    const snap = await db.collection('sheets-equipe3').doc(matchId).get();
    if (!snap.exists) {
      return { statusCode: 404, body: 'Aucune feuille pour ce match' };
    }
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      body: JSON.stringify(snap.data()),
    };
  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
};
