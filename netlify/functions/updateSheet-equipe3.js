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

// Un document Firestore est limité à 1 Mo : l'image (data URL JPEG) doit rester sous ce seuil.
const MAX_IMAGE_LENGTH = 900000;

// Enregistre (ou supprime) la photo de la feuille de match d'une rencontre.
// POST { matchId, image }          -> enregistre la photo (data URL JPEG)
// POST { matchId, action:'delete' } -> supprime la photo
exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { matchId, image, action } = JSON.parse(event.body || '{}');
    if (!matchId || typeof matchId !== 'string') {
      return { statusCode: 400, body: 'matchId manquant' };
    }

    const matchRef = db.collection('matches-equipe3').doc(matchId);
    const matchSnap = await matchRef.get();
    if (!matchSnap.exists) {
      return { statusCode: 404, body: 'Match introuvable' };
    }
    const sheetRef = db.collection('sheets-equipe3').doc(matchId);

    if (action === 'delete') {
      await sheetRef.delete();
      await matchRef.update({ hasSheet: false });
      return { statusCode: 200, body: JSON.stringify({ message: 'Feuille supprimée' }) };
    }

    if (typeof image !== 'string' || !image.startsWith('data:image/jpeg;base64,')) {
      return { statusCode: 400, body: 'Image JPEG invalide' };
    }
    if (image.length > MAX_IMAGE_LENGTH) {
      return { statusCode: 413, body: 'Image trop volumineuse' };
    }

    await sheetRef.set({ image, updatedAt: new Date().toISOString() });
    await matchRef.update({ hasSheet: true });

    return { statusCode: 200, body: JSON.stringify({ message: 'Feuille enregistrée' }) };
  } catch (error) {
    console.error('Error updating sheet: ', error);
    return { statusCode: 500, body: error.toString() };
  }
};
