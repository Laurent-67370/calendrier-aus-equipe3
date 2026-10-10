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

// GET ?matchId=XXX&v=VERSION -> image JPEG (binaire).
// La version change à chaque nouvel envoi : l'URL est donc immuable et le navigateur peut la garder en cache.
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
    const base64 = String(snap.data().image || '').replace(/^data:image\/jpeg;base64,/, '');
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=31536000, immutable' },
      body: base64,
      isBase64Encoded: true,
    };
  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
};
